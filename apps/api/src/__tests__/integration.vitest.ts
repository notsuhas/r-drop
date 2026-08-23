// Integration tests: the real worker on Miniflare with real R2 + D1 bindings.
// The bearer-token path is exercised end-to-end; WorkOS session flows are
// external and covered manually.
import { env, SELF } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { sha256 } from "hono/utils/crypto";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/db/schema";
import { markInviteUsed } from "@/lib/invites";

const APP = "https://app.test";

async function seedToken(token: string, scope: "read" | "write" = "write") {
  const hash = (await sha256(token)) ?? "";
  await env.DB.prepare(
    "INSERT INTO api_tokens (id, name, hash, user_id, prefix, scope, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), "test", hash, "user_test", token.slice(0, 8), scope, Date.now())
    .run();
}

const WRITE_TOKEN = "rd_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const READ_TOKEN = "rd_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

function upload(token: string, folder: string, name: string, contents = "payload") {
  const form = new FormData();
  form.set("folder", folder);
  form.set("file", new File([contents], name, { type: "image/png" }));
  return SELF.fetch(`${APP}/api/upload`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
}

beforeEach(async () => {
  await env.DB.prepare("DELETE FROM api_tokens").run();
  await env.DB.prepare("DELETE FROM invites").run();
  const listed = await env.BUCKET.list();
  for (const obj of listed.objects) await env.BUCKET.delete(obj.key);
  await seedToken(WRITE_TOKEN, "write");
  await seedToken(READ_TOKEN, "read");
});

describe("public endpoints", () => {
  it("health", async () => {
    const res = await SELF.fetch(`${APP}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("config exposes the cdn base", async () => {
    const res = await SELF.fetch(`${APP}/api/config`);
    expect(await res.json()).toEqual({ publicBase: "https://cdn.test" });
  });

  it("cdn root serves the landing page", async () => {
    const res = await SELF.fetch("https://cdn.test/");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("r·drop");
  });

  it("unknown api routes are json 404s", async () => {
    const res = await SELF.fetch(`${APP}/api/nope`);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not found" });
  });
});

describe("auth", () => {
  it("rejects missing auth", async () => {
    const res = await SELF.fetch(`${APP}/api/me`);
    expect(res.status).toBe(401);
  });

  it("rejects malformed bearer tokens without touching the db", async () => {
    const res = await SELF.fetch(`${APP}/api/me`, {
      headers: { authorization: "Bearer garbage" },
    });
    expect(res.status).toBe(401);
  });

  it("rejects well-formed but unknown tokens", async () => {
    const res = await SELF.fetch(`${APP}/api/me`, {
      headers: { authorization: "Bearer rd_cccccccccccccccccccccccccccccccc" },
    });
    expect(res.status).toBe(401);
  });

  it("accepts a valid token and reports the actor", async () => {
    const res = await SELF.fetch(`${APP}/api/me`, {
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { actor: { type: string }; isAdmin: boolean };
    expect(body.actor.type).toBe("token");
    expect(body.isAdmin).toBe(false);
  });

  it("read-scope tokens cannot write", async () => {
    const res = await upload(READ_TOKEN, "scratch", "x.png");
    expect(res.status).toBe(403);
  });

  it("tokens cannot reach admin routes", async () => {
    const res = await SELF.fetch(`${APP}/api/invites`, {
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
    });
    expect(res.status).toBe(403);
  });

  it("tokens cannot manage tokens (session required)", async () => {
    const res = await SELF.fetch(`${APP}/api/tokens`, {
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
    });
    expect(res.status).toBe(403);
  });
});

describe("upload", () => {
  it("stores the object with slugified key, immutable caching, and a manifest", async () => {
    const res = await upload(WRITE_TOKEN, "checkout-v2", "Hero Banner.PNG");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { key: string; url: string };
    expect(body.key).toBe("checkout-v2/hero-banner.png");
    expect(body.url).toBe("https://cdn.test/checkout-v2/hero-banner.png");

    const obj = await env.BUCKET.get(body.key);
    expect(obj).not.toBeNull();
    expect(obj?.httpMetadata?.cacheControl).toBe("public, max-age=31536000, immutable");

    const manifest = await env.BUCKET.get("_manifest/checkout-v2.json");
    expect(manifest).not.toBeNull();
    expect(manifest?.httpMetadata?.cacheControl).toBe("no-cache");
    const parsed = (await manifest?.json()) as { count: number; assets: Record<string, string> };
    expect(parsed.count).toBe(1);
    expect(parsed.assets.heroBanner).toBe("https://cdn.test/checkout-v2/hero-banner.png");
  });

  it("rejects the reserved folder", async () => {
    const res = await upload(WRITE_TOKEN, "_manifest", "x.png");
    expect(res.status).toBe(400);
  });

  it("rejects empty files", async () => {
    const res = await upload(WRITE_TOKEN, "scratch", "x.png", "");
    expect(res.status).toBe(400);
  });

  it("rejects requests without a file field", async () => {
    const form = new FormData();
    form.set("folder", "scratch");
    const res = await SELF.fetch(`${APP}/api/upload`, {
      method: "POST",
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
      body: form,
    });
    expect(res.status).toBe(400);
  });
});

describe("objects", () => {
  it("lists uploads and hides the manifest namespace", async () => {
    await upload(WRITE_TOKEN, "checkout-v2", "a.png");
    const res = await SELF.fetch(`${APP}/api/objects?prefix=checkout-v2`, {
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
    });
    const body = (await res.json()) as {
      objects: { key: string; contentType: string }[];
      folders: string[];
    };
    expect(body.objects.map((o) => o.key)).toEqual(["checkout-v2/a.png"]);
    expect(body.objects[0].contentType).toBe("image/png");
  });

  it("root listing hides the _manifest namespace and reports folder sizes", async () => {
    await upload(WRITE_TOKEN, "checkout-v2", "a.png", "seven77");
    await upload(WRITE_TOKEN, "checkout-v2", "b.png", "four");
    const res = await SELF.fetch(`${APP}/api/objects?prefix=`, {
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
    });
    const body = (await res.json()) as {
      folders: { name: string; size: number }[];
      totalSize: number;
    };
    expect(body.folders).toEqual([{ name: "checkout-v2", size: 11 }]);
    expect(body.totalSize).toBe(11);
  });

  it("delete removes the object and empties the manifest", async () => {
    await upload(WRITE_TOKEN, "e2e", "a.png");
    const res = await SELF.fetch(`${APP}/api/objects/e2e/a.png`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
    });
    expect(res.status).toBe(200);
    expect(await env.BUCKET.get("e2e/a.png")).toBeNull();
    expect(await env.BUCKET.get("_manifest/e2e.json")).toBeNull();
  });

  it("manifests cannot be deleted through the api", async () => {
    await upload(WRITE_TOKEN, "e2e", "a.png");
    const res = await SELF.fetch(`${APP}/api/objects/_manifest/e2e.json`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
    });
    expect(res.status).toBe(400);
    expect(await env.BUCKET.get("_manifest/e2e.json")).not.toBeNull();
  });

  it("rename moves the object and regenerates both manifests", async () => {
    await upload(WRITE_TOKEN, "old", "pic.png");
    const res = await SELF.fetch(`${APP}/api/objects/rename`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${WRITE_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ key: "old/pic.png", newKey: "new/Hero Pic.png" }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()) as object).toEqual({
      key: "new/hero-pic.png",
      url: "https://cdn.test/new/hero-pic.png",
    });
    expect(await env.BUCKET.get("old/pic.png")).toBeNull();
    expect(await env.BUCKET.get("new/hero-pic.png")).not.toBeNull();
    expect(await env.BUCKET.get("_manifest/old.json")).toBeNull();
    const manifest = (await (await env.BUCKET.get("_manifest/new.json"))?.json()) as {
      assets: Record<string, string>;
    };
    expect(manifest.assets.heroPic).toBe("https://cdn.test/new/hero-pic.png");
  });

  it("rename refuses reserved destinations", async () => {
    await upload(WRITE_TOKEN, "old", "pic.png");
    const res = await SELF.fetch(`${APP}/api/objects/rename`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${WRITE_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ key: "old/pic.png", newKey: "_manifest/pic.png" }),
    });
    expect(res.status).toBe(400);
  });

  it("rename 404s on missing objects", async () => {
    const res = await SELF.fetch(`${APP}/api/objects/rename`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${WRITE_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ key: "nope/x.png", newKey: "new/x.png" }),
    });
    expect(res.status).toBe(404);
  });

  it("manifest endpoint regenerates on demand", async () => {
    await upload(WRITE_TOKEN, "kit", "arrow-left.svg");
    const res = await SELF.fetch(`${APP}/api/manifest/kit`, {
      headers: { authorization: `Bearer ${READ_TOKEN}` },
    });
    const body = (await res.json()) as { folder: string; assets: Record<string, string> };
    expect(body.folder).toBe("kit");
    expect(body.assets.arrowLeft).toBe("https://cdn.test/kit/arrow-left.svg");
  });
});

describe("oauth flow", () => {
  it("login redirects to workos with a state parameter and sets the state cookie", async () => {
    const res = await SELF.fetch(`${APP}/api/auth/login`, { redirect: "manual" });
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location") ?? "");
    const state = location.searchParams.get("state");
    expect(state).toBeTruthy();
    expect(location.searchParams.get("provider")).toBe("GoogleOAuth");
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`rdrop_oauth_state=${state}`);
    expect(cookie).toContain("HttpOnly");
  });

  it("callback rejects a state mismatch without exchanging the code", async () => {
    const res = await SELF.fetch(`${APP}/api/auth/callback?code=x&state=forged`, {
      redirect: "manual",
      headers: { cookie: "rdrop_oauth_state=legit" },
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/?error=auth_failed");
  });

  it("callback rejects a missing state cookie", async () => {
    const res = await SELF.fetch(`${APP}/api/auth/callback?code=x&state=anything`, {
      redirect: "manual",
    });
    expect(res.headers.get("location")).toBe("/?error=auth_failed");
  });

  it("logout is POST-only and clears the session cookie", async () => {
    const get = await SELF.fetch(`${APP}/api/auth/logout`);
    expect(get.status).toBe(404);
    const post = await SELF.fetch(`${APP}/api/auth/logout`, { method: "POST" });
    expect(post.status).toBe(200);
    expect((await post.json()) as object).toEqual({ logoutUrl: null });
    expect(post.headers.get("set-cookie")).toContain("rdrop_session=;");
  });
});

describe("upload content-type guard", () => {
  it("rejects html uploads", async () => {
    const form = new FormData();
    form.set("folder", "scratch");
    form.set("file", new File(["<script>alert(1)</script>"], "page.html", { type: "text/html" }));
    const res = await SELF.fetch(`${APP}/api/upload`, {
      method: "POST",
      headers: { authorization: `Bearer ${WRITE_TOKEN}` },
      body: form,
    });
    expect(res.status).toBe(400);
  });
});

// The invite row is what the People page reads to decide Active vs Pending.
// Stamping used to live inside the invite-gate branch, which admins skip, so an
// admin who was also invited showed "hasn't signed in yet" forever.
describe("invite sign-in stamp", () => {
  const db = () => drizzle(env.DB, { schema });

  async function seedInvite(email: string, usedAt: number | null = null) {
    await env.DB.prepare(
      "INSERT INTO invites (email, created_by, created_at, used_at) VALUES (?, ?, ?, ?)",
    )
      .bind(email, "admin", Date.now(), usedAt)
      .run();
  }

  const readUsedAt = async (email: string) =>
    (
      await env.DB.prepare("SELECT used_at FROM invites WHERE email = ?").bind(email).first<{
        used_at: number | null;
      }>()
    )?.used_at ?? null;

  it("stamps a pending invite", async () => {
    await seedInvite("someone@test.dev");
    await markInviteUsed(db(), "someone@test.dev", 1000);
    expect(await readUsedAt("someone@test.dev")).toBe(1000);
  });

  it("keeps the first timestamp on later sign-ins", async () => {
    await seedInvite("someone@test.dev");
    await markInviteUsed(db(), "someone@test.dev", 1000);
    await markInviteUsed(db(), "someone@test.dev", 2000);
    expect(await readUsedAt("someone@test.dev")).toBe(1000);
  });

  it("matches case-insensitively, since providers do not fix casing", async () => {
    await seedInvite("someone@test.dev");
    await markInviteUsed(db(), "SomeOne@Test.dev", 1000);
    expect(await readUsedAt("someone@test.dev")).toBe(1000);
  });

  it("is a no-op for an admin who was never invited", async () => {
    await expect(markInviteUsed(db(), "admin@test.dev", 1000)).resolves.toBeDefined();
    expect(await readUsedAt("admin@test.dev")).toBeNull();
  });
});

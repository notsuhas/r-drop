import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { createAuth } from "./auth";
import * as schema from "./db/schema";
import type { Bindings } from "./bindings";

type Actor =
  | { type: "user"; userId: string; email: string }
  | { type: "token"; userId: string; tokenId: string };

type Env = { Bindings: Bindings; Variables: { actor: Actor } };

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const slugify = (s: string) => {
  const dot = s.lastIndexOf(".");
  const [base, ext] = dot > 0 ? [s.slice(0, dot), s.slice(dot)] : [s, ""];
  return (
    base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") +
    ext.toLowerCase()
  );
};

const camelCase = (s: string) =>
  s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase());

const cleanFolder = (f: string) => f.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "");

async function regenerateManifest(env: Bindings, folder: string) {
  const listed = await env.BUCKET.list({ prefix: `${folder}/`, limit: 1000 });
  const assets = Object.fromEntries(
    listed.objects
      .filter((o) => !o.key.endsWith("/"))
      .map((o) => {
        const name = o.key.slice(folder.length + 1);
        return [camelCase(name.replace(/\.[^.]+$/, "")), `${env.PUBLIC_BASE}/${o.key}`];
      }),
  );
  const body = JSON.stringify({ folder, count: Object.keys(assets).length, assets }, null, 2);
  await env.BUCKET.put(`_manifest/${folder}.json`, body, {
    httpMetadata: { contentType: "application/json", cacheControl: "no-cache" },
  });
}

const requireAuth = (scope: "read" | "write" = "read") =>
  createMiddleware<Env>(async (c, next) => {
    const bearer = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (bearer) {
      const db = drizzle(c.env.DB, { schema });
      const hash = await sha256(bearer);
      const token = await db.query.apiTokens.findFirst({ where: eq(schema.apiTokens.hash, hash) });
      if (!token) return c.json({ error: "invalid token" }, 401);
      if (scope === "write" && token.scope !== "write")
        return c.json({ error: "insufficient scope" }, 403);
      c.executionCtx.waitUntil(
        db.update(schema.apiTokens).set({ lastUsedAt: Date.now() }).where(eq(schema.apiTokens.id, token.id)).run(),
      );
      c.set("actor", { type: "token", userId: token.userId, tokenId: token.id });
      return next();
    }
    const session = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "unauthorized" }, 401);
    c.set("actor", { type: "user", userId: session.user.id, email: session.user.email });
    return next();
  });

const requireAdmin = createMiddleware<Env>(async (c, next) => {
  const actor = c.get("actor");
  if (actor.type !== "user" || actor.email !== c.env.ADMIN_EMAIL)
    return c.json({ error: "admin only" }, 403);
  return next();
});

const app = new Hono<Env>()
  .get("/api/health", (c) => c.json({ ok: true }))
  .on(["POST", "GET"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw))

  .get("/api/me", requireAuth(), (c) => {
    const actor = c.get("actor");
    return c.json({
      actor,
      isAdmin: actor.type === "user" && actor.email === c.env.ADMIN_EMAIL,
    });
  })

  .get("/api/objects", requireAuth(), async (c) => {
    const prefix = cleanFolder(c.req.query("prefix") ?? "");
    const listed = await c.env.BUCKET.list({
      prefix: prefix ? `${prefix}/` : "",
      delimiter: "/",
      limit: 1000,
    });
    return c.json({
      folders: listed.delimitedPrefixes.map((p) => p.replace(/\/$/, "")),
      objects: listed.objects.map((o) => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded.toISOString(),
        contentType: o.httpMetadata?.contentType ?? "",
        url: `${c.env.PUBLIC_BASE}/${o.key}`,
      })),
    });
  })

  .post("/api/upload", requireAuth("write"), async (c) => {
    const form = await c.req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return c.json({ error: "no file" }, 400);
    const folder = cleanFolder((form.get("folder") as string) || "scratch") || "scratch";
    const key = `${folder}/${slugify(file.name)}`;
    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    await regenerateManifest(c.env, folder);
    return c.json({
      key,
      url: `${c.env.PUBLIC_BASE}/${key}`,
      manifestUrl: `${c.env.PUBLIC_BASE}/_manifest/${folder}.json`,
      size: file.size,
      contentType: file.type,
    });
  })

  .delete("/api/objects/:key{.+}", requireAuth("write"), async (c) => {
    const key = c.req.param("key");
    await c.env.BUCKET.delete(key);
    const folder = key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";
    if (folder && !folder.startsWith("_manifest")) await regenerateManifest(c.env, folder);
    return c.json({ deleted: key });
  })

  .get("/api/manifest/:folder{.+}", requireAuth(), async (c) => {
    const folder = cleanFolder(c.req.param("folder"));
    await regenerateManifest(c.env, folder);
    const obj = await c.env.BUCKET.get(`_manifest/${folder}.json`);
    return c.json(await obj!.json());
  })

  .get("/api/invites", requireAuth(), requireAdmin, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    return c.json(await db.query.invites.findMany());
  })

  .post("/api/invites", requireAuth(), requireAdmin, async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    if (!email?.includes("@")) return c.json({ error: "invalid email" }, 400);
    const db = drizzle(c.env.DB, { schema });
    const actor = c.get("actor");
    await db
      .insert(schema.invites)
      .values({ email: email.toLowerCase(), createdBy: actor.userId, createdAt: Date.now() })
      .onConflictDoNothing();
    return c.json({ email: email.toLowerCase() });
  })

  .delete("/api/invites/:email", requireAuth(), requireAdmin, async (c) => {
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.invites).where(eq(schema.invites.email, c.req.param("email")));
    return c.json({ deleted: c.req.param("email") });
  })

  .get("/api/tokens", requireAuth(), async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const actor = c.get("actor");
    const rows = await db.query.apiTokens.findMany({
      where: eq(schema.apiTokens.userId, actor.userId),
      columns: { hash: false },
    });
    return c.json(rows);
  })

  .post("/api/tokens", requireAuth(), async (c) => {
    const actor = c.get("actor");
    if (actor.type !== "user") return c.json({ error: "session required" }, 403);
    const { name, scope = "write" } = await c.req.json<{ name: string; scope?: string }>();
    if (!name) return c.json({ error: "name required" }, 400);
    const token = `hod_${crypto.randomUUID().replaceAll("-", "")}`;
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.apiTokens).values({
      id: crypto.randomUUID(),
      name,
      hash: await sha256(token),
      userId: actor.userId,
      prefix: token.slice(0, 8),
      scope: scope === "read" ? "read" : "write",
      createdAt: Date.now(),
    });
    return c.json({ token, name });
  })

  .delete("/api/tokens/:id", requireAuth(), async (c) => {
    const actor = c.get("actor");
    if (actor.type !== "user") return c.json({ error: "session required" }, 403);
    const db = drizzle(c.env.DB, { schema });
    await db
      .delete(schema.apiTokens)
      .where(and(eq(schema.apiTokens.id, c.req.param("id")), eq(schema.apiTokens.userId, actor.userId)));
    return c.json({ deleted: c.req.param("id") });
  });

export type AppType = typeof app;
export default app;

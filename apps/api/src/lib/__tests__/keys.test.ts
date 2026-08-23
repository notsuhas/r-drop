import { describe, expect, test } from "bun:test";
import { camelCase, cleanFolder, isCleanKey, isReservedKey, slugify } from "@/lib/keys";
import { buildManifest } from "@/lib/manifest";

describe("slugify", () => {
  test("lowercases and dashes", () =>
    expect(slugify("Hero Banner v2.PNG")).toBe("hero-banner-v2.png"));
  test("empty base falls back", () => expect(slugify("???.png")).toBe("file.png"));
  test("no extension", () => expect(slugify("My File")).toBe("my-file"));
  test("dotfile treated as extensionless", () => expect(slugify(".env")).toBe("env"));
});

describe("camelCase", () => {
  test("dashes to camel", () => expect(camelCase("hero-banner-v2")).toBe("heroBannerV2"));
  test("leading upper lowered", () => expect(camelCase("Logo")).toBe("logo"));
});

describe("cleanFolder", () => {
  test("strips slashes and junk", () => expect(cleanFolder("/checkout v2/")).toBe("checkoutv2"));
  test("collapses doubles", () => expect(cleanFolder("a//b")).toBe("a/b"));
  test("empty stays empty", () => expect(cleanFolder("///")).toBe(""));
  // Illegal characters used to be removed after the outer slashes were
  // stripped, so the dots here left a leading slash behind.
  test("dot segments leave no leading slash", () => expect(cleanFolder("../../etc")).toBe("etc"));
  test("interior dot segments collapse", () => expect(cleanFolder("a/../b")).toBe("a/b"));
  test("a folder is never absolute", () => expect(cleanFolder("/abs/path")).toBe("abs/path"));
});

describe("isCleanKey", () => {
  test("ordinary key", () => expect(isCleanKey("shots/hero.png")).toBe(true));
  test("root-level key", () => expect(isCleanKey("hero.png")).toBe(true));
  test("dot segments rejected", () => expect(isCleanKey("a/../b/x.png")).toBe(false));
  test("reserved rejected", () => expect(isCleanKey("_manifest/a.json")).toBe(false));
  test("trailing slash rejected", () => expect(isCleanKey("shots/")).toBe(false));
  test("empty rejected", () => expect(isCleanKey("")).toBe(false));
});

describe("isReservedKey", () => {
  test("manifest prefix reserved", () => expect(isReservedKey("_manifest/x.json")).toBe(true));
  test("plain folder fine", () => expect(isReservedKey("checkout/_manifest.png")).toBe(false));
});

describe("buildManifest", () => {
  test("camelCase keys, extension stripped, folder-relative", () => {
    const objects = [
      { key: "checkout-v2/hero-banner.png" },
      { key: "checkout-v2/icons/arrow-left.svg" },
      { key: "checkout-v2/sub/" },
    ] as unknown as Parameters<typeof buildManifest>[2];
    const m = buildManifest("https://cdn.example", "checkout-v2", objects);
    expect(m).toEqual({
      folder: "checkout-v2",
      count: 2,
      assets: {
        heroBanner: "https://cdn.example/checkout-v2/hero-banner.png",
        iconsArrowLeft: "https://cdn.example/checkout-v2/icons/arrow-left.svg",
      },
    });
  });
});

// Three real objects used to publish a manifest of one, and report count: 1.
describe("buildManifest collisions", () => {
  const build = (keys: string[]) =>
    buildManifest(
      "https://cdn.example",
      "f",
      keys.map((key) => ({ key })) as unknown as Parameters<typeof buildManifest>[2],
    );

  test("names that camelCase alike are all kept", () => {
    const m = build(["f/logo-dark.png", "f/logo_dark.svg", "f/logoDark.jpg"]);
    expect(m.count).toBe(3);
    expect(Object.keys(m.assets).sort()).toEqual(["logoDark", "logoDarkJpg", "logoDarkSvg"]);
  });

  test("first one in keeps the plain name", () => {
    const m = build(["f/logo-dark.png", "f/logo_dark.svg"]);
    expect(m.assets.logoDark).toBe("https://cdn.example/f/logo-dark.png");
  });

  test("identical extensions fall back to a numeric suffix", () => {
    const m = build(["f/a-b.png", "f/a_b.png", "f/a.b.png"]);
    expect(m.count).toBe(3);
    expect(Object.keys(m.assets)).toContain("aB2");
  });
});

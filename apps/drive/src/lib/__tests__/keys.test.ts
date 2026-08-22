import { describe, expect, test } from "bun:test";
import { camelCase, cleanFolder, isReservedKey, slugify } from "../keys";
import { buildManifest } from "../manifest";

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

import { describe, expect, test } from "bun:test";
import { formatLinks } from "../links";

const objects = [
  { key: "checkout/hero-banner.png", url: "https://cdn.x/checkout/hero-banner.png" },
  { key: "checkout/arrow-left.svg", url: "https://cdn.x/checkout/arrow-left.svg" },
];

describe("formatLinks", () => {
  test("newline", () =>
    expect(formatLinks(objects, "newline", "checkout", "https://cdn.x")).toBe(
      "https://cdn.x/checkout/hero-banner.png\nhttps://cdn.x/checkout/arrow-left.svg",
    ));

  test("json", () =>
    expect(JSON.parse(formatLinks(objects, "json", "checkout", "https://cdn.x"))).toEqual({
      heroBanner: "https://cdn.x/checkout/hero-banner.png",
      arrowLeft: "https://cdn.x/checkout/arrow-left.svg",
    }));

  test("ts const", () => {
    const out = formatLinks(objects, "ts", "checkout", "https://cdn.x");
    expect(out).toContain("export const ASSETS = {");
    expect(out).toContain('  heroBanner: "https://cdn.x/checkout/hero-banner.png",');
    expect(out).toContain("} as const;");
  });

  test("manifest url", () =>
    expect(formatLinks(objects, "manifest", "checkout", "https://cdn.x")).toBe(
      "https://cdn.x/_manifest/checkout.json",
    ));
});

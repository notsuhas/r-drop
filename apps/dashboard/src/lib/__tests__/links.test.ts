import { describe, expect, test } from "bun:test";
import { describeCopy, folderLabel, formatLinks } from "@/lib/links";

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

describe("folderLabel", () => {
  test("strips the parent prefix", () => expect(folderLabel("a/b", "a")).toBe("b"));
  test("root folders keep their full name", () => expect(folderLabel("a", "")).toBe("a"));
  test("a non-matching parent leaves the name alone", () =>
    expect(folderLabel("a/b", "z")).toBe("a/b"));
  test("nested under a nested parent", () => expect(folderLabel("a/b/c", "a/b")).toBe("c"));
});

describe("describeCopy", () => {
  test("single URL is singular", () => expect(describeCopy("newline", 1)).toBe("Copied 1 URL"));
  test("multiple URLs are plural", () => expect(describeCopy("newline", 3)).toBe("Copied 3 URLs"));
  test("manifest ignores the count", () =>
    expect(describeCopy("manifest", 9)).toBe("Copied manifest URL"));
  test("json names the format", () =>
    expect(describeCopy("json", 2)).toBe("Copied JSON for 2 files"));
});

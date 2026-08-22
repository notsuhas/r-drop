import { describe, expect, test } from "bun:test";
import { basename, camelCase, extension, fileKind, fmtSize, fmtWhen } from "@/lib/format";

describe("fmtSize", () => {
  test("bytes", () => expect(fmtSize(512)).toBe("512 B"));
  test("kilobytes", () => expect(fmtSize(2048)).toBe("2.0 KB"));
  test("megabytes", () => expect(fmtSize(3 * 1048576)).toBe("3.0 MB"));
  test("gigabytes", () => expect(fmtSize(2 * 1073741824)).toBe("2.0 GB"));
});

describe("camelCase", () => {
  test("strips extension and camels", () =>
    expect(camelCase("hero-banner-v2.png")).toBe("heroBannerV2"));
});

describe("basename / extension", () => {
  test("basename of nested key", () => expect(basename("a/b/c.png")).toBe("c.png"));
  test("extension lowercased", () => expect(extension("Logo.PNG")).toBe("png"));
  test("no extension", () => expect(extension("Makefile")).toBe(""));
});

describe("fileKind", () => {
  test("riv extension wins over content type", () =>
    expect(fileKind("application/octet-stream", "anims/loader.riv")).toBe("rive"));
  test("image", () => expect(fileKind("image/png", "x.png")).toBe("image"));
  test("video", () => expect(fileKind("video/mp4", "x.mp4")).toBe("video"));
  test("audio", () => expect(fileKind("audio/mpeg", "x.mp3")).toBe("audio"));
  test("pdf", () => expect(fileKind("application/pdf", "x.pdf")).toBe("pdf"));
  test("font by extension", () =>
    expect(fileKind("application/octet-stream", "x.woff2")).toBe("font"));
  test("archive by extension", () => expect(fileKind("application/zip", "x.zip")).toBe("archive"));
  test("fallback", () => expect(fileKind("application/x-thing", "x.bin")).toBe("other"));
});

describe("fmtWhen", () => {
  test("fresh uploads read as just now", () =>
    expect(fmtWhen(new Date().toISOString())).toBe("just now"));
  test("minutes ago", () =>
    expect(fmtWhen(new Date(Date.now() - 5 * 60_000).toISOString())).toBe("5 min ago"));
  test("hours ago", () =>
    expect(fmtWhen(new Date(Date.now() - 3 * 3_600_000).toISOString())).toBe("3 hours ago"));
  test("invalid input degrades to a dash", () => expect(fmtWhen("not-a-date")).toBe("—"));
});

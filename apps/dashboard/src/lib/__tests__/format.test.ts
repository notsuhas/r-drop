import { describe, expect, test } from "bun:test";
import { basename, camelCase, extension, fileKind, fmtSize } from "../format";

describe("fmtSize", () => {
  test("bytes", () => expect(fmtSize(512)).toBe("512 B"));
  test("kilobytes", () => expect(fmtSize(2048)).toBe("2.0 KB"));
  test("megabytes", () => expect(fmtSize(3 * 1048576)).toBe("3.0 MB"));
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
  test("riv wins over content type", () =>
    expect(fileKind("application/octet-stream", "anims/loader.riv")).toBe("rive"));
  test("image", () => expect(fileKind("image/png", "x.png")).toBe("image"));
  test("video", () => expect(fileKind("video/mp4", "x.mp4")).toBe("video"));
  test("audio", () => expect(fileKind("audio/mpeg", "x.mp3")).toBe("audio"));
  test("fallback", () => expect(fileKind("application/pdf", "x.pdf")).toBe("other"));
});

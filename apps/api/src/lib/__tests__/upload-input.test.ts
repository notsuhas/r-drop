import { describe, expect, test } from "bun:test";
import { MAX_UPLOAD_BYTES, resolveUpload } from "../upload-input";

const form = (entries: Record<string, string | File>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
};

describe("resolveUpload", () => {
  test("happy path slugifies into folder", () => {
    const r = resolveUpload(form({ folder: "checkout", file: new File(["x"], "Hero Pic.PNG") }));
    expect(r).toMatchObject({ ok: true, key: "checkout/hero-pic.png", folder: "checkout" });
  });

  test("defaults to scratch", () => {
    const r = resolveUpload(form({ file: new File(["x"], "a.png") }));
    expect(r).toMatchObject({ ok: true, folder: "scratch" });
  });

  test("missing file rejected", () =>
    expect(resolveUpload(form({ folder: "a" }))).toMatchObject({ ok: false, status: 400 }));

  test("empty file rejected", () =>
    expect(resolveUpload(form({ file: new File([], "a.png") }))).toMatchObject({
      ok: false,
      status: 400,
    }));

  test("oversized file rejected", () => {
    const big = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "big.bin");
    expect(resolveUpload(form({ file: big }))).toMatchObject({ ok: false, status: 413 });
  });

  test("reserved folder rejected", () =>
    expect(
      resolveUpload(form({ folder: "_manifest", file: new File(["x"], "a.png") })),
    ).toMatchObject({ ok: false, status: 400 }));
});

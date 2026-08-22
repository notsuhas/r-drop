import { describe, expect, test } from "bun:test";
import { resolveRenameTarget } from "../rename";

describe("resolveRenameTarget", () => {
  test("rename within folder", () =>
    expect(resolveRenameTarget("a/x.png", "a/New Name.PNG")).toEqual({
      ok: true,
      newKey: "a/new-name.png",
      oldFolder: "a",
      newFolder: "a",
    }));

  test("move across folders", () => {
    const r = resolveRenameTarget("a/x.png", "b/x.png");
    expect(r).toMatchObject({ ok: true, newKey: "b/x.png", oldFolder: "a", newFolder: "b" });
  });

  test("missing key rejected", () =>
    expect(resolveRenameTarget(undefined, "a/x.png").ok).toBe(false));

  test("reserved source rejected", () =>
    expect(resolveRenameTarget("_manifest/a.json", "b/a.json").ok).toBe(false));

  test("reserved destination rejected", () =>
    expect(resolveRenameTarget("a/x.png", "_manifest/x.png").ok).toBe(false));

  test("bare name without folder rejected", () =>
    expect(resolveRenameTarget("a/x.png", "x.png").ok).toBe(false));
});

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";

const uploadCalls: { filename: string; folder: string }[] = [];
let failFor: string | null = null;

let releaseInflight: (() => void) | null = null;

mock.module("@/lib/upload", () => ({
  uploadWithProgress: async (
    _bytes: ArrayBuffer,
    filename: string,
    _type: string,
    folder: string,
    onProgress: (f: number) => void,
    signal?: AbortSignal,
  ) => {
    uploadCalls.push({ filename, folder });
    onProgress(0.5);
    if (filename === "hold.png")
      await new Promise<void>((resolve) => {
        releaseInflight = resolve;
      });
    if (signal?.aborted) throw new DOMException("cancelled", "AbortError");
    if (filename === failFor) throw new Error("boom");
    onProgress(1);
    return { key: `${folder}/${filename}`, url: "u", manifestUrl: "m", size: 1, contentType: "" };
  },
}));

const { useUploads } = await import("@/hooks/useUploads");

describe("useUploads", () => {
  beforeEach(() => {
    uploadCalls.length = 0;
    failFor = null;
    releaseInflight = null;
  });

  test("drains the queue sequentially and reports per-file completion", async () => {
    let uploaded = 0;
    const { result } = renderHook(() => useUploads(() => uploaded++));
    act(() =>
      result.current.enqueue([
        { file: new File(["a"], "a.png"), folder: "kit" },
        { file: new File(["b"], "b.png"), folder: "kit/icons" },
      ]),
    );
    await waitFor(() => expect(result.current.active).toBe(false));
    expect(result.current.items.map((i) => i.status)).toEqual(["done", "done"]);
    expect(uploadCalls).toEqual([
      { filename: "a.png", folder: "kit" },
      { filename: "b.png", folder: "kit/icons" },
    ]);
    expect(uploaded).toBe(2);
  });

  test("a failing file is reported and does not block the rest", async () => {
    failFor = "bad.png";
    const { result } = renderHook(() => useUploads(() => {}));
    act(() =>
      result.current.enqueue([
        { file: new File(["x"], "bad.png"), folder: "kit" },
        { file: new File(["y"], "good.png"), folder: "kit" },
      ]),
    );
    await waitFor(() => expect(result.current.active).toBe(false));
    const [bad, good] = result.current.items;
    expect(bad.status).toBe("error");
    expect(bad.error).toBe("boom");
    expect(good.status).toBe("done");
  });

  test("cancelling a queued item skips it; aborting an inflight one marks it cancelled", async () => {
    const { result } = renderHook(() => useUploads(() => {}));
    act(() =>
      result.current.enqueue([
        { file: new File(["a"], "hold.png"), folder: "kit" },
        { file: new File(["b"], "later.png"), folder: "kit" },
      ]),
    );
    await waitFor(() => expect(result.current.items[0].status).toBe("uploading"));
    act(() => result.current.cancel(result.current.items[1].id));
    act(() => result.current.cancel(result.current.items[0].id));
    act(() => releaseInflight?.());
    await waitFor(() => expect(result.current.active).toBe(false));
    expect(result.current.items.map((i) => i.status)).toEqual(["cancelled", "cancelled"]);
    expect(uploadCalls.map((c) => c.filename)).toEqual(["hold.png"]);
  });

  test("dismiss removes settled items", async () => {
    const { result } = renderHook(() => useUploads(() => {}));
    act(() => result.current.enqueue([{ file: new File(["a"], "a.png"), folder: "kit" }]));
    await waitFor(() => expect(result.current.active).toBe(false));
    act(() => result.current.dismiss());
    expect(result.current.items).toEqual([]);
  });
});

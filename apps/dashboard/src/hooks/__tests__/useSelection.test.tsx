import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { modeFromEvent, useSelection } from "@/hooks/useSelection";

describe("useSelection", () => {
  test("toggle adds then removes", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.toggle("a"));
    expect([...result.current.selected]).toEqual(["a"]);
    act(() => result.current.toggle("a"));
    expect(result.current.selected.size).toBe(0);
  });

  test("marquee replaces selection by default", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.toggle("a"));
    act(() => result.current.marqueeSelect(["b", "c"], false));
    expect([...result.current.selected].sort()).toEqual(["b", "c"]);
  });

  test("additive marquee unions with existing selection", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.toggle("a"));
    act(() => result.current.marqueeSelect(["b"], true));
    expect([...result.current.selected].sort()).toEqual(["a", "b"]);
  });

  test("selectExactly and clear", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.selectExactly(["x", "y"]));
    expect(result.current.selected.size).toBe(2);
    act(() => result.current.clear());
    expect(result.current.selected.size).toBe(0);
  });
});

describe("useSelection click semantics", () => {
  const ORDER = ["a", "b", "c", "d", "e"];

  test("plain click selects only that item", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("a", "replace", ORDER));
    act(() => result.current.select("c", "replace", ORDER));
    expect([...result.current.selected]).toEqual(["c"]);
  });

  test("cmd-click adds then removes without clearing the rest", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("a", "replace", ORDER));
    act(() => result.current.select("c", "toggle", ORDER));
    expect([...result.current.selected].sort()).toEqual(["a", "c"]);
    act(() => result.current.select("a", "toggle", ORDER));
    expect([...result.current.selected]).toEqual(["c"]);
  });

  test("shift-click extends from the anchor, inclusive", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("b", "replace", ORDER));
    act(() => result.current.select("d", "range", ORDER));
    expect([...result.current.selected].sort()).toEqual(["b", "c", "d"]);
  });

  test("shift-click extends backwards too", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("d", "replace", ORDER));
    act(() => result.current.select("b", "range", ORDER));
    expect([...result.current.selected].sort()).toEqual(["b", "c", "d"]);
  });

  test("successive shift-clicks all extend from the same anchor", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("a", "replace", ORDER));
    act(() => result.current.select("c", "range", ORDER));
    act(() => result.current.select("b", "range", ORDER));
    // Re-anchoring on each shift-click would leave c selected; it must not.
    expect([...result.current.selected].sort()).toEqual(["a", "b"]);
  });

  test("range against a key outside the order falls back to that key alone", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("a", "replace", ORDER));
    act(() => result.current.select("zz", "range", ORDER));
    expect([...result.current.selected]).toEqual(["zz"]);
  });

  test("focusKey follows the last interacted item", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("d", "replace", ORDER));
    expect(result.current.focusKey).toBe("d");
  });

  test("clear resets the anchor so the next range starts fresh", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("a", "replace", ORDER));
    act(() => result.current.clear());
    act(() => result.current.select("c", "range", ORDER));
    expect([...result.current.selected]).toEqual(["c"]);
  });
});

describe("modeFromEvent", () => {
  const base = { metaKey: false, ctrlKey: false, shiftKey: false };
  test("plain click", () => expect(modeFromEvent(base)).toBe("replace"));
  test("meta click", () => expect(modeFromEvent({ ...base, metaKey: true })).toBe("toggle"));
  test("ctrl click", () => expect(modeFromEvent({ ...base, ctrlKey: true })).toBe("toggle"));
  test("shift click", () => expect(modeFromEvent({ ...base, shiftKey: true })).toBe("range"));
  test("shift wins over meta", () =>
    expect(modeFromEvent({ ...base, shiftKey: true, metaKey: true })).toBe("range"));
});

describe("checkbox-driven selection", () => {
  const ORDER = ["a", "b", "c", "d", "e"];

  // The reported bug: ticking a checkbox replaced the selection instead of
  // adding to it, so multi-select via the checkboxes was impossible.
  test("ticking successive checkboxes accumulates", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("a", "toggle", ORDER));
    act(() => result.current.select("c", "toggle", ORDER));
    act(() => result.current.select("e", "toggle", ORDER));
    expect([...result.current.selected].sort()).toEqual(["a", "c", "e"]);
  });

  test("select all, then untick a few, keeps the rest", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.selectExactly(ORDER));
    act(() => result.current.select("b", "toggle", ORDER));
    act(() => result.current.select("d", "toggle", ORDER));
    expect([...result.current.selected].sort()).toEqual(["a", "c", "e"]);
  });

  test("shift-ticking a checkbox still extends a range", () => {
    const { result } = renderHook(() => useSelection());
    act(() => result.current.select("b", "toggle", ORDER));
    act(() => result.current.select("d", "range", ORDER));
    expect([...result.current.selected].sort()).toEqual(["b", "c", "d"]);
  });
});

import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useSelection } from "@/hooks/useSelection";

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

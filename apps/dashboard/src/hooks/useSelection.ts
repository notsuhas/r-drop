// Multi-select state shared by grid, list, marquee, keyboard nav and the
// selection bar.
//
// Click semantics match Drive/Dropbox rather than the older toggle-on-click:
//   click              select only this
//   Cmd/Ctrl + click   add or remove this
//   Shift + click      extend from the anchor to this
// The anchor is the last plainly-selected item, so a run of shift-clicks all
// extends from one place instead of walking forward.
import { useCallback, useRef, useState } from "react";

export type SelectMode = "replace" | "toggle" | "range";

export const modeFromEvent = (event: {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}): SelectMode => {
  if (event.shiftKey) return "range";
  if (event.metaKey || event.ctrlKey) return "toggle";
  return "replace";
};

/** Returns a new set with `key` added if absent, removed if present. */
const withToggled = (set: Set<string>, key: string) => {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
};

export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  /** The item keyboard navigation moves from; also the shift-range anchor. */
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const anchor = useRef<string | null>(null);

  const toggle = useCallback((key: string) => {
    anchor.current = key;
    setFocusKey(key);
    setSelected((prev) => withToggled(prev, key));
  }, []);

  /** Apply a click with its modifier keys against the current visual order. */
  const select = useCallback((key: string, mode: SelectMode, orderedKeys: string[]) => {
    setFocusKey(key);

    if (mode === "toggle") {
      anchor.current = key;
      setSelected((prev) => withToggled(prev, key));
      return;
    }

    if (mode === "range") {
      const from = orderedKeys.indexOf(anchor.current ?? key);
      const to = orderedKeys.indexOf(key);
      if (from === -1 || to === -1) {
        setSelected(new Set([key]));
        return;
      }
      const [lo, hi] = from <= to ? [from, to] : [to, from];
      setSelected(new Set(orderedKeys.slice(lo, hi + 1)));
      return;
    }

    anchor.current = key;
    setSelected(new Set([key]));
  }, []);

  const marqueeSelect = useCallback((keys: string[], additive: boolean) => {
    setSelected((prev) => (additive ? new Set([...prev, ...keys]) : new Set(keys)));
  }, []);

  const selectExactly = useCallback((keys: string[]) => {
    anchor.current = keys.at(-1) ?? null;
    setSelected(new Set(keys));
  }, []);

  const clear = useCallback(() => {
    anchor.current = null;
    setSelected(new Set());
  }, []);

  return {
    selected,
    focusKey,
    setFocusKey,
    select,
    toggle,
    marqueeSelect,
    selectExactly,
    clear,
  };
}

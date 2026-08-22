// Keyboard model for the file browser. Arrow keys move a focus cursor, Shift
// extends the selection from the anchor, and the destructive key arms the same
// confirmation the selection bar uses rather than deleting outright.
//
// The handler is split three ways — commands, navigation, activation — so each
// piece stays small enough to read at a glance.
import { useEffect, useRef } from "react";
import type { SelectMode } from "@/hooks/useSelection";

interface IFileKeyboard {
  orderedKeys: string[];
  focusKey: string | null;
  view: "grid" | "list";
  /** Container the tiles live in, used to measure the grid's column count. */
  containerRef: React.RefObject<HTMLElement | null>;
  onFocus: (key: string) => void;
  onSelect: (key: string, mode: SelectMode) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onOpen: (key: string) => void;
  onRequestDelete: () => void;
  onFocusFilter: () => void;
  hasSelection: boolean;
}

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable);

/** A text field, menu or dialog owns the keyboard while it's open. */
const shouldHandle = (e: KeyboardEvent) =>
  !isTypingTarget(e.target) && !document.querySelector('[role="menu"]');

const hasMod = (e: KeyboardEvent) => e.metaKey || e.ctrlKey;

/** How many tiles fit on a row, read from layout so it tracks the viewport. */
function columnCount(container: HTMLElement | null) {
  if (!container) return 1;
  const tiles = [...container.querySelectorAll<HTMLElement>("[data-key]")];
  if (tiles.length < 2) return 1;
  const firstTop = tiles[0].offsetTop;
  return Math.max(1, tiles.filter((t) => t.offsetTop === firstTop).length);
}

/** Signed offset an arrow key should move the cursor by, or 0 if not an arrow. */
function arrowStep(key: string, rowSize: number) {
  if (key === "ArrowRight") return 1;
  if (key === "ArrowLeft") return -1;
  if (key === "ArrowDown") return rowSize;
  if (key === "ArrowUp") return -rowSize;
  return 0;
}

/**
 * Whole-view commands, as a table rather than an if-chain: each entry owns one
 * small predicate, so adding a shortcut can't inflate a single function.
 */
const COMMANDS: {
  match: (e: KeyboardEvent, p: IFileKeyboard) => boolean;
  run: (p: IFileKeyboard) => void;
}[] = [
  { match: (e) => hasMod(e) && e.key.toLowerCase() === "a", run: (p) => p.onSelectAll() },
  { match: (e, p) => e.key === "Escape" && p.hasSelection, run: (p) => p.onClear() },
  { match: (e) => e.key === "/" && !hasMod(e), run: (p) => p.onFocusFilter() },
  {
    match: (e, p) => (e.key === "Delete" || e.key === "Backspace") && p.hasSelection,
    run: (p) => p.onRequestDelete(),
  },
];

function handleCommand(e: KeyboardEvent, p: IFileKeyboard) {
  const command = COMMANDS.find((c) => c.match(e, p));
  if (!command) return false;
  command.run(p);
  return true;
}

/** Index the cursor should move to, or -1 when this key isn't a movement key. */
function nextIndex(e: KeyboardEvent, p: IFileKeyboard) {
  const last = p.orderedKeys.length - 1;
  if (e.key === "Home") return 0;
  if (e.key === "End") return last;

  const rowSize = p.view === "grid" ? columnCount(p.containerRef.current) : 1;
  const step = arrowStep(e.key, rowSize);
  if (step === 0) return -1;

  const current = p.focusKey ? p.orderedKeys.indexOf(p.focusKey) : -1;
  // No cursor yet: the first arrow press lands on an end, not on nothing.
  if (current === -1) return step > 0 ? 0 : last;
  return Math.min(last, Math.max(0, current + step));
}

/** Moves the cursor, extending the selection when Shift is held. */
function handleNavigation(e: KeyboardEvent, p: IFileKeyboard) {
  const index = nextIndex(e, p);
  if (index < 0) return false;

  const key = p.orderedKeys[index];
  if (!key) return true;

  if (e.shiftKey) p.onSelect(key, "range");
  else if (hasMod(e)) p.onFocus(key);
  else p.onSelect(key, "replace");
  return true;
}

/** Acts on whatever the cursor is currently on. */
function handleActivation(e: KeyboardEvent, p: IFileKeyboard) {
  const { focusKey } = p;
  if (!focusKey) return false;
  if (e.key === " ") {
    p.onSelect(focusKey, "toggle");
    return true;
  }
  if (e.key === "Enter") {
    p.onOpen(focusKey);
    return true;
  }
  return false;
}

export function useFileKeyboard(props: IFileKeyboard) {
  const { focusKey, containerRef } = props;

  // The listener reads the latest props through a ref, so it subscribes once
  // instead of re-binding on every render.
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const p = latest.current;
      if (!shouldHandle(e)) return;
      if (handleCommand(e, p)) {
        e.preventDefault();
        return;
      }
      if (p.orderedKeys.length === 0) return;
      if (handleNavigation(e, p) || handleActivation(e, p)) e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Keep the cursor on screen when it moves past the fold.
  useEffect(() => {
    if (!focusKey) return;
    const el = containerRef.current?.querySelector(`[data-key="${CSS.escape(focusKey)}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusKey, containerRef]);
}

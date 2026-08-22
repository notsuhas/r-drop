// View mode and sort order. Both persist: which way you like to look at your
// assets is a preference, not per-visit state.
import { useCallback, useState } from "react";

export type SortKey = "name" | "size" | "uploaded";
export type ViewMode = "grid" | "list";

const VIEW_KEY = "r-drop:view";
const SORT_KEY = "r-drop:sort";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    // Private-mode Safari throws on localStorage; fall back to defaults.
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* preference simply won't persist */
  }
};

const SORT_KEYS: SortKey[] = ["name", "size", "uploaded"];

function readSort(): { key: SortKey; asc: boolean } {
  const raw = read(SORT_KEY);
  const [key, dir] = (raw ?? "").split(":");
  if (SORT_KEYS.includes(key as SortKey)) return { key: key as SortKey, asc: dir === "asc" };
  return { key: "uploaded", asc: false };
}

export function useViewPrefs() {
  const [view, setView] = useState<ViewMode>(() => (read(VIEW_KEY) === "list" ? "list" : "grid"));
  const initial = readSort();
  const [sortKey, setSortKey] = useState<SortKey>(initial.key);
  const [sortAsc, setSortAsc] = useState(initial.asc);

  const setViewMode = useCallback((mode: ViewMode) => {
    setView(mode);
    write(VIEW_KEY, mode);
  }, []);

  const onSort = useCallback(
    (key: SortKey) => {
      // Re-picking the active column flips direction; a new column starts in the
      // direction that's useful for it — A→Z for names, biggest/newest first.
      const asc = key === sortKey ? !sortAsc : key === "name";
      setSortKey(key);
      setSortAsc(asc);
      write(SORT_KEY, `${key}:${asc ? "asc" : "desc"}`);
    },
    [sortKey, sortAsc],
  );

  return { view, setViewMode, sortKey, sortAsc, onSort };
}

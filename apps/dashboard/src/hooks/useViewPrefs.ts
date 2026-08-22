// Grid/list toggle (persisted) and sort order.
import { useCallback, useState } from "react";
import type { SortKey } from "../components/files/ListView";

const VIEW_STORAGE_KEY = "ho-drive:view";

export function useViewPrefs() {
  const [view, setView] = useState<"grid" | "list">(
    (localStorage.getItem(VIEW_STORAGE_KEY) as "grid" | "list") ?? "grid",
  );
  const [sortKey, setSortKey] = useState<SortKey>("uploaded");
  const [sortAsc, setSortAsc] = useState(false);

  const setViewMode = useCallback((mode: "grid" | "list") => {
    setView(mode);
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }, []);

  const onSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortAsc((asc) => !asc);
      } else {
        setSortKey(key);
        setSortAsc(key === "name");
      }
    },
    [sortKey],
  );

  return { view, setViewMode, sortKey, sortAsc, onSort };
}

// Multi-select state shared by grid, list, marquee, and the selection pill.
import { useCallback, useState } from "react";

export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const marqueeSelect = useCallback((keys: string[], additive: boolean) => {
    setSelected((prev) => (additive ? new Set([...prev, ...keys]) : new Set(keys)));
  }, []);

  const selectExactly = useCallback((keys: string[]) => setSelected(new Set(keys)), []);
  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggle, marqueeSelect, selectExactly, clear };
}

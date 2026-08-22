// Open/close state for a Menu, for both button triggers and right-click.
import { useCallback, useState } from "react";
import type { IMenuAnchor } from "@/components/ui/Menu";

export function useMenu() {
  const [anchor, setAnchor] = useState<IMenuAnchor | null>(null);
  const close = useCallback(() => setAnchor(null), []);

  /** Anchor under a trigger button, right-aligned to its right edge. Both edges
   *  are recorded so the menu can flip above the trigger when space runs out. */
  const openBelow = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchor({ x: rect.right, y: rect.bottom + 6, flipY: rect.top, alignRight: true });
  }, []);

  /** Anchor at the pointer, for contextmenu. */
  const openAt = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setAnchor({ x: event.clientX, y: event.clientY, flipY: event.clientY });
  }, []);

  return { anchor, open: anchor !== null, openBelow, openAt, close };
}

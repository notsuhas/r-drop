import { useCallback, useRef, useState } from "react";

interface IMarqueeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const intersects = (a: DOMRect, b: IMarqueeRect) =>
  a.left < b.left + b.width && a.right > b.left && a.top < b.top + b.height && a.bottom > b.top;

// Google Drive-style rubber-band selection over elements carrying data-key.
export function useMarquee(onSelect: (keys: string[], additive: boolean) => void) {
  const [rect, setRect] = useState<IMarqueeRect | null>(null);
  const origin = useRef<{ x: number; y: number; additive: boolean } | null>(null);
  const moved = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("[data-key], button, input, a, form")) return;
    origin.current = { x: e.clientX, y: e.clientY, additive: e.shiftKey || e.metaKey };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const o = origin.current;
      if (!o) return;
      const left = Math.min(o.x, e.clientX);
      const top = Math.min(o.y, e.clientY);
      const width = Math.abs(e.clientX - o.x);
      const height = Math.abs(e.clientY - o.y);
      if (width + height > 6) moved.current = true;
      if (!moved.current) return;
      const r = { left, top, width, height };
      setRect(r);
      const keys = [...e.currentTarget.querySelectorAll<HTMLElement>("[data-key]")]
        .filter((el) => intersects(el.getBoundingClientRect(), r))
        .map((el) => el.dataset.key as string);
      onSelect(keys, o.additive);
    },
    [onSelect],
  );

  const onPointerUp = useCallback(() => {
    const o = origin.current;
    origin.current = null;
    setRect(null);
    if (o && !moved.current) onSelect([], o.additive);
  }, [onSelect]);

  return { rect, handlers: { onPointerDown, onPointerMove, onPointerUp } };
}

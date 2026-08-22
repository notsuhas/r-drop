// Popover menu for toolbars and right-click. Rendered into a portal with
// position: fixed so it escapes the file browser's overflow-y-auto container,
// which would otherwise clip an absolutely-positioned dropdown.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";

export interface IMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  kbd?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export interface IMenuGroup {
  /** Omit for an unlabelled group; groups are separated by a hairline. */
  label?: string;
  items: IMenuItem[];
}

export interface IMenuAnchor {
  x: number;
  y: number;
  /** Align the menu's right edge to x instead of its left edge. */
  alignRight?: boolean;
}

interface IMenu {
  anchor: IMenuAnchor;
  groups: IMenuGroup[];
  onClose: () => void;
  /** Announced as the menu's accessible name. */
  label: string;
}

const MARGIN = 8;

export default function Menu(props: IMenu) {
  const { anchor, groups, onClose, label } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [cursor, setCursor] = useState(-1);

  const flat = groups.flatMap((g) => g.items);
  const enabled = flat.filter((it) => !it.disabled);

  // Measure before paint, then clamp into the viewport so a menu opened near an
  // edge flips rather than spilling offscreen.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = anchor.alignRight ? anchor.x - width : anchor.x;
    let top = anchor.y;
    if (left + width > vw - MARGIN) left = vw - MARGIN - width;
    if (left < MARGIN) left = MARGIN;
    if (top + height > vh - MARGIN) top = Math.max(MARGIN, anchor.y - height);
    setPos({ left, top });
  }, [anchor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const dir = e.key === "ArrowDown" ? 1 : -1;
        setCursor((c) => {
          const next = c + dir;
          if (next < 0) return enabled.length - 1;
          if (next >= enabled.length) return 0;
          return next;
        });
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        if (cursor < 0) return;
        e.preventDefault();
        const item = enabled[cursor];
        onClose();
        item?.onSelect();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("resize", onClose);
    // Capture-phase scroll: any ancestor scrolling invalidates a fixed anchor.
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose, cursor, enabled]);

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      style={{ left: pos?.left ?? anchor.x, top: pos?.top ?? anchor.y }}
      className={cx(
        "fixed z-(--z-index-dropdown) min-w-52 max-w-72 overflow-hidden rounded-lg bg-surface-2 p-1 shadow-e3",
        "animate-pop",
        pos ? "visible" : "invisible",
      )}
    >
      {groups.map((group, gi) => (
        <div
          key={group.label ?? `group-${gi}`}
          className={gi > 0 ? "mt-1 border-t border-hairline pt-1" : undefined}
        >
          {group.label && (
            <p className="px-2.5 pb-1 pt-1.5 text-2xs font-medium text-ink-3">{group.label}</p>
          )}
          {group.items.map((item) => {
            const index = enabled.indexOf(item);
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onMouseEnter={() => setCursor(index)}
                onClick={() => {
                  onClose();
                  item.onSelect();
                }}
                className={cx(
                  "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-left text-sm",
                  "transition-colors duration-(--duration-fast)",
                  "disabled:pointer-events-none disabled:opacity-40",
                  item.danger ? "text-danger" : "text-ink",
                  index >= 0 &&
                    index === cursor &&
                    (item.danger ? "bg-danger-wash" : "bg-surface-3"),
                )}
              >
                <span className={cx("shrink-0", item.danger ? "text-danger" : "text-ink-3")}>
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.kbd && (
                  <span className="shrink-0 font-mono text-2xs text-ink-3">{item.kbd}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>,
    document.body,
  );
}

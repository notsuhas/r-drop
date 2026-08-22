import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import IconButton from "@/components/ui/IconButton";

interface IModal {
  title: string;
  /** Sits under the title and becomes the dialog's accessible description. */
  subtitle?: string;
  children: React.ReactNode;
  /** Right-aligned action row, pinned below the scrollable body. */
  footer?: React.ReactNode;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Cycles Tab within the dialog. Without this, focus walks the page behind the
 * backdrop, where nothing is clickable and nothing is visible.
 */
function trapTab(e: KeyboardEvent, panel: HTMLElement) {
  const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
  if (items.length === 0) return;

  // -1 covers the panel itself, which holds focus on open, as well as anything
  // outside the dialog — both should be pulled back to an end.
  const at = items.indexOf(document.activeElement as HTMLElement);
  const back = e.shiftKey;
  if (back ? at > 0 : at >= 0 && at < items.length - 1) return;

  e.preventDefault();
  items[back ? items.length - 1 : 0]?.focus();
}

/**
 * Centred dialog: backdrop, escape, scroll lock and a Tab trap. Portalled to
 * body so an ancestor's `overflow` or `transform` can't clip or re-anchor it.
 */
export default function Modal(props: IModal) {
  const { title, subtitle, children, footer, onClose } = props;
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && panel.current) trapTab(e, panel.current);
    };

    // A page that keeps scrolling under a dialog reads as unanchored.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      restore?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-(--z-index-backdrop) flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-bg/70 backdrop-blur-sm"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className="animate-pop relative z-(--z-index-modal) flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col rounded-lg bg-surface shadow-e4 outline-none"
      >
        <div className="flex items-start gap-4 px-5 pt-5">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-medium text-ink">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="mt-1 text-sm text-ink-2">
                {subtitle}
              </p>
            )}
          </div>
          <IconButton label={`Close ${title}`} onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-hairline px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

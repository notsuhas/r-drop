import { AlertTriangle, Check, Info, X } from "lucide-react";
import { type ToastTone, useToast } from "@/hooks/useToast";
import { cx } from "@/lib/cx";

const icons: Record<ToastTone, React.ReactNode> = {
  neutral: <Info size={14} />,
  ok: <Check size={14} />,
  danger: <AlertTriangle size={14} />,
};

const tones: Record<ToastTone, string> = {
  neutral: "text-ink-2",
  ok: "text-ok",
  danger: "text-danger",
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div
      // aria-live so confirmations reach screen readers without stealing focus.
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-(--z-index-toast) flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in pointer-events-auto flex max-w-[min(28rem,100%)] items-center gap-2.5 rounded-lg bg-surface-3 py-2 pl-3 pr-2 shadow-e3"
        >
          <span className={cx("shrink-0", tones[t.tone])}>{icons[t.tone]}</span>
          <p className="min-w-0 flex-1 truncate text-sm text-ink">{t.message}</p>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action?.onSelect();
                dismiss(t.id);
              }}
              className="shrink-0 rounded-sm px-2 py-1 text-xs font-medium text-honey transition-colors hover:bg-honey-wash"
            >
              {t.action.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="shrink-0 rounded-sm p-1 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

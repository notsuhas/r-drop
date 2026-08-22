// App-wide transient feedback. Every mutation confirms in the same place and in
// the same voice, so people learn where to look once.
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export type ToastTone = "neutral" | "ok" | "danger";

export interface IToast {
  id: number;
  message: string;
  tone: ToastTone;
  /** Optional single action, e.g. "View" on an upload. */
  action?: { label: string; onSelect: () => void };
}

interface IToastApi {
  toasts: IToast[];
  toast: (message: string, tone?: ToastTone, action?: IToast["action"]) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<IToastApi | null>(null);

const LIFETIME = 4000;

export function ToastProvider(props: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<IToast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "neutral", action?: IToast["action"]) => {
      const id = nextId.current++;
      // Keep the stack shallow; older toasts fall off rather than pile up.
      setToasts((prev) => [...prev.slice(-2), { id, message, tone, action }]);
      setTimeout(() => dismiss(id), LIFETIME);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);
  return <ToastContext.Provider value={value}>{props.children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

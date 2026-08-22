import { Check } from "lucide-react";
import type { IUploadItem } from "../../hooks/useUploads";
import { fmtSize } from "../../lib/format";

interface IUploadTray {
  items: IUploadItem[];
  active: boolean;
  onDismiss: () => void;
}

export default function UploadTray(props: IUploadTray) {
  const { items, active, onDismiss } = props;
  if (items.length === 0) return null;
  const done = items.filter((it) => it.status === "done").length;

  return (
    <div className="fixed bottom-6 right-6 z-30 w-80 overflow-hidden rounded-none border border-line bg-panel-2 shadow-[6px_6px_0_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-display text-sm font-semibold">
          {active ? `Uploading ${done + 1}/${items.length}` : `Uploaded ${done}/${items.length}`}
        </span>
        {!active && (
          <button type="button" onClick={onDismiss} className="text-xs text-muted hover:text-ink">
            Clear
          </button>
        )}
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {items.map((it) => (
          <li key={it.id} className="border-b border-line px-4 py-2.5 last:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-mono text-xs">{it.name}</span>
              <span className="shrink-0 text-xs text-muted">
                {it.status === "done" && <Check size={13} className="text-ok" />}
                {it.status === "error" && <span className="text-danger">failed</span>}
                {it.status === "uploading" && `${Math.round(it.progress * 100)}%`}
                {(it.status === "queued" || it.status === "reading") && fmtSize(it.size)}
              </span>
            </div>
            {it.status === "error" ? (
              <p className="mt-1 text-xs text-danger">{it.error}</p>
            ) : (
              <div className="mt-1.5 h-1 overflow-hidden rounded-none bg-line">
                <div
                  className={`h-full rounded-none transition-[width] duration-150 ${
                    it.status === "done" ? "bg-ok" : "bg-honey"
                  }`}
                  style={{ width: `${Math.round(it.progress * 100)}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Check, X } from "lucide-react";
import type { IUploadItem } from "@/hooks/useUploads";
import { fmtSize } from "@/lib/format";

interface IUploadTrayItem {
  item: IUploadItem;
  onCancel: () => void;
}

function StatusLabel(props: { item: IUploadItem }) {
  const { item } = props;
  if (item.status === "done") return <Check size={13} className="text-ok" />;
  if (item.status === "error") return <span className="text-danger">failed</span>;
  if (item.status === "cancelled") return <span className="text-muted">cancelled</span>;
  if (item.status === "uploading") return <>{Math.round(item.progress * 100)}%</>;
  return <>{fmtSize(item.size)}</>;
}

const CANCELLABLE = new Set(["queued", "reading", "uploading"]);

export default function UploadTrayItem(props: IUploadTrayItem) {
  const { item, onCancel } = props;
  return (
    <li className="border-b border-line px-4 py-2.5 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-mono text-xs">{item.name}</span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
          <StatusLabel item={item} />
          {CANCELLABLE.has(item.status) && (
            <button
              type="button"
              onClick={onCancel}
              aria-label={`Cancel ${item.name}`}
              className="text-muted hover:text-danger"
            >
              <X size={13} />
            </button>
          )}
        </span>
      </div>
      {item.status === "error" ? (
        <p className="mt-1 text-xs text-danger">{item.error}</p>
      ) : item.status === "cancelled" ? null : (
        <div className="mt-1.5 h-1 overflow-hidden bg-line">
          <div
            className={`h-full transition-[width] duration-150 ${item.status === "done" ? "bg-ok" : "bg-honey"}`}
            style={{ width: `${Math.round(item.progress * 100)}%` }}
          />
        </div>
      )}
    </li>
  );
}

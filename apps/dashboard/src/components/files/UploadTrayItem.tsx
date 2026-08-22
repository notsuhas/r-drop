import { Check, X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import type { IUploadItem } from "@/hooks/useUploads";
import { cx } from "@/lib/cx";
import { fmtSize } from "@/lib/format";

interface IUploadTrayItem {
  item: IUploadItem;
  onCancel: () => void;
}

const CANCELLABLE = new Set(["queued", "reading", "uploading"]);

function Status(props: { item: IUploadItem }) {
  const { item } = props;
  if (item.status === "done") return <Check size={13} className="text-ok" />;
  if (item.status === "error") return <span className="text-danger">Failed</span>;
  if (item.status === "cancelled") return <span className="text-ink-3">Cancelled</span>;
  if (item.status === "reading") return <span className="text-ink-3">Reading…</span>;
  if (item.status === "uploading")
    return <span className="tabular">{Math.round(item.progress * 100)}%</span>;
  return <span>{fmtSize(item.size)}</span>;
}

export default function UploadTrayItem(props: IUploadTrayItem) {
  const { item, onCancel } = props;
  const settled = item.status === "done" || item.status === "cancelled";

  return (
    <li className="border-b border-hairline px-3 py-2 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-mono text-xs text-ink" title={item.name}>
          {item.name}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-2xs text-ink-2">
          <Status item={item} />
          {CANCELLABLE.has(item.status) && (
            <IconButton size="sm" variant="danger" label={`Cancel ${item.name}`} onClick={onCancel}>
              <X size={12} />
            </IconButton>
          )}
        </span>
      </div>

      {item.status === "error" ? (
        <p className="mt-1 text-2xs text-danger">{item.error}</p>
      ) : (
        !settled && (
          <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-surface-3">
            <div
              data-motion-safe="progress"
              className={cx(
                "h-full transition-[width] duration-(--duration-base) ease-(--ease-out-quart)",
                "bg-accent",
              )}
              style={{ width: `${Math.round(item.progress * 100)}%` }}
            />
          </div>
        )
      )}
    </li>
  );
}

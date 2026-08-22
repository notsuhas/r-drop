import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import UploadTrayItem from "@/components/files/UploadTrayItem";
import IconButton from "@/components/ui/IconButton";
import type { IUploadItem } from "@/hooks/useUploads";

interface IUploadTray {
  items: IUploadItem[];
  active: boolean;
  onDismiss: () => void;
  onCancel: (id: string) => void;
  onCancelAll: () => void;
}

interface IProgressSummary {
  heading: string;
  overall: number;
}

/** While uploading, count the file in flight; afterwards, report the result. */
function summarize(items: IUploadItem[], active: boolean): IProgressSummary {
  const done = items.filter((it) => it.status === "done").length;
  const failed = items.filter((it) => it.status === "error").length;
  const overall = items.reduce((sum, it) => sum + it.progress, 0) / items.length;

  if (active)
    return { heading: `Uploading ${Math.min(done + 1, items.length)} of ${items.length}`, overall };
  if (failed > 0) return { heading: `${done} uploaded, ${failed} failed`, overall };
  return { heading: `Uploaded ${done} ${done === 1 ? "file" : "files"}`, overall };
}

export default function UploadTray(props: IUploadTray) {
  const { items, active, onDismiss, onCancel, onCancelAll } = props;
  const [collapsed, setCollapsed] = useState(false);
  if (items.length === 0) return null;

  const { heading, overall } = summarize(items, active);

  return (
    <div className="animate-rise fixed bottom-4 right-4 z-(--z-index-drawer) w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl bg-surface-2 shadow-e4">
      <div className="flex items-center gap-1 px-3 py-2.5">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{heading}</p>
        {active && (
          <button
            type="button"
            onClick={onCancelAll}
            className="shrink-0 rounded-sm px-1.5 py-1 text-xs text-ink-3 transition-colors hover:bg-danger-wash hover:text-danger"
          >
            Cancel all
          </button>
        )}
        <IconButton
          size="sm"
          label={collapsed ? "Show uploads" : "Hide uploads"}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </IconButton>
        {!active && (
          <IconButton size="sm" label="Clear finished uploads" onClick={onDismiss}>
            <X size={14} />
          </IconButton>
        )}
      </div>

      {/* Aggregate bar so a long queue reports progress even when collapsed. */}
      {active && (
        <div className="h-0.5 bg-surface-3">
          <div
            data-motion-safe="progress"
            className="h-full bg-honey transition-[width] duration-(--duration-slow) ease-(--ease-out-quart)"
            style={{ width: `${Math.round(overall * 100)}%` }}
          />
        </div>
      )}

      {!collapsed && (
        <ul className="max-h-64 overflow-y-auto border-t border-hairline">
          {items.map((it) => (
            <UploadTrayItem key={it.id} item={it} onCancel={() => onCancel(it.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

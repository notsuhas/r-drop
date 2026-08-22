import UploadTrayItem from "@/components/files/UploadTrayItem";
import type { IUploadItem } from "@/hooks/useUploads";

interface IUploadTray {
  items: IUploadItem[];
  active: boolean;
  onDismiss: () => void;
  onCancel: (id: string) => void;
  onCancelAll: () => void;
}

export default function UploadTray(props: IUploadTray) {
  const { items, active, onDismiss, onCancel, onCancelAll } = props;
  if (items.length === 0) return null;
  const done = items.filter((it) => it.status === "done").length;

  return (
    <div className="fixed bottom-6 right-6 z-30 w-80 overflow-hidden border border-line bg-panel-2 shadow-[6px_6px_0_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-display text-sm font-semibold">
          {active ? `Uploading ${done + 1}/${items.length}` : `Uploaded ${done}/${items.length}`}
        </span>
        {active ? (
          <button
            type="button"
            onClick={onCancelAll}
            className="text-xs text-muted hover:text-danger"
          >
            Cancel all
          </button>
        ) : (
          <button type="button" onClick={onDismiss} className="text-xs text-muted hover:text-ink">
            Clear
          </button>
        )}
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {items.map((it) => (
          <UploadTrayItem key={it.id} item={it} onCancel={() => onCancel(it.id)} />
        ))}
      </ul>
    </div>
  );
}

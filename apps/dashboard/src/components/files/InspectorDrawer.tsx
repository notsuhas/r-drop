import { Download, ExternalLink, X } from "lucide-react";
import FilePreview from "@/components/files/FilePreview";
import FolderSelect from "@/components/files/FolderSelect";
import RenameField from "@/components/files/RenameField";
import Button from "@/components/ui/Button";
import CopyField from "@/components/ui/CopyField";
import type { IObject } from "@/lib/api";
import { downloadFile } from "@/lib/download";
import { basename, fileKind, fmtSize } from "@/lib/format";
import { folderOf } from "@/lib/links";

interface IInspectorDrawer {
  object: IObject;
  folders: string[];
  onClose: () => void;
  onDelete: () => void;
  onRename: (newKey: string) => void;
}

export default function InspectorDrawer(props: IInspectorDrawer) {
  const { object, folders, onClose, onDelete, onRename } = props;
  const folder = folderOf(object.key);
  const name = basename(object.key);

  const rows: [string, string][] = [
    ["type", object.contentType || fileKind(object.contentType, object.key)],
    ["size", fmtSize(object.size)],
    ["uploaded", new Date(object.uploaded).toLocaleString()],
  ];

  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-96 flex-col overflow-y-auto border-l border-line bg-panel shadow-[-6px_0_0_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
        <RenameField value={name} onRename={(next) => onRename(`${folder}/${next}`)} />
        <button
          type="button"
          onClick={onClose}
          className="ml-2 shrink-0 text-muted hover:text-ink"
          aria-label="Close inspector"
        >
          <X size={16} />
        </button>
      </div>
      <div className="aspect-square w-full shrink-0 border-b border-line bg-panel-2">
        <FilePreview url={object.url} keyName={object.key} contentType={object.contentType} />
      </div>
      <dl className="space-y-3 p-5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
            <dd className="truncate text-right font-mono text-xs">{value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs uppercase tracking-wide text-muted">folder</dt>
          <dd>
            <FolderSelect
              current={folder}
              folders={folders}
              onMove={(target) => onRename(`${target}/${name}`)}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">public url</dt>
          <dd className="mt-1">
            <CopyField value={object.url} />
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex items-center justify-between border-t border-line p-5">
        <div className="flex items-center gap-4">
          <a
            href={object.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-honey underline-offset-2 hover:underline"
          >
            open <ExternalLink size={12} />
          </a>
          <button
            type="button"
            onClick={() => downloadFile(object.url, name)}
            className="inline-flex items-center gap-1 font-mono text-xs text-muted hover:text-ink"
          >
            <Download size={12} /> download
          </button>
        </div>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </aside>
  );
}

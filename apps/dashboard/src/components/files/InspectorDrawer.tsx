import { Download, ExternalLink, Pencil, X } from "lucide-react";
import { useState } from "react";
import type { IObject } from "../../lib/api";
import { basename, fileKind, fmtSize } from "../../lib/format";
import Button from "../ui/Button";
import FilePreview from "./FilePreview";

interface IInspectorDrawer {
  object: IObject;
  folders: string[];
  onClose: () => void;
  onDelete: () => void;
  onRename: (newKey: string) => void;
  onCopied: () => void;
}

export default function InspectorDrawer(props: IInspectorDrawer) {
  const { object, folders, onClose, onDelete, onRename, onCopied } = props;
  const folder = object.key.includes("/") ? object.key.slice(0, object.key.lastIndexOf("/")) : "";
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(basename(object.key));

  const rows: [string, string][] = [
    ["type", object.contentType || fileKind(object.contentType, object.key)],
    ["size", fmtSize(object.size)],
    ["uploaded", new Date(object.uploaded).toLocaleString()],
  ];

  const download = async () => {
    const blob = await fetch(object.url).then((r) => r.blob());
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = basename(object.key);
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-96 flex-col overflow-y-auto border-l border-line bg-panel shadow-[-6px_0_0_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
        {editing ? (
          <form
            className="flex min-w-0 flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (name && name !== basename(object.key)) onRename(`${folder}/${name}`);
              setEditing(false);
            }}
          >
            <input
              // biome-ignore lint/a11y/noAutofocus: focus follows the rename button
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              className="min-w-0 flex-1 border border-line bg-bg px-2 py-1 font-mono text-sm"
            />
            <Button variant="primary" type="submit">
              Save
            </Button>
          </form>
        ) : (
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-mono text-sm">{basename(object.key)}</span>
            <button
              type="button"
              onClick={() => {
                setName(basename(object.key));
                setEditing(true);
              }}
              className="shrink-0 text-muted hover:text-ink"
              aria-label="Rename file"
            >
              <Pencil size={13} />
            </button>
          </span>
        )}
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
            <select
              value={folder}
              onChange={(e) => onRename(`${e.target.value}/${basename(object.key)}`)}
              className="border border-line bg-bg px-2 py-1 font-mono text-xs"
            >
              {[folder, ...folders.filter((f) => f !== folder)].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">public url</dt>
          <dd className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate bg-bg px-2.5 py-1.5 font-mono text-xs">
              {object.url}
            </code>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(object.url);
                onCopied();
              }}
            >
              Copy
            </Button>
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
            onClick={download}
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

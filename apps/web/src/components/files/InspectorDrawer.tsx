import { ExternalLink, X } from "lucide-react";
import type { IObject } from "../../lib/api";
import { basename, fileKind, fmtSize } from "../../lib/format";
import Button from "../ui/Button";
import FilePreview from "./FilePreview";

interface IInspectorDrawer {
  object: IObject;
  onClose: () => void;
  onDelete: () => void;
  onCopied: () => void;
}

export default function InspectorDrawer(props: IInspectorDrawer) {
  const { object, onClose, onDelete, onCopied } = props;
  const rows: [string, string][] = [
    ["key", object.key],
    ["type", object.contentType || fileKind(object.contentType, object.key)],
    ["size", fmtSize(object.size)],
    ["uploaded", new Date(object.uploaded).toLocaleString()],
  ];

  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-96 flex-col border-l border-line bg-panel shadow-[-6px_0_0_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="truncate font-mono text-sm">{basename(object.key)}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-3 text-muted hover:text-ink"
          aria-label="Close inspector"
        >
          <X size={16} />
        </button>
      </div>
      <div className="aspect-square w-full border-b border-line bg-panel-2">
        <FilePreview url={object.url} keyName={object.key} contentType={object.contentType} />
      </div>
      <dl className="space-y-3 p-5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
            <dd className="truncate text-right font-mono text-xs">{value}</dd>
          </div>
        ))}
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">public url</dt>
          <dd className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-none bg-bg px-2.5 py-1.5 font-mono text-xs">
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
      <div className="mt-auto border-t border-line p-5">
        <a
          href={object.url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-honey underline-offset-2 hover:underline"
        >
          <span className="inline-flex items-center gap-1">
            open on cdn <ExternalLink size={12} />
          </span>
        </a>
        <div className="mt-3">
          <Button variant="danger" onClick={onDelete}>
            Delete file
          </Button>
        </div>
      </div>
    </aside>
  );
}

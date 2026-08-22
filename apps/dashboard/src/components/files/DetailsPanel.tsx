// Docked details panel on wide screens, bottom sheet on small ones. Replaces
// the old floating drawer, which overlapped content at every width.
import { Download, ExternalLink, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import FilePreview from "@/components/files/FilePreview";
import FileTypeIcon from "@/components/files/FileTypeIcon";
import FolderSelect from "@/components/files/FolderSelect";
import RenameField from "@/components/files/RenameField";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CopyField from "@/components/ui/CopyField";
import IconButton from "@/components/ui/IconButton";
import type { IObject } from "@/lib/api";
import { downloadFile } from "@/lib/download";
import { basename, fileKind, fmtSize, fmtWhen, fmtWhenExact } from "@/lib/format";
import { folderOf } from "@/lib/links";

interface IDetailsPanel {
  object: IObject;
  folders: string[];
  onClose: () => void;
  onDelete: () => void;
  onRename: (newKey: string) => void;
  /** Set when the rename came from the context menu, so the field opens ready. */
  startRenaming?: boolean;
  onRenamingDone?: () => void;
}

export default function DetailsPanel(props: IDetailsPanel) {
  const { object, folders, onClose, onDelete, onRename, startRenaming, onRenamingDone } = props;
  const [confirming, setConfirming] = useState(false);
  const [renaming, setRenaming] = useState(Boolean(startRenaming));

  useEffect(() => {
    if (startRenaming) setRenaming(true);
  }, [startRenaming]);
  const folder = folderOf(object.key);
  const name = basename(object.key);
  const kind = fileKind(object.contentType, object.key);

  return (
    <aside
      aria-label={`Details for ${name}`}
      className="animate-slide-in flex w-full shrink-0 flex-col overflow-y-auto border-t border-hairline bg-surface md:w-80 md:border-l md:border-t-0 lg:w-96"
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-hairline px-4">
        <div className="flex min-w-0 items-center gap-2">
          <FileTypeIcon kind={kind} size={15} />
          <h2 className="truncate text-sm font-medium">Details</h2>
        </div>
        <IconButton label="Close details" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </div>

      <div className="bg-checker aspect-square w-full shrink-0 border-b border-hairline bg-surface-2/60">
        <FilePreview
          variant="full"
          url={object.url}
          keyName={object.key}
          contentType={object.contentType}
        />
      </div>

      <div className="space-y-5 p-4">
        <div>
          <p className="mb-1.5 text-2xs font-medium text-ink-3">Name</p>
          <RenameField
            value={name}
            editing={renaming}
            onEditingChange={(next) => {
              setRenaming(next);
              if (!next) onRenamingDone?.();
            }}
            onRename={(next) => onRename(folder ? `${folder}/${next}` : next)}
          />
        </div>

        <dl className="space-y-2.5 text-sm">
          <Row label="Kind">
            <Badge tone="neutral" mono>
              {object.contentType || kind}
            </Badge>
          </Row>
          <Row label="Size">
            <span className="font-mono text-xs text-ink-2">{fmtSize(object.size)}</span>
          </Row>
          <Row label="Uploaded">
            <span className="font-mono text-xs text-ink-2" title={fmtWhenExact(object.uploaded)}>
              {fmtWhen(object.uploaded)}
            </span>
          </Row>
          <Row label="Folder">
            <FolderSelect
              current={folder}
              folders={folders}
              onMove={(target) => onRename(target ? `${target}/${name}` : name)}
            />
          </Row>
        </dl>

        <div>
          <p className="mb-1.5 text-2xs font-medium text-ink-3">Public URL</p>
          <CopyField value={object.url} label="Copy public URL" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            icon={<ExternalLink size={13} />}
            onClick={() => window.open(object.url, "_blank", "noreferrer")}
          >
            Open
          </Button>
          <Button
            size="sm"
            icon={<Download size={13} />}
            onClick={() => downloadFile(object.url, name)}
          >
            Download
          </Button>
        </div>
      </div>

      <div className="mt-auto border-t border-hairline p-4">
        {confirming ? (
          <div className="space-y-2.5">
            <p className="text-sm text-danger">
              Delete {name}? Anything already pointing at this URL will 404.
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={onDelete}>
                Delete permanently
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Keep
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 size={13} />}
            onClick={() => setConfirming(true)}
            className="text-danger hover:bg-danger-wash hover:text-danger"
          >
            Delete file
          </Button>
        )}
      </div>
    </aside>
  );
}

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-2xs font-medium text-ink-3">{props.label}</dt>
      <dd className="min-w-0 truncate text-right">{props.children}</dd>
    </div>
  );
}

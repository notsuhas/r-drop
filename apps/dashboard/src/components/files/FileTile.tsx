import { Info, Link2, MoreVertical } from "lucide-react";
import FilePreview from "@/components/files/FilePreview";
import FileTypeIcon from "@/components/files/FileTypeIcon";
import Checkbox from "@/components/ui/Checkbox";
import IconButton from "@/components/ui/IconButton";
import type { IObject } from "@/lib/api";
import { cx } from "@/lib/cx";
import { basename, extension, fileKind, fmtSize } from "@/lib/format";

interface IFileTile {
  object: IObject;
  selected: boolean;
  focused: boolean;
  onSelect: (event: React.MouseEvent) => void;
  onOpen: () => void;
  onInspect: () => void;
  onCopyUrl: () => void;
  onMenu: (event: React.MouseEvent) => void;
}

export default function FileTile(props: IFileTile) {
  const { object, selected, focused, onSelect, onOpen, onInspect, onCopyUrl, onMenu } = props;
  const name = basename(object.key);
  const kind = fileKind(object.contentType, object.key);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the inner button is the accessible control; this wrapper only adds pointer affordances
    <div
      onContextMenu={onMenu}
      onDoubleClick={onOpen}
      className={cx(
        "group relative overflow-hidden rounded-lg bg-surface",
        "transition-[box-shadow,background-color] duration-(--duration-fast) ease-(--ease-out-quart)",
        selected
          ? "bg-accent-wash shadow-[inset_0_0_0_2px_var(--color-accent)]"
          : "hover:bg-surface-2",
        focused && !selected && "shadow-[inset_0_0_0_2px_var(--color-border-strong)]",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="block w-full text-left"
      >
        <div className="aspect-square w-full overflow-hidden bg-surface-2/70">
          <FilePreview url={object.url} keyName={object.key} contentType={object.contentType} />
        </div>
        <div className="p-2.5">
          <p className="truncate font-mono text-xs text-ink" title={name}>
            {name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-2xs text-ink-3">
            <FileTypeIcon kind={kind} size={11} />
            <span className="uppercase">{extension(object.key) || kind}</span>
            <span aria-hidden="true">·</span>
            <span>{fmtSize(object.size)}</span>
          </p>
        </div>
      </button>

      <span className="absolute left-2 top-2">
        <Checkbox checked={selected} hideUntilHover label={`Select ${name}`} onChange={onSelect} />
      </span>

      {/* Hover actions sit on a scrim so icons stay legible over any thumbnail. */}
      <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-bg/75 p-0.5 opacity-0 backdrop-blur-sm transition-opacity duration-(--duration-fast) group-hover:opacity-100 group-focus-within:opacity-100">
        <IconButton size="sm" label={`Copy URL for ${name}`} onClick={onCopyUrl}>
          <Link2 size={13} />
        </IconButton>
        <IconButton size="sm" label={`Details for ${name}`} onClick={onInspect}>
          <Info size={13} />
        </IconButton>
        <IconButton size="sm" label={`More actions for ${name}`} onClick={onMenu}>
          <MoreVertical size={13} />
        </IconButton>
      </div>
    </div>
  );
}

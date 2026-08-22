import { Check, Copy, Info } from "lucide-react";
import FilePreview from "@/components/files/FilePreview";
import RenameField from "@/components/files/RenameField";
import OverlayIconButton from "@/components/ui/OverlayIconButton";
import type { IObject } from "@/lib/api";
import { basename, extension, fmtSize } from "@/lib/format";
import { folderOf } from "@/lib/links";

interface IFileCard {
  object: IObject;
  selected: boolean;
  onToggle: () => void;
  onInspect: () => void;
  onRename: (newKey: string) => void;
  onCopied: () => void;
}

export default function FileCard(props: IFileCard) {
  const { object, selected, onToggle, onInspect, onRename, onCopied } = props;
  const name = basename(object.key);

  return (
    <div
      className={`group relative overflow-hidden border bg-panel transition-colors ${
        selected ? "border-honey" : "border-line hover:border-[rgba(255,255,255,0.2)]"
      }`}
    >
      <button type="button" onClick={onToggle} className="block w-full text-left">
        <div className="aspect-square w-full overflow-hidden bg-panel-2">
          <FilePreview url={object.url} keyName={object.key} contentType={object.contentType} />
        </div>
      </button>
      <div className="border-t border-line p-3">
        <RenameField
          value={name}
          compact
          onRename={(next) => onRename(`${folderOf(object.key)}/${next}`)}
        />
        <p className="mt-1 flex items-center gap-2 text-xs text-muted">
          <span className="uppercase">{extension(object.key)}</span>
          <span>·</span>
          <span>{fmtSize(object.size)}</span>
        </p>
      </div>
      <div
        className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center border text-xs transition-opacity ${
          selected
            ? "border-honey bg-honey text-honey-ink opacity-100"
            : "border-line bg-bg opacity-0 group-hover:opacity-100"
        }`}
      >
        {selected && <Check size={12} strokeWidth={3} />}
      </div>
      <OverlayIconButton title="Details" position="bottom-right" onClick={onInspect}>
        <Info size={12} />
      </OverlayIconButton>
      <OverlayIconButton
        title="Copy public URL"
        position="top-right"
        onClick={() => {
          navigator.clipboard.writeText(object.url);
          onCopied();
        }}
      >
        <Copy size={12} />
      </OverlayIconButton>
    </div>
  );
}

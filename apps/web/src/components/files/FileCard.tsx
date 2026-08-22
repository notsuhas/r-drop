import { Check, Copy, Info } from "lucide-react";
import type { IObject } from "../../lib/api";
import { basename, extension, fmtSize } from "../../lib/format";
import FilePreview from "./FilePreview";

interface IFileCard {
  object: IObject;
  selected: boolean;
  onToggle: () => void;
  onInspect: () => void;
  onCopied: () => void;
}

export default function FileCard(props: IFileCard) {
  const { object, selected, onToggle, onInspect, onCopied } = props;
  return (
    <div
      className={`group relative overflow-hidden rounded-none border bg-panel transition-colors ${
        selected ? "border-honey" : "border-line hover:border-[rgba(255,255,255,0.2)]"
      }`}
    >
      <button type="button" onClick={onToggle} className="block w-full text-left">
        <div className="aspect-square w-full overflow-hidden bg-panel-2">
          <FilePreview url={object.url} keyName={object.key} contentType={object.contentType} />
        </div>
        <div className="border-t border-line p-3">
          <p className="truncate font-mono text-xs">{basename(object.key)}</p>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="uppercase">{extension(object.key)}</span>
            <span>·</span>
            <span>{fmtSize(object.size)}</span>
          </p>
        </div>
      </button>
      <div
        className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-none border text-xs transition-opacity ${
          selected
            ? "border-honey bg-honey text-honey-ink opacity-100"
            : "border-line bg-bg opacity-0 group-hover:opacity-100"
        }`}
      >
        {selected && <Check size={12} strokeWidth={3} />}
      </div>
      <button
        type="button"
        onClick={onInspect}
        title="Details"
        className="absolute bottom-12 right-2 rounded-none border border-line bg-bg/90 px-2 py-1 font-mono text-[10px] text-muted opacity-0 backdrop-blur transition-opacity hover:text-ink group-hover:opacity-100"
      >
        <Info size={12} />
      </button>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(object.url);
          onCopied();
        }}
        title="Copy public URL"
        className="absolute right-2 top-2 rounded-none border border-line bg-bg/90 px-2 py-1 font-mono text-[10px] text-muted opacity-0 backdrop-blur transition-opacity hover:text-ink group-hover:opacity-100"
      >
        <Copy size={12} />
      </button>
    </div>
  );
}

import { Folder } from "lucide-react";
import { fmtSize } from "@/lib/format";

interface IFolderTile {
  /** Full folder path; the label shows only the segment below the parent. */
  name: string;
  label: string;
  size: number;
  onEnter: () => void;
}

export default function FolderTile(props: IFolderTile) {
  const { label, size, onEnter } = props;
  return (
    <button
      type="button"
      onClick={onEnter}
      className="group flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2.5 text-left transition-colors duration-(--duration-fast) ease-(--ease-out-quart) hover:bg-surface-2"
    >
      <Folder
        size={16}
        className="shrink-0 fill-accent/20 text-accent-text transition-colors group-hover:fill-accent/35"
      />
      <span className="min-w-0 flex-1 truncate font-mono text-sm text-ink">{label}</span>
      <span className="shrink-0 font-mono text-2xs text-ink-3">{fmtSize(size)}</span>
    </button>
  );
}

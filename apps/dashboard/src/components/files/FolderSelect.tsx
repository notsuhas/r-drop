import { ChevronDown } from "lucide-react";

interface IFolderSelect {
  current: string;
  folders: string[];
  onMove: (folder: string) => void;
}

/** Moving a file is a rename under the hood, so the control is a plain picker
 *  of existing top-level folders rather than a separate move dialog. */
export default function FolderSelect(props: IFolderSelect) {
  const { current, folders, onMove } = props;
  const options = [current, ...folders.filter((f) => f !== current)];

  return (
    <span className="relative inline-flex items-center">
      <select
        value={current}
        onChange={(e) => onMove(e.target.value)}
        aria-label="Move to folder"
        className="appearance-none rounded-sm bg-surface-2 py-1 pl-2 pr-6 font-mono text-xs text-ink outline-none transition-colors hover:bg-surface-3"
      >
        {options.map((f) => (
          <option key={f || "root"} value={f}>
            {f || "(root)"}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        aria-hidden="true"
        className="pointer-events-none absolute right-1.5 text-ink-3"
      />
    </span>
  );
}

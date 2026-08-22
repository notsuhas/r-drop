import { LayoutGrid, List } from "lucide-react";
import { useRef } from "react";
import Button from "@/components/ui/Button";

interface IFilesToolbar {
  folder: string;
  count: number;
  uploadTarget: string;
  allSelected: boolean;
  hasFiles: boolean;
  filter: string;
  view: "grid" | "list";
  onFilter: (value: string) => void;
  onView: (view: "grid" | "list") => void;
  onSelectAll: () => void;
  onEnterFolder: (folder: string) => void;
  onNewFolder: () => void;
  onUpload: (files: File[]) => void;
}

export default function FilesToolbar(props: IFilesToolbar) {
  const {
    folder,
    count,
    uploadTarget,
    allSelected,
    hasFiles,
    filter,
    view,
    onFilter,
    onView,
    onSelectAll,
    onEnterFolder,
    onNewFolder,
    onUpload,
  } = props;
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <nav className="flex items-center gap-2 font-display text-lg">
        <button
          type="button"
          onClick={() => onEnterFolder("")}
          className={folder ? "text-muted transition-colors hover:text-ink" : "font-semibold"}
        >
          files
        </button>
        {folder && (
          <>
            <span className="text-muted">/</span>
            <span className="font-semibold">{folder}</span>
          </>
        )}
        {count > 0 && (
          <span className="ml-2 bg-panel-2 px-2 py-0.5 text-xs text-muted">{count}</span>
        )}
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        {hasFiles && (
          <Button onClick={onSelectAll}>{allSelected ? "Clear selection" : "Select all"}</Button>
        )}
        <div className="flex border border-line">
          {(
            [
              ["grid", LayoutGrid],
              ["list", List],
            ] as const
          ).map(([mode, Icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onView(mode)}
              aria-label={`${mode} view`}
              className={`px-2.5 py-1.5 transition-colors ${
                view === mode ? "bg-panel-2 text-honey" : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
        <input
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
          placeholder="filter…"
          className="w-36 border border-line bg-panel px-3 py-1.5 font-mono text-sm transition-[width] placeholder:text-muted focus:w-52"
        />
        <Button onClick={onNewFolder}>New folder</Button>
        <Button variant="primary" onClick={() => fileInput.current?.click()}>
          Upload to {uploadTarget}
        </Button>
        <input
          ref={fileInput}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onUpload([...e.target.files]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

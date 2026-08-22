import { useRef } from "react";
import ViewToggle from "@/components/files/ViewToggle";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { fmtSize } from "@/lib/format";

interface IFilesToolbar {
  folder: string;
  count: number;
  totalSize: number;
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
    totalSize,
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
          <span className="ml-2 bg-panel-2 px-2 py-0.5 text-xs text-muted">
            {count} · {fmtSize(totalSize)}
          </span>
        )}
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        {hasFiles && (
          <Button onClick={onSelectAll}>{allSelected ? "Clear selection" : "Select all"}</Button>
        )}
        <ViewToggle view={view} onView={onView} />
        <Input
          value={filter}
          onChange={onFilter}
          placeholder="filter…"
          className="w-36 transition-[width] focus:w-52"
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

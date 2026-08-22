// Sticky two-row header. Row one is identity (where you are, as a CDN path);
// row two is the controls that act on what's below it.
import { CheckSquare, FolderPlus, LayoutGrid, List } from "lucide-react";
import FilterField from "@/components/files/FilterField";
import PathBar from "@/components/files/PathBar";
import SortMenu from "@/components/files/SortMenu";
import UploadButton, { type IUploadEntry } from "@/components/files/UploadButton";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import type { SortKey, ViewMode } from "@/hooks/useViewPrefs";
import { fmtSize } from "@/lib/format";

interface IFilesHeader {
  folder: string;
  publicBase: string;
  fileCount: number;
  folderCount: number;
  totalSize: number;
  uploadTarget: string;
  allSelected: boolean;
  hasFiles: boolean;
  filter: string;
  view: ViewMode;
  sortKey: SortKey;
  sortAsc: boolean;
  onFilter: (value: string) => void;
  onView: (view: ViewMode) => void;
  onSort: (key: SortKey) => void;
  onSelectAll: () => void;
  onEnterFolder: (folder: string) => void;
  onNewFolder: () => void;
  onUpload: (entries: IUploadEntry[]) => void;
}

/** "5 folders · 12 files · 12.0 MB", dropping the parts that are zero. */
function describeContents(folderCount: number, fileCount: number, totalSize: number) {
  return [
    folderCount > 0 && `${folderCount} ${folderCount === 1 ? "folder" : "folders"}`,
    `${fileCount} ${fileCount === 1 ? "file" : "files"}`,
    totalSize > 0 && fmtSize(totalSize),
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function FilesHeader(props: IFilesHeader) {
  const { folder, filter, onFilter } = props;
  const search = <FilterField value={filter} folder={folder} onChange={onFilter} />;

  return (
    <header className="sticky top-0 z-(--z-index-sticky) shrink-0 border-b border-hairline bg-bg/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
        <PathBar folder={folder} publicBase={props.publicBase} onEnter={props.onEnterFolder} />

        <div className="hidden w-48 sm:block lg:w-72">{search}</div>

        <span className="hidden sm:inline-flex">
          <IconButton label="New folder" onClick={props.onNewFolder} variant="solid">
            <FolderPlus size={15} />
          </IconButton>
        </span>

        <UploadButton
          uploadTarget={props.uploadTarget}
          onUpload={props.onUpload}
          onNewFolder={props.onNewFolder}
        />
      </div>

      <div className="flex h-11 items-center gap-2 border-t border-hairline px-3 sm:px-5">
        <div className="min-w-0 flex-1 sm:hidden">{search}</div>
        <p className="hidden min-w-0 truncate font-mono text-xs text-ink-3 sm:block">
          {describeContents(props.folderCount, props.fileCount, props.totalSize)}
        </p>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {props.hasFiles && (
            <span className="hidden md:inline-flex">
              <Button
                size="sm"
                variant="ghost"
                icon={<CheckSquare size={13} />}
                onClick={props.onSelectAll}
              >
                {props.allSelected ? "Clear" : "Select all"}
              </Button>
            </span>
          )}

          <SortMenu sortKey={props.sortKey} sortAsc={props.sortAsc} onSort={props.onSort} />

          <SegmentedControl
            label="View"
            iconOnly
            value={props.view}
            onChange={props.onView}
            segments={[
              { id: "grid", label: "Grid view", icon: <LayoutGrid size={14} /> },
              { id: "list", label: "List view", icon: <List size={14} /> },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

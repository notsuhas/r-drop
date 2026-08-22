// Dispatches the main content area: skeleton, empty state, list, or grid.
import { FolderOpen, SearchX, Upload } from "lucide-react";
import type { IBrowseHandlers } from "@/components/files/browse-types";
import FileGrid from "@/components/files/FileGrid";
import ListView from "@/components/files/ListView";
import Button from "@/components/ui/Button";
import Empty from "@/components/ui/Empty";
import { SkeletonGrid, SkeletonRows } from "@/components/ui/Skeleton";
import type { SortKey } from "@/hooks/useViewPrefs";
import type { IObject } from "@/lib/api";
import type { IFolderEntry } from "@/lib/entries";

interface IFilesContent extends IBrowseHandlers {
  isLoading: boolean;
  view: "grid" | "list";
  folders: IFolderEntry[];
  objects: IObject[];
  folder: string;
  filter: string;
  selected: Set<string>;
  focusKey: string | null;
  sortKey: SortKey;
  sortAsc: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onSort: (key: SortKey) => void;
  onSelectAll: () => void;
  onClearFilter: () => void;
  onUploadClick: () => void;
}

export default function FilesContent(props: IFilesContent) {
  const { isLoading, view, folders, objects, folder, filter, onClearFilter, onUploadClick } = props;

  if (isLoading) return view === "list" ? <SkeletonRows /> : <SkeletonGrid />;

  if (objects.length === 0 && folders.length === 0) {
    if (filter)
      return (
        <Empty
          icon={<SearchX size={18} />}
          title={`Nothing here matches "${filter}"`}
          hint="Filtering only looks at file names in the folder you're in. Clear it to see everything again."
          action={
            <Button size="sm" onClick={onClearFilter}>
              Clear filter
            </Button>
          }
        />
      );

    return (
      <Empty
        icon={folder ? <FolderOpen size={18} /> : <Upload size={18} />}
        title={folder ? `${folder} is empty` : "Nothing uploaded yet"}
        hint="Drop files or folders anywhere in this window, or use Upload. Each file gets a public CDN URL the moment it lands."
        action={
          <Button size="sm" variant="primary" icon={<Upload size={13} />} onClick={onUploadClick}>
            Upload files
          </Button>
        }
      />
    );
  }

  if (view === "list")
    return (
      <ListView
        folders={folders}
        objects={objects}
        selected={props.selected}
        focusKey={props.focusKey}
        sortKey={props.sortKey}
        sortAsc={props.sortAsc}
        allSelected={props.allSelected}
        someSelected={props.someSelected}
        onSort={props.onSort}
        onSelectAll={props.onSelectAll}
        onEnterFolder={props.onEnterFolder}
        onSelect={props.onSelect}
        onToggleSelect={props.onToggleSelect}
        onOpen={props.onOpen}
        onMenu={props.onMenu}
      />
    );

  return (
    <FileGrid
      folders={folders}
      objects={objects}
      selected={props.selected}
      focusKey={props.focusKey}
      onEnterFolder={props.onEnterFolder}
      onSelect={props.onSelect}
      onToggleSelect={props.onToggleSelect}
      onOpen={props.onOpen}
      onInspect={props.onInspect}
      onCopyUrl={props.onCopyUrl}
      onMenu={props.onMenu}
    />
  );
}

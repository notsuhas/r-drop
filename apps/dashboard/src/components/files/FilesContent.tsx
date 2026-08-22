// Dispatches the main content area: skeleton, empty state, list, or grid.

import Empty from "@/components/ui/Empty";
import SkeletonGrid from "@/components/ui/Skeleton";
import type { IObject } from "@/lib/api";
import FileGrid from "./FileGrid";
import ListView, { type SortKey } from "./ListView";

interface IFilesContent {
  isLoading: boolean;
  view: "grid" | "list";
  objects: IObject[];
  emptyTitle: string;
  selected: Set<string>;
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
  onToggle: (key: string) => void;
  onInspect: (object: IObject) => void;
  onCopied: () => void;
}

export default function FilesContent(props: IFilesContent) {
  const { isLoading, view, objects, emptyTitle, ...rest } = props;

  if (isLoading) return <SkeletonGrid />;

  if (objects.length === 0)
    return (
      <div className="mt-6">
        <Empty
          title={emptyTitle}
          hint="Drop files or folders anywhere in this window, or use Upload. Files get a public URL immediately."
        />
      </div>
    );

  if (view === "list")
    return (
      <ListView
        objects={objects}
        selected={rest.selected}
        sortKey={rest.sortKey}
        sortAsc={rest.sortAsc}
        onSort={rest.onSort}
        onToggle={rest.onToggle}
        onInspect={rest.onInspect}
      />
    );

  return (
    <FileGrid
      objects={objects}
      selected={rest.selected}
      onToggle={rest.onToggle}
      onInspect={rest.onInspect}
      onCopied={rest.onCopied}
    />
  );
}

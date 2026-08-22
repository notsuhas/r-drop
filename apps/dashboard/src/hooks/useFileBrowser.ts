// File-browser data layer: routing, listing, mutations, and copy-links.
// UI state lives in useSelection / useViewPrefs; pages/Files.tsx composes.
import { useCallback, useMemo, useState } from "react";
import type { IObject } from "@/lib/api";
import type { IFolderEntry } from "@/lib/entries";
import { folderLabel } from "@/lib/links";
import { useCopyLinks } from "./useCopyLinks";
import { useFolderRoute } from "./useFolderRoute";
import { useObjectListing } from "./useObjectListing";
import { useObjectMutations } from "./useObjectMutations";
import { useSelection } from "./useSelection";
import { useUploads } from "./useUploads";
import { useViewPrefs } from "./useViewPrefs";

interface IDerived {
  /** Visual order, which is what Shift-range and arrow keys walk. */
  orderedKeys: string[];
  selectedObjects: IObject[];
  selectedSize: number;
  allSelected: boolean;
  folders: IFolderEntry[];
}

/** Everything the views need that is a pure function of the listing plus the
 *  selection — derived in one pass rather than five separate memos. */
function derive(
  visible: IObject[],
  selected: Set<string>,
  folders: { name: string; size: number }[],
  folder: string,
): IDerived {
  const selectedObjects = visible.filter((o) => selected.has(o.key));
  return {
    orderedKeys: visible.map((o) => o.key),
    selectedObjects,
    selectedSize: selectedObjects.reduce((sum, o) => sum + o.size, 0),
    allSelected: visible.length > 0 && selectedObjects.length === visible.length,
    folders: folders.map((f) => ({
      name: f.name,
      label: folderLabel(f.name, folder),
      size: f.size,
    })),
  };
}

export function useFileBrowser() {
  const selection = useSelection();
  const prefs = useViewPrefs();
  const [inspected, setInspected] = useState<IObject | null>(null);
  const [filter, setFilter] = useState("");
  const [draftingFolder, setDraftingFolder] = useState(false);

  const resetBrowsingState = useCallback(() => {
    selection.clear();
    setInspected(null);
  }, [selection.clear]);

  const onNavigate = useCallback(() => {
    resetBrowsingState();
    setDraftingFolder(false);
    setFilter("");
  }, [resetBrowsingState]);

  const { folder, uploadTarget, enterFolder } = useFolderRoute(onNavigate);
  const listing = useObjectListing(folder, filter, prefs.sortKey, prefs.sortAsc);
  const uploads = useUploads(listing.invalidate);
  const { remove, rename } = useObjectMutations(listing.invalidate, resetBrowsingState);

  const derived = useMemo(
    () => derive(listing.visible, selection.selected, listing.folders, folder),
    [listing.visible, selection.selected, listing.folders, folder],
  );

  const { copy } = useCopyLinks(
    () => derived.selectedObjects,
    () => uploadTarget,
  );

  const selectAllOrNone = useCallback(() => {
    selection.selectExactly(derived.allSelected ? [] : derived.orderedKeys);
  }, [derived.allSelected, derived.orderedKeys, selection.selectExactly]);

  return {
    folder,
    uploadTarget,
    rootFolders: listing.rootFolders,
    totalSize: listing.totalSize,
    visible: listing.visible,
    isLoading: listing.isLoading,
    ...prefs,
    ...derived,
    selected: selection.selected,
    focusKey: selection.focusKey,
    setFocusKey: selection.setFocusKey,
    select: selection.select,
    clearSelection: selection.clear,
    marqueeSelect: selection.marqueeSelect,
    selectAllOrNone,
    inspected,
    setInspected,
    filter,
    setFilter,
    draftingFolder,
    setDraftingFolder,
    uploads,
    remove,
    rename,
    copy,
    enterFolder,
  };
}

export type FileBrowser = ReturnType<typeof useFileBrowser>;

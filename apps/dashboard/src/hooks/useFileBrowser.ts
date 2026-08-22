// File-browser data layer: routing, listing, mutations, and copy-links.
// UI state lives in useSelection / useViewPrefs; pages/Files.tsx composes.
import { useCallback, useState } from "react";
import type { IObject } from "../lib/api";
import { useCopyLinks } from "./useCopyLinks";
import { useFolderRoute } from "./useFolderRoute";
import { useObjectListing } from "./useObjectListing";
import { useObjectMutations } from "./useObjectMutations";
import { useSelection } from "./useSelection";
import { useUploads } from "./useUploads";
import { useViewPrefs } from "./useViewPrefs";

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

  const route = useFolderRoute(
    useCallback(() => {
      resetBrowsingState();
      setDraftingFolder(false);
      setFilter("");
    }, [resetBrowsingState]),
  );
  const { folder, uploadTarget, enterFolder } = route;

  const listing = useObjectListing(folder, filter, prefs.sortKey, prefs.sortAsc);
  const uploads = useUploads(listing.invalidate);
  const { remove, rename } = useObjectMutations(listing.invalidate, resetBrowsingState);
  const { visible } = listing;

  const selectedObjects = visible.filter((o) => selection.selected.has(o.key));
  const allSelected = visible.length > 0 && selectedObjects.length === visible.length;

  const { copied, flashCopied, copy } = useCopyLinks(
    () => selectedObjects,
    () => uploadTarget,
  );

  const selectAllOrNone = useCallback(() => {
    selection.selectExactly(allSelected ? [] : visible.map((o) => o.key));
  }, [allSelected, visible, selection.selectExactly]);

  return {
    folder,
    uploadTarget,
    folders: listing.folders,
    rootFolders: listing.rootFolders,
    visible,
    isLoading: listing.isLoading,
    ...prefs,
    selected: selection.selected,
    toggle: selection.toggle,
    marqueeSelect: selection.marqueeSelect,
    selectedObjects,
    allSelected,
    selectAllOrNone,
    inspected,
    setInspected,
    copied,
    flashCopied,
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

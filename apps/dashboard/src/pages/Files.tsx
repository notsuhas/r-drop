// File browser: composition only. Data lives in useFileBrowser, actions in
// useFileActions, keyboard handling in useFileKeyboard.
import { useCallback, useRef, useState } from "react";
import DropOverlay from "@/components/files/DropOverlay";
import FilesContent from "@/components/files/FilesContent";
import FilesHeader from "@/components/files/FilesHeader";
import FilesOverlays from "@/components/files/FilesOverlays";
import { FILTER_INPUT_ID } from "@/components/files/FilterField";
import NewFolderField from "@/components/files/NewFolderField";
import { UPLOAD_INPUT_ID } from "@/components/files/UploadButton";
import UploadTray from "@/components/files/UploadTray";
import type { IMenuAnchor } from "@/components/ui/Menu";
import { useDropZone } from "@/hooks/useDropZone";
import { useFileActions } from "@/hooks/useFileActions";
import { useFileBrowser } from "@/hooks/useFileBrowser";
import { useFileKeyboard } from "@/hooks/useFileKeyboard";
import { useMarquee } from "@/hooks/useMarquee";
import { usePublicBase } from "@/hooks/usePublicBase";
import type { IObject } from "@/lib/api";

export default function Files() {
  const b = useFileBrowser();
  const act = useFileActions(b);
  const publicBase = usePublicBase();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<IMenuAnchor | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);

  const marquee = useMarquee(b.marqueeSelect);
  const drop = useDropZone((file, dir) => act.enqueue([{ file, dir }]));

  const openObject = useCallback(
    (object: IObject) => {
      setRenameTarget(null);
      b.setInspected(object);
    },
    [b.setInspected],
  );

  /** Right-click selects the item first when it isn't already in the selection,
   *  so the menu always speaks for what's highlighted. */
  const openMenu = useCallback(
    (key: string, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!b.selected.has(key)) act.select(key, "replace");
      setMenuAnchor({ x: event.clientX, y: event.clientY });
    },
    [b.selected, act.select],
  );

  useFileKeyboard({
    orderedKeys: b.orderedKeys,
    focusKey: b.focusKey,
    view: b.view,
    containerRef: scrollRef,
    hasSelection: b.selected.size > 0,
    onFocus: b.setFocusKey,
    onSelect: act.select,
    onSelectAll: b.selectAllOrNone,
    onClear: b.clearSelection,
    onOpen: (key) => {
      const object = b.visible.find((o) => o.key === key);
      if (object) openObject(object);
    },
    onRequestDelete: () => setDeleteArmed(true),
    onFocusFilter: () => document.getElementById(FILTER_INPUT_ID)?.focus(),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <FilesHeader
          folder={b.folder}
          publicBase={publicBase}
          fileCount={b.visible.length}
          folderCount={b.folders.length}
          totalSize={b.totalSize}
          uploadTarget={b.uploadTarget}
          allSelected={b.allSelected}
          hasFiles={b.visible.length > 0}
          filter={b.filter}
          view={b.view}
          sortKey={b.sortKey}
          sortAsc={b.sortAsc}
          onFilter={b.setFilter}
          onView={b.setViewMode}
          onSort={b.onSort}
          onSelectAll={b.selectAllOrNone}
          onEnterFolder={b.enterFolder}
          onNewFolder={() => b.setDraftingFolder(true)}
          onUpload={act.enqueue}
        />

        <div
          ref={scrollRef}
          className="relative min-h-0 flex-1 touch-pan-y select-none overflow-y-auto px-3 pb-28 pt-4 sm:px-5"
          {...marquee.handlers}
          {...drop.handlers}
        >
          {b.draftingFolder && (
            <div className="mb-4">
              <NewFolderField
                parent={b.folder}
                onConfirm={(name) => b.enterFolder(b.folder ? `${b.folder}/${name}` : name)}
                onCancel={() => b.setDraftingFolder(false)}
              />
            </div>
          )}

          <FilesContent
            isLoading={b.isLoading}
            view={b.view}
            folders={b.folders}
            objects={b.visible}
            folder={b.folder}
            filter={b.filter}
            selected={b.selected}
            focusKey={b.focusKey}
            sortKey={b.sortKey}
            sortAsc={b.sortAsc}
            allSelected={b.allSelected}
            someSelected={b.selected.size > 0}
            onSort={b.onSort}
            onSelectAll={b.selectAllOrNone}
            onClearFilter={() => b.setFilter("")}
            onEnterFolder={b.enterFolder}
            onSelect={act.selectFromClick}
            onOpen={openObject}
            onInspect={openObject}
            onCopyUrl={act.copyOneUrl}
            onMenu={openMenu}
            onUploadClick={() => document.getElementById(UPLOAD_INPUT_ID)?.click()}
          />

          {marquee.rect && (
            <div
              className="pointer-events-none fixed z-(--z-index-dropdown) rounded-xs border border-honey bg-honey-wash"
              style={marquee.rect}
            />
          )}
        </div>
      </div>

      <FilesOverlays
        browser={b}
        actions={act}
        renameTarget={renameTarget}
        onRenameTarget={setRenameTarget}
        deleteArmed={deleteArmed}
        onDeleteArmed={setDeleteArmed}
        menuAnchor={menuAnchor}
        onCloseMenu={() => setMenuAnchor(null)}
        onInspect={openObject}
      />

      <UploadTray
        items={b.uploads.items}
        active={b.uploads.active}
        onDismiss={b.uploads.dismiss}
        onCancel={b.uploads.cancel}
        onCancelAll={b.uploads.cancelAll}
      />
      {drop.dragging && <DropOverlay target={b.uploadTarget} />}
    </div>
  );
}

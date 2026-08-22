// File browser: pure composition — all state lives in useFileBrowser.
import DropOverlay from "../components/files/DropOverlay";
import FilesContent from "../components/files/FilesContent";
import FilesToolbar from "../components/files/FilesToolbar";
import FolderChips from "../components/files/FolderChips";
import InspectorDrawer from "../components/files/InspectorDrawer";
import SelectionPill from "../components/files/SelectionPill";
import UploadTray from "../components/files/UploadTray";
import { useDropZone } from "../hooks/useDropZone";
import { useFileBrowser } from "../hooks/useFileBrowser";
import { useMarquee } from "../hooks/useMarquee";

export default function Files() {
  const b = useFileBrowser();
  const marquee = useMarquee(b.marqueeSelect);
  const drop = useDropZone((file, dir) =>
    b.uploads.enqueue([{ file, folder: dir ? `${b.uploadTarget}/${dir}` : b.uploadTarget }]),
  );

  const emptyTitle = b.filter
    ? `Nothing matches "${b.filter}"`
    : b.folder
      ? `${b.folder} is empty`
      : "No files yet";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-drop and marquee are enhancements; buttons remain the accessible path
    <div
      className="relative flex-1 touch-none select-none overflow-y-auto p-8 pb-28"
      {...marquee.handlers}
      {...drop.handlers}
    >
      <FilesToolbar
        folder={b.folder}
        count={b.visible.length}
        uploadTarget={b.uploadTarget}
        allSelected={b.allSelected}
        hasFiles={b.visible.length > 0}
        filter={b.filter}
        view={b.view}
        onFilter={b.setFilter}
        onView={b.setViewMode}
        onSelectAll={b.selectAllOrNone}
        onEnterFolder={b.enterFolder}
        onNewFolder={() => b.setDraftingFolder(true)}
        onUpload={(files) =>
          b.uploads.enqueue(files.map((file) => ({ file, folder: b.uploadTarget })))
        }
      />

      <FolderChips
        folders={b.folders}
        parent={b.folder}
        drafting={b.draftingFolder}
        onEnter={b.enterFolder}
        onConfirmDraft={(name) => b.enterFolder(b.folder ? `${b.folder}/${name}` : name)}
        onCancelDraft={() => b.setDraftingFolder(false)}
      />

      <FilesContent
        isLoading={b.isLoading}
        view={b.view}
        objects={b.visible}
        emptyTitle={emptyTitle}
        selected={b.selected}
        sortKey={b.sortKey}
        sortAsc={b.sortAsc}
        onSort={b.onSort}
        onToggle={b.toggle}
        onInspect={b.setInspected}
        onCopied={b.flashCopied}
      />

      {b.selectedObjects.length > 0 && (
        <SelectionPill
          count={b.selectedObjects.length}
          copied={b.copied}
          onCopy={b.copy}
          onDelete={() => b.remove.mutate([...b.selected])}
        />
      )}

      {b.inspected && (
        <InspectorDrawer
          object={b.inspected}
          folders={b.rootFolders}
          onClose={() => b.setInspected(null)}
          onCopied={b.flashCopied}
          onDelete={() => b.remove.mutate([b.inspected?.key ?? ""])}
          onRename={(newKey) => b.rename.mutate({ key: b.inspected?.key ?? "", newKey })}
        />
      )}

      <UploadTray items={b.uploads.items} active={b.uploads.active} onDismiss={b.uploads.dismiss} />
      {drop.dragging && <DropOverlay target={b.uploadTarget} />}
      {marquee.rect && (
        <div
          className="pointer-events-none fixed z-10 border border-honey bg-[rgba(255,178,86,0.1)]"
          style={marquee.rect}
        />
      )}
    </div>
  );
}

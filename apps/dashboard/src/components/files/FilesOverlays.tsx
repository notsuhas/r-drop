// Everything that floats above the browser: the details panel, the selection
// bar, and the right-click menu. Kept out of the page so the page reads as one
// layout rather than a pile of conditionals.
import DetailsPanel from "@/components/files/DetailsPanel";
import ObjectMenu from "@/components/files/ObjectMenu";
import SelectionBar from "@/components/files/SelectionBar";
import type { IMenuAnchor } from "@/components/ui/Menu";
import type { FileActions } from "@/hooks/useFileActions";
import type { FileBrowser } from "@/hooks/useFileBrowser";
import type { IObject } from "@/lib/api";
import { downloadFile } from "@/lib/download";
import { basename } from "@/lib/format";

interface IFilesOverlays {
  browser: FileBrowser;
  actions: FileActions;
  /** Key whose rename was started from the context menu, if any. */
  renameTarget: string | null;
  onRenameTarget: (key: string | null) => void;
  deleteArmed: boolean;
  onDeleteArmed: (armed: boolean) => void;
  menuAnchor: IMenuAnchor | null;
  onCloseMenu: () => void;
  onInspect: (object: IObject) => void;
}

export default function FilesOverlays(props: IFilesOverlays) {
  const { browser: b, actions: act, menuAnchor, onCloseMenu, onInspect } = props;
  const inspected = b.inspected;

  return (
    <>
      {inspected && (
        <DetailsPanel
          object={inspected}
          folders={b.rootFolders}
          startRenaming={props.renameTarget === inspected.key}
          onRenamingDone={() => props.onRenameTarget(null)}
          onClose={() => {
            props.onRenameTarget(null);
            b.setInspected(null);
          }}
          onDelete={() => act.remove([inspected.key])}
          onRename={(newKey) => act.rename(inspected.key, newKey)}
        />
      )}

      {b.selectedObjects.length > 0 && (
        <SelectionBar
          count={b.selectedObjects.length}
          totalSize={b.selectedSize}
          deleteArmed={props.deleteArmed}
          onDeleteArmedChange={props.onDeleteArmed}
          onCopy={act.copy}
          onDelete={() => act.remove([...b.selected])}
          onClear={b.clearSelection}
        />
      )}

      {menuAnchor && (
        <ObjectMenu
          anchor={menuAnchor}
          objects={b.selectedObjects}
          onClose={onCloseMenu}
          onCopy={act.copy}
          onInspect={onInspect}
          onRename={(object) => {
            props.onRenameTarget(object.key);
            b.setInspected(object);
          }}
          onDownload={(object) => downloadFile(object.url, basename(object.key))}
          onDelete={() => props.onDeleteArmed(true)}
        />
      )}
    </>
  );
}

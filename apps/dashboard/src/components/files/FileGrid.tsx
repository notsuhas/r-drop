import type { IBrowseHandlers } from "@/components/files/browse-types";
import FileTile from "@/components/files/FileTile";
import FolderTile from "@/components/files/FolderTile";
import type { IObject } from "@/lib/api";
import type { IFolderEntry } from "@/lib/entries";

interface IFileGrid extends IBrowseHandlers {
  folders: IFolderEntry[];
  objects: IObject[];
  selected: Set<string>;
  focusKey: string | null;
}

export default function FileGrid(props: IFileGrid) {
  const {
    folders,
    objects,
    selected,
    focusKey,
    onEnterFolder,
    onSelect,
    onOpen,
    onInspect,
    onCopyUrl,
    onMenu,
  } = props;

  return (
    <div className="space-y-6">
      {folders.length > 0 && (
        <section aria-label="Folders">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
            {folders.map((f) => (
              <FolderTile
                key={f.name}
                name={f.name}
                label={f.label}
                size={f.size}
                onEnter={() => onEnterFolder(f.name)}
              />
            ))}
          </div>
        </section>
      )}

      {objects.length > 0 && (
        <section aria-label="Files">
          {folders.length > 0 && (
            <h2 className="mb-2.5 text-xs font-medium text-ink-3">Files in this folder</h2>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
            {objects.map((o) => (
              <div key={o.key} data-key={o.key}>
                <FileTile
                  object={o}
                  selected={selected.has(o.key)}
                  focused={focusKey === o.key}
                  onSelect={(e) => onSelect(o.key, e)}
                  onOpen={() => onOpen(o)}
                  onInspect={() => onInspect(o)}
                  onCopyUrl={() => onCopyUrl(o)}
                  onMenu={(e) => onMenu(o.key, e)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

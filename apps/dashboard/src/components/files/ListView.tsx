// Dense list. Rows are separated by hairlines rather than boxed in a grid of
// cell borders — the old bordered table read as a spreadsheet, not a drive.
import { ArrowDown, ArrowUp, Folder, MoreVertical } from "lucide-react";
import FilePreview from "@/components/files/FilePreview";
import Checkbox from "@/components/ui/Checkbox";
import IconButton from "@/components/ui/IconButton";
import type { SortKey } from "@/hooks/useViewPrefs";
import type { IObject } from "@/lib/api";
import { cx } from "@/lib/cx";
import type { IFolderEntry } from "@/lib/entries";
import { basename, extension, fmtSize, fmtWhen, fmtWhenExact } from "@/lib/format";

interface IListView {
  folders: IFolderEntry[];
  objects: IObject[];
  selected: Set<string>;
  focusKey: string | null;
  sortKey: SortKey;
  sortAsc: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onSort: (key: SortKey) => void;
  onSelectAll: () => void;
  onEnterFolder: (name: string) => void;
  onSelect: (key: string, event: React.MouseEvent) => void;
  onOpen: (object: IObject) => void;
  onMenu: (key: string, event: React.MouseEvent) => void;
}

const COLUMNS: { id: SortKey; label: string; className: string }[] = [
  { id: "name", label: "Name", className: "text-left" },
  { id: "size", label: "Size", className: "hidden sm:table-cell text-right w-24" },
  { id: "uploaded", label: "Uploaded", className: "hidden md:table-cell text-right w-40" },
];

export default function ListView(props: IListView) {
  const {
    folders,
    objects,
    selected,
    focusKey,
    sortKey,
    sortAsc,
    allSelected,
    someSelected,
    onSort,
    onSelectAll,
    onEnterFolder,
    onSelect,
    onOpen,
    onMenu,
  } = props;

  return (
    <div className="overflow-hidden rounded-lg bg-surface">
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th scope="col" className="w-10 px-3">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                label={allSelected ? "Clear selection" : "Select all files"}
                onChange={onSelectAll}
              />
            </th>
            {COLUMNS.map((col) => {
              const active = sortKey === col.id;
              return (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={active ? (sortAsc ? "ascending" : "descending") : "none"}
                  className={col.className}
                >
                  <button
                    type="button"
                    onClick={() => onSort(col.id)}
                    className={cx(
                      "inline-flex h-9 items-center gap-1 rounded-sm px-2 text-xs font-medium transition-colors duration-(--duration-fast)",
                      active ? "text-ink" : "text-ink-3 hover:text-ink",
                    )}
                  >
                    {col.label}
                    {active &&
                      (sortAsc ? (
                        <ArrowUp size={11} className="text-accent-text" />
                      ) : (
                        <ArrowDown size={11} className="text-accent-text" />
                      ))}
                  </button>
                </th>
              );
            })}
            <th scope="col" className="w-11">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {folders.map((f) => (
            <tr
              key={f.name}
              className="group border-b border-hairline transition-colors duration-(--duration-fast) last:border-b-0 hover:bg-surface-2"
            >
              <td className="px-3" />
              <td className="px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => onEnterFolder(f.name)}
                  className="flex min-w-0 items-center gap-2.5 text-left"
                >
                  <Folder size={15} className="shrink-0 fill-accent/20 text-accent-text" />
                  <span className="min-w-0 truncate font-mono text-sm">{f.label}</span>
                </button>
              </td>
              <td className="hidden px-2 text-right font-mono text-xs text-ink-2 sm:table-cell">
                {fmtSize(f.size)}
              </td>
              <td className="hidden px-2 text-right font-mono text-xs text-ink-3 md:table-cell">
                —
              </td>
              <td />
            </tr>
          ))}

          {objects.map((o) => {
            const isSel = selected.has(o.key);
            const name = basename(o.key);
            return (
              <tr
                key={o.key}
                data-key={o.key}
                onClick={(e) => onSelect(o.key, e)}
                onDoubleClick={() => onOpen(o)}
                onContextMenu={(e) => onMenu(o.key, e)}
                className={cx(
                  "group cursor-default border-b border-hairline transition-colors duration-(--duration-fast) last:border-b-0",
                  isSel ? "bg-accent-wash" : "hover:bg-surface-2",
                  focusKey === o.key && !isSel && "bg-surface-2",
                )}
              >
                <td className="px-3">
                  <Checkbox
                    checked={isSel}
                    label={`Select ${name}`}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelect(o.key, e);
                    }}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="bg-checker h-7 w-7 shrink-0 overflow-hidden rounded-sm bg-surface-2">
                      <FilePreview
                        variant="row"
                        url={o.url}
                        keyName={o.key}
                        contentType={o.contentType}
                      />
                    </span>
                    <span className="min-w-0 truncate font-mono text-sm" title={name}>
                      {name}
                    </span>
                    <span className="shrink-0 font-mono text-2xs uppercase text-ink-3">
                      {extension(o.key)}
                    </span>
                  </div>
                </td>
                <td className="hidden px-2 text-right font-mono text-xs text-ink-2 sm:table-cell">
                  {fmtSize(o.size)}
                </td>
                <td
                  className="hidden px-2 text-right font-mono text-xs text-ink-3 md:table-cell"
                  title={fmtWhenExact(o.uploaded)}
                >
                  {fmtWhen(o.uploaded)}
                </td>
                <td className="px-1 text-center">
                  <IconButton
                    size="sm"
                    label={`More actions for ${name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMenu(o.key, e);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <MoreVertical size={14} />
                  </IconButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

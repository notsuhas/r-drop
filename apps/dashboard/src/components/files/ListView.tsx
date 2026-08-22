import { Check, Info } from "lucide-react";
import type { IObject } from "../../lib/api";
import { basename, extension, fmtSize } from "../../lib/format";

export type SortKey = "name" | "size" | "uploaded";

interface IListView {
  objects: IObject[];
  selected: Set<string>;
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
  onToggle: (key: string) => void;
  onInspect: (object: IObject) => void;
}

const columns: { id: SortKey; label: string; align?: string }[] = [
  { id: "name", label: "name" },
  { id: "size", label: "size", align: "text-right" },
  { id: "uploaded", label: "uploaded", align: "text-right" },
];

export default function ListView(props: IListView) {
  const { objects, selected, sortKey, sortAsc, onSort, onToggle, onInspect } = props;
  return (
    <table className="mt-6 w-full border-collapse border border-line text-sm">
      <thead>
        <tr className="border-b border-line bg-panel">
          <th className="w-10 border-r border-line" aria-label="Selection" />
          {columns.map((col) => (
            <th key={col.id} className={`border-r border-line last:border-r-0 ${col.align ?? ""}`}>
              <button
                type="button"
                onClick={() => onSort(col.id)}
                className={`w-full px-3 py-2 font-display text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink ${
                  col.align ?? "text-left"
                }`}
              >
                {col.label}
                {sortKey === col.id && (
                  <span className="ml-1 text-honey">{sortAsc ? "↑" : "↓"}</span>
                )}
              </button>
            </th>
          ))}
          <th className="w-12" aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {objects.map((o) => {
          const isSel = selected.has(o.key);
          return (
            <tr
              key={o.key}
              data-key={o.key}
              className={`cursor-pointer border-b border-line transition-colors last:border-b-0 ${
                isSel ? "bg-[rgba(255,178,86,0.08)]" : "hover:bg-panel"
              }`}
              onClick={() => onToggle(o.key)}
            >
              <td className="border-r border-line px-3">
                <span
                  className={`flex h-4 w-4 items-center justify-center border ${
                    isSel ? "border-honey bg-honey text-honey-ink" : "border-line"
                  }`}
                >
                  {isSel && <Check size={10} strokeWidth={3} />}
                </span>
              </td>
              <td className="border-r border-line px-3 py-2">
                <span className="font-mono text-xs">{basename(o.key)}</span>
                <span className="ml-2 text-xs uppercase text-muted">{extension(o.key)}</span>
              </td>
              <td className="border-r border-line px-3 py-2 text-right font-mono text-xs">
                {fmtSize(o.size)}
              </td>
              <td className="border-r border-line px-3 py-2 text-right font-mono text-xs text-muted">
                {new Date(o.uploaded).toLocaleString()}
              </td>
              <td className="px-3 text-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspect(o);
                  }}
                  className="text-muted hover:text-ink"
                  aria-label={`Details for ${basename(o.key)}`}
                >
                  <Info size={14} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

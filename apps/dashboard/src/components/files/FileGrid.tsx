import type { IObject } from "@/lib/api";
import FileCard from "./FileCard";

interface IFileGrid {
  objects: IObject[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  onInspect: (object: IObject) => void;
  onCopied: () => void;
}

export default function FileGrid(props: IFileGrid) {
  const { objects, selected, onToggle, onInspect, onCopied } = props;
  return (
    <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      {objects.map((o) => (
        <div key={o.key} data-key={o.key}>
          <FileCard
            object={o}
            selected={selected.has(o.key)}
            onToggle={() => onToggle(o.key)}
            onInspect={() => onInspect(o)}
            onCopied={onCopied}
          />
        </div>
      ))}
    </div>
  );
}

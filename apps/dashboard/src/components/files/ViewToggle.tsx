import { LayoutGrid, List } from "lucide-react";

interface IViewToggle {
  view: "grid" | "list";
  onView: (view: "grid" | "list") => void;
}

export default function ViewToggle(props: IViewToggle) {
  const { view, onView } = props;
  return (
    <div className="flex border border-line">
      {(
        [
          ["grid", LayoutGrid],
          ["list", List],
        ] as const
      ).map(([mode, Icon]) => (
        <button
          key={mode}
          type="button"
          onClick={() => onView(mode)}
          aria-label={`${mode} view`}
          className={`px-2.5 py-1.5 transition-colors ${
            view === mode ? "bg-panel-2 text-honey" : "text-muted hover:text-ink"
          }`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}

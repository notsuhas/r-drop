import { Folder, FolderPlus } from "lucide-react";

interface IFolderChips {
  folders: string[];
  parent: string;
  drafting: boolean;
  onEnter: (folder: string) => void;
  onConfirmDraft: (name: string) => void;
  onCancelDraft: () => void;
}

const label = (full: string, parent: string) => (parent ? full.slice(parent.length + 1) : full);

export default function FolderChips(props: IFolderChips) {
  const { folders, parent, drafting, onEnter, onConfirmDraft, onCancelDraft } = props;
  if (folders.length === 0 && !drafting) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {drafting && (
        <form
          className="flex items-center gap-2 border-2 border-honey bg-panel px-4 py-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("name") as HTMLInputElement;
            const name = input.value
              .toLowerCase()
              .replace(/[^a-z0-9_-]+/g, "-")
              .replace(/^-+|-+$/g, "");
            if (name) onConfirmDraft(name);
            else onCancelDraft();
          }}
        >
          <FolderPlus size={15} className="text-honey" />
          <input
            // biome-ignore lint/a11y/noAutofocus: the draft chip exists to be typed into
            autoFocus
            name="name"
            placeholder="folder name"
            onKeyDown={(e) => e.key === "Escape" && onCancelDraft()}
            onBlur={(e) => e.target.value.trim() === "" && onCancelDraft()}
            className="w-32 bg-transparent font-display text-sm outline-none placeholder:text-muted"
          />
        </form>
      )}
      {folders.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onEnter(f)}
          className="flex items-center gap-2 border border-line bg-panel px-4 py-2.5 transition-colors hover:border-[rgba(255,178,86,0.4)]"
        >
          <Folder size={15} className="text-honey" />
          <span className="font-display text-sm">{label(f, parent)}</span>
        </button>
      ))}
    </div>
  );
}

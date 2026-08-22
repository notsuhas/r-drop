import { FolderPlus } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { normalizeFolderName } from "@/lib/folder-name";

interface INewFolderField {
  /** Folder the new one is created inside, shown so the target is unambiguous. */
  parent: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function NewFolderField(props: INewFolderField) {
  const { parent, onConfirm, onCancel } = props;
  const [name, setName] = useState("");
  const normalized = normalizeFolderName(name);

  return (
    <form
      className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (normalized) onConfirm(normalized);
        else onCancel();
      }}
    >
      <FolderPlus size={15} className="ml-1 shrink-0 text-accent-text" />
      <span className="shrink-0 font-mono text-xs text-ink-3">
        {parent ? `${parent}/` : "root /"}
      </span>
      <Input
        value={name}
        onChange={setName}
        mono
        autoFocus
        aria-label="New folder name"
        placeholder="folder-name"
        onEscape={onCancel}
        className="w-40"
      />
      <Button size="sm" variant="primary" type="submit" disabled={!normalized}>
        Create
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <p className="w-full pl-1 text-2xs text-ink-3">
        Folders appear once they hold a file — creating one opens it so you can upload.
      </p>
    </form>
  );
}

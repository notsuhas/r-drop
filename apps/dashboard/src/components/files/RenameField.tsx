import { Pencil } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface IRenameField {
  value: string;
  onRename: (next: string) => void;
  compact?: boolean;
}

export default function RenameField(props: IRenameField) {
  const { value, onRename, compact } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing)
    return (
      <span className="group/name flex min-w-0 items-center gap-2">
        <span className={`truncate font-mono ${compact ? "text-xs" : "text-sm"}`}>{value}</span>
        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className={`shrink-0 text-muted hover:text-ink ${compact ? "opacity-0 group-hover/name:opacity-100" : ""}`}
          aria-label={`Rename ${value}`}
        >
          <Pencil size={compact ? 11 : 13} />
        </button>
      </span>
    );

  return (
    <form
      className="flex min-w-0 flex-1 items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (draft && draft !== value) onRename(draft);
        setEditing(false);
      }}
    >
      <Input
        value={draft}
        onChange={setDraft}
        autoFocus
        onEscape={() => setEditing(false)}
        className={`min-w-0 flex-1 bg-bg py-1 ${compact ? "text-xs" : ""}`}
      />
      <Button variant="primary" type="submit">
        Save
      </Button>
    </form>
  );
}

import { Pencil } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface IRenameField {
  value: string;
  onRename: (next: string) => void;
}

export default function RenameField(props: IRenameField) {
  const { value, onRename } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing)
    return (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate font-mono text-sm">{value}</span>
        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className="shrink-0 text-muted hover:text-ink"
          aria-label={`Rename ${value}`}
        >
          <Pencil size={13} />
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
        className="min-w-0 flex-1 bg-bg py-1"
      />
      <Button variant="primary" type="submit">
        Save
      </Button>
    </form>
  );
}

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import { cx } from "@/lib/cx";

interface IRenameField {
  value: string;
  onRename: (next: string) => void;
  /** Compact hides the pencil until hover, for dense rows and tiles. */
  compact?: boolean;
  /** Externally-driven editing, so a context menu can start a rename. */
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export default function RenameField(props: IRenameField) {
  const { value, onRename, compact, editing: editingProp, onEditingChange } = props;
  const [editingSelf, setEditingSelf] = useState(false);
  const editing = editingProp ?? editingSelf;
  const [draft, setDraft] = useState(value);

  const setEditing = (next: boolean) => {
    setEditingSelf(next);
    onEditingChange?.(next);
  };

  // Re-seed the draft whenever editing starts or the underlying name changes.
  useEffect(() => {
    if (editing) setDraft(value);
  }, [editing, value]);

  if (!editing)
    return (
      <span className="group/name flex min-w-0 items-center gap-1.5">
        <span
          className={cx("min-w-0 truncate font-mono", compact ? "text-xs" : "text-sm")}
          title={value}
        >
          {value}
        </span>
        <IconButton
          size="sm"
          label={`Rename ${value}`}
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          className={
            compact ? "opacity-0 group-hover/name:opacity-100 focus-visible:opacity-100" : ""
          }
        >
          <Pencil size={compact ? 11 : 12} />
        </IconButton>
      </span>
    );

  return (
    <form
      className="flex min-w-0 flex-1 items-center gap-1"
      // The row underneath toggles selection; renaming must not trigger it.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault();
        const next = draft.trim();
        if (next && next !== value) onRename(next);
        setEditing(false);
      }}
    >
      <Input
        value={draft}
        onChange={setDraft}
        mono
        size={compact ? "sm" : "md"}
        autoFocus
        aria-label="New file name"
        onEscape={() => setEditing(false)}
        className="min-w-0 flex-1"
      />
      <IconButton size="sm" type="submit" label="Save name" variant="solid">
        <Check size={12} />
      </IconButton>
      <IconButton size="sm" label="Cancel rename" onClick={() => setEditing(false)}>
        <X size={12} />
      </IconButton>
    </form>
  );
}

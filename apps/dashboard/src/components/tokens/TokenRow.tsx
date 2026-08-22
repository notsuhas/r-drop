import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import Input from "@/components/ui/Input";

interface ITokenRowData {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  lastUsedAt: number | null;
}

interface ITokenRow {
  token: ITokenRowData;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export default function TokenRow(props: ITokenRow) {
  const { token, onRename, onDelete } = props;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(token.name);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && name !== token.name) onRename(name.trim());
              setEditing(false);
            }}
          >
            <Input
              value={name}
              onChange={setName}
              autoFocus
              onEscape={() => setEditing(false)}
              className="py-1"
            />
            <button type="submit" className="text-ok" aria-label="Save name">
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-muted"
              aria-label="Cancel rename"
            >
              <X size={14} />
            </button>
          </form>
        ) : (
          <p className="flex items-center gap-2 font-display text-sm">
            {token.name}
            <button
              type="button"
              onClick={() => {
                setName(token.name);
                setEditing(true);
              }}
              className="text-muted hover:text-ink"
              aria-label={`Rename ${token.name}`}
            >
              <Pencil size={12} />
            </button>
          </p>
        )}
        <p className="mt-0.5 font-mono text-xs text-muted">
          {token.prefix}… · {token.scope} ·{" "}
          {token.lastUsedAt
            ? `used ${new Date(token.lastUsedAt).toLocaleDateString()}`
            : "never used"}
        </p>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="border-2 border-[rgba(255,110,110,0.5)] px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wider text-danger"
          >
            Confirm delete
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-xs text-muted hover:text-ink"
          >
            cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-muted transition-colors hover:text-danger"
          aria-label={`Delete ${token.name}`}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

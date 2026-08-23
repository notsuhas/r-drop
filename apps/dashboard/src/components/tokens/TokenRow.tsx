import { Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import RenameField from "@/components/files/RenameField";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { fmtWhen } from "@/lib/format";

/**
 * The mono line under the name: prefix, scope, expiry (only when set), and
 * last use. Built as a list so the row itself stays a single flat render.
 */
function metaParts(token: ITokenRowData, expired: boolean) {
  const parts = [`${token.prefix}\u2026`, token.scope];
  if (token.expiresAt !== null) {
    parts.push(expired ? "expired" : `expires ${fmtWhen(new Date(token.expiresAt).toISOString())}`);
  }
  parts.push(
    token.lastUsedAt
      ? `last used ${fmtWhen(new Date(token.lastUsedAt).toISOString())}`
      : "never used",
  );
  return parts;
}

interface ITokenRowData {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  lastUsedAt: number | null;
  expiresAt: number | null;
}

interface ITokenRow {
  token: ITokenRowData;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export default function TokenRow(props: ITokenRow) {
  const { token, onRename, onDelete } = props;
  const [confirming, setConfirming] = useState(false);
  const expired = token.expiresAt !== null && token.expiresAt <= Date.now();

  return (
    <div className="group flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors duration-(--duration-fast) hover:bg-surface-2">
      <div className="min-w-0 flex-1">
        <RenameField value={token.name} onRename={onRename} />
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-2xs text-ink-3">
          {metaParts(token, expired).map((part, i) => (
            <Fragment key={part}>
              {i > 0 && <span aria-hidden="true">·</span>}
              <span className={part === "expired" ? "text-danger" : undefined}>{part}</span>
            </Fragment>
          ))}
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2">
          <p className="text-xs text-danger">Anything using it stops working.</p>
          <Button size="sm" variant="danger" onClick={onDelete}>
            Revoke
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
            Keep
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {expired && <Badge tone="danger">Expired</Badge>}
          {!expired && !token.lastUsedAt && <Badge tone="neutral">Unused</Badge>}
          <IconButton
            variant="danger"
            label={`Revoke ${token.name}`}
            onClick={() => setConfirming(true)}
            className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      )}
    </div>
  );
}

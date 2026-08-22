import { UserMinus } from "lucide-react";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { fmtWhen } from "@/lib/format";

interface IInviteRowData {
  email: string;
  usedAt: number | null;
  /** Both come from WorkOS and exist only once the person has signed in. */
  name?: string | null;
  picture?: string | null;
}

interface IInviteRow {
  invite: IInviteRowData;
  onRemove: () => void;
}

export default function InviteRow(props: IInviteRow) {
  const { invite, onRemove } = props;
  const [confirming, setConfirming] = useState(false);
  const active = invite.usedAt != null;

  return (
    <div className="group flex flex-wrap items-center gap-3 px-4 py-3 transition-colors duration-(--duration-fast) hover:bg-surface-2">
      <Avatar picture={invite.picture} name={invite.name} email={invite.email} muted={!active} />

      <div className="min-w-0 flex-1">
        {invite.name ? (
          <>
            <p className="truncate text-sm font-medium text-ink">{invite.name}</p>
            <p className="truncate font-mono text-2xs text-ink-3">{invite.email}</p>
          </>
        ) : (
          <p className="truncate font-mono text-sm">{invite.email}</p>
        )}
        <p className="mt-0.5 text-xs text-ink-3">
          {active
            ? `Joined ${fmtWhen(new Date(invite.usedAt as number).toISOString())}`
            : "Invited — hasn't signed in yet"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {active ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">Pending</Badge>}
        {confirming ? (
          <>
            <p className="text-xs text-danger">
              {active ? "Deletes their account and API tokens." : "Removes the invite."}
            </p>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                onRemove();
                setConfirming(false);
              }}
            >
              {active ? "Remove person" : "Revoke invite"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Keep
            </Button>
          </>
        ) : (
          <IconButton
            variant="danger"
            label={active ? `Remove ${invite.email}` : `Revoke invite for ${invite.email}`}
            onClick={() => setConfirming(true)}
            className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <UserMinus size={14} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

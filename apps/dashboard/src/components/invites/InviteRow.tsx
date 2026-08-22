import { useState } from "react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface IInviteRowData {
  email: string;
  usedAt: number | null;
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
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="font-mono text-sm">{invite.email}</p>
        <p className="mt-0.5 text-xs text-muted">
          {active
            ? `joined ${new Date(invite.usedAt as number).toLocaleDateString()}`
            : "not signed in yet"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {active && <Badge tone="ok">active</Badge>}
        {confirming ? (
          <>
            <Button
              variant="danger"
              onClick={() => {
                onRemove();
                setConfirming(false);
              }}
            >
              {active ? "Confirm — deletes user + tokens" : "Confirm revoke"}
            </Button>
            <Button onClick={() => setConfirming(false)}>Cancel</Button>
          </>
        ) : (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            {active ? "Remove" : "Revoke"}
          </Button>
        )}
      </div>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Button from "../components/Button";
import Empty from "../components/Empty";
import { api } from "../lib/api";

export default function Invites() {
  const [email, setEmail] = useState("");
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["invites"], queryFn: api.invites });

  const add = useMutation({
    mutationFn: api.addInvite,
    onSuccess: () => setEmail(""),
    onSettled: () => qc.invalidateQueries({ queryKey: ["invites"] }),
  });
  const remove = useMutation({
    mutationFn: api.deleteInvite,
    onSettled: () => qc.invalidateQueries({ queryKey: ["invites"] }),
  });

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="font-display text-lg font-semibold">Invites</h1>
      <p className="mt-1 text-sm text-muted">
        Invite a Google account by email. They sign in at ho-drive.theclau.de — no link to send, the
        email itself is the invite.
      </p>

      <form
        className="mt-6 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.includes("@")) add.mutate(email);
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="person@gmail.com"
          className="flex-1 rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-sm placeholder:text-muted"
        />
        <Button variant="primary" type="submit" disabled={add.isPending}>
          Invite
        </Button>
      </form>
      {add.isError && <p className="mt-2 text-sm text-danger">{add.error.message}</p>}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : !data?.length ? (
        <div className="mt-8 max-w-xl">
          <Empty title="No invites yet" hint="Only invited emails can sign in with Google." />
        </div>
      ) : (
        <div className="mt-8 max-w-xl divide-y divide-line rounded-xl border border-line bg-panel">
          {data.map((inv) => (
            <div key={inv.email} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-mono text-sm">{inv.email}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {inv.usedAt
                    ? `joined ${new Date(inv.usedAt).toLocaleDateString()}`
                    : "not signed in yet"}
                </p>
              </div>
              {inv.usedAt ? (
                <span className="rounded-md bg-[rgba(97,214,155,0.12)] px-2 py-0.5 text-xs text-ok">
                  active
                </span>
              ) : (
                <Button variant="danger" onClick={() => remove.mutate(inv.email)}>
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

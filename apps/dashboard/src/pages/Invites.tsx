import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import InviteForm from "@/components/invites/InviteForm";
import InviteRow from "@/components/invites/InviteRow";
import Empty from "@/components/ui/Empty";
import { api } from "@/lib/api";

export default function Invites() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["invites"], queryFn: api.invites });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["invites"] });

  const add = useMutation({ mutationFn: api.addInvite, onSettled: invalidate });
  const remove = useMutation({ mutationFn: api.deleteInvite, onSettled: invalidate });

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="font-display text-lg font-semibold">Invites</h1>
      <p className="mt-1 text-sm text-muted">
        Invite a Google account by email. They just sign in here — no link to send, the email itself
        is the invite. Removing an active person deletes their account and API tokens.
      </p>

      <div className="mt-6">
        <InviteForm
          onInvite={(email) => add.mutate(email)}
          pending={add.isPending}
          error={add.isError ? add.error.message : undefined}
        />
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : !data?.length ? (
        <div className="mt-8 max-w-xl">
          <Empty title="No invites yet" hint="Only invited emails can sign in with Google." />
        </div>
      ) : (
        <div className="mt-8 max-w-xl divide-y divide-line border border-line bg-panel">
          {data.map((inv) => (
            <InviteRow key={inv.email} invite={inv} onRemove={() => remove.mutate(inv.email)} />
          ))}
        </div>
      )}
    </div>
  );
}

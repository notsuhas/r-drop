import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import InviteForm from "@/components/invites/InviteForm";
import InviteRow from "@/components/invites/InviteRow";
import ListSection from "@/components/layout/ListSection";
import PageHeader from "@/components/layout/PageHeader";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";

export default function Invites() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["invites"], queryFn: api.invites });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["invites"] });

  const add = useMutation({
    mutationFn: api.addInvite,
    onSuccess: () => toast("Invite added — they can sign in now", "ok"),
    onError: (error) => toast(error.message || "Couldn't add that invite", "danger"),
    onSettled: invalidate,
  });
  const remove = useMutation({
    mutationFn: api.deleteInvite,
    onSuccess: () => toast("Access removed", "neutral"),
    onError: (error) => toast(error.message || "Couldn't remove that person", "danger"),
    onSettled: invalidate,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title="People"
        description="Add a Google account by email and that person can sign in — there's no link to send, the email itself is the invite. Removing someone who has joined also deletes their account and API tokens."
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="max-w-2xl space-y-6">
          <section>
            <h2 className="text-sm font-medium">Invite someone</h2>
            <div className="mt-2.5">
              <InviteForm
                onInvite={(email) => add.mutate(email)}
                pending={add.isPending}
                error={add.isError ? add.error.message : undefined}
              />
            </div>
          </section>

          <ListSection
            title="Who has access"
            count={data?.length}
            isLoading={isLoading}
            isEmpty={!data?.length}
            emptyIcon={<Mail size={18} />}
            emptyTitle="Nobody invited yet"
            emptyHint="Only invited email addresses can sign in with Google. Add the first one above."
          >
            {data?.map((inv) => (
              <InviteRow key={inv.email} invite={inv} onRemove={() => remove.mutate(inv.email)} />
            ))}
          </ListSection>
        </div>
      </div>
    </div>
  );
}

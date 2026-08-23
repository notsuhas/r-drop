// API tokens: agent setup, manual create, and the list of live tokens.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import ListSection from "@/components/layout/ListSection";
import PageHeader from "@/components/layout/PageHeader";
import AgentSetupCard from "@/components/tokens/AgentSetupCard";
import CreateTokenForm from "@/components/tokens/CreateTokenForm";
import FreshTokenPanel from "@/components/tokens/FreshTokenPanel";
import TokenRow from "@/components/tokens/TokenRow";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";

export default function Tokens() {
  const [fresh, setFresh] = useState<string | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["tokens"], queryFn: api.tokens });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tokens"] });

  const create = useMutation({
    mutationFn: (input: { name: string; expiresInDays?: number }) =>
      api.createToken(input.name, "write", input.expiresInDays),
    onSuccess: (res) => setFresh(res.token),
    onSettled: invalidate,
  });
  const rename = useMutation({
    mutationFn: (input: { id: string; name: string }) => api.renameToken(input.id, input.name),
    onSuccess: () => toast("Token renamed", "ok"),
    onError: (error) => toast(error.message || "Rename failed", "danger"),
    onSettled: invalidate,
  });
  const remove = useMutation({
    mutationFn: api.deleteToken,
    onSuccess: () => toast("Token revoked", "neutral"),
    onError: (error) => toast(error.message || "Revoke failed", "danger"),
    onSettled: invalidate,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title="API tokens"
        description="Tokens let agents and scripts upload without signing in. Each one can be revoked on its own."
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="max-w-3xl space-y-6">
          <AgentSetupCard />

          <section>
            <h2 className="text-sm font-medium">Create a token by hand</h2>
            <div className="mt-2.5">
              <CreateTokenForm
                onCreate={(name, expiresInDays) => create.mutate({ name, expiresInDays })}
                pending={create.isPending}
                error={create.isError ? create.error.message : undefined}
              />
            </div>
          </section>

          {fresh && <FreshTokenPanel token={fresh} onDone={() => setFresh(null)} />}

          <ListSection
            title="Live tokens"
            count={data?.length}
            isLoading={isLoading}
            isEmpty={!data?.length}
            emptyIcon={<KeyRound size={18} />}
            emptyTitle="No tokens yet"
            emptyHint="Use the agent setup above, or create one by hand. Nothing can upload over the API until one exists."
          >
            {data?.map((t) => (
              <TokenRow
                key={t.id}
                token={t}
                onRename={(name) => rename.mutate({ id: t.id, name })}
                onDelete={() => remove.mutate(t.id)}
              />
            ))}
          </ListSection>
        </div>
      </div>
    </div>
  );
}

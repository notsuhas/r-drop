// API tokens: pure composition — agent setup, manual create, list.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import AgentSetupCard from "@/components/tokens/AgentSetupCard";
import CreateTokenForm from "@/components/tokens/CreateTokenForm";
import FreshTokenPanel from "@/components/tokens/FreshTokenPanel";
import TokenRow from "@/components/tokens/TokenRow";
import Empty from "@/components/ui/Empty";
import { api } from "@/lib/api";

export default function Tokens() {
  const [fresh, setFresh] = useState<string | null>(null);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tokens"], queryFn: api.tokens });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tokens"] });

  const create = useMutation({
    mutationFn: (name: string) => api.createToken(name, "write"),
    onSuccess: (res) => setFresh(res.token),
    onSettled: invalidate,
  });
  const rename = useMutation({
    mutationFn: (input: { id: string; name: string }) => api.renameToken(input.id, input.name),
    onSettled: invalidate,
  });
  const remove = useMutation({ mutationFn: api.deleteToken, onSettled: invalidate });

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="font-display text-lg font-semibold">API tokens</h1>
      <p className="mt-1 text-sm text-muted">
        Tokens let agents and scripts upload without signing in.
      </p>

      <div className="mt-6 max-w-2xl">
        <AgentSetupCard />
      </div>

      <div className="mt-6">
        <CreateTokenForm
          onCreate={(name) => create.mutate(name)}
          pending={create.isPending}
          error={create.isError ? create.error.message : undefined}
        />
      </div>

      {fresh && (
        <div className="mt-4">
          <FreshTokenPanel token={fresh} onDone={() => setFresh(null)} />
        </div>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : !data?.length ? (
        <div className="mt-8 max-w-2xl">
          <Empty title="No tokens" hint="Use the agent setup above, or create one manually." />
        </div>
      ) : (
        <div className="mt-8 max-w-2xl divide-y divide-line border border-line bg-panel">
          {data.map((t) => (
            <TokenRow
              key={t.id}
              token={t}
              onRename={(name) => rename.mutate({ id: t.id, name })}
              onDelete={() => remove.mutate(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

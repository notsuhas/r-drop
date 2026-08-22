import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import AgentSetupCard from "@/components/tokens/AgentSetupCard";
import TokenRow from "@/components/tokens/TokenRow";
import Button from "@/components/ui/Button";
import CopyField from "@/components/ui/CopyField";
import Empty from "@/components/ui/Empty";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function Tokens() {
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tokens"], queryFn: api.tokens });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tokens"] });

  const create = useMutation({
    mutationFn: (n: string) => api.createToken(n, "write"),
    onSuccess: (res) => {
      setFresh(res.token);
      setName("");
    },
    onSettled: invalidate,
  });
  const rename = useMutation({
    mutationFn: ({ id, name: n }: { id: string; name: string }) => api.renameToken(id, n),
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

      <form
        className="mt-6 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate(name.trim());
        }}
      >
        <Input
          value={name}
          onChange={setName}
          placeholder="token name, e.g. ci"
          className="flex-1"
        />
        <Button variant="primary" type="submit" disabled={create.isPending}>
          Create token
        </Button>
      </form>
      {create.isError && <p className="mt-2 text-sm text-danger">{create.error.message}</p>}

      {fresh && (
        <div className="mt-4 max-w-2xl border-2 border-line bg-panel p-4">
          <p className="text-sm font-medium">Copy this now — it won't be shown again.</p>
          <div className="mt-2">
            <CopyField value={fresh} label="Copy token" />
          </div>
          <div className="mt-2 text-right">
            <Button onClick={() => setFresh(null)}>Done</Button>
          </div>
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
              onRename={(n) => rename.mutate({ id: t.id, name: n })}
              onDelete={() => remove.mutate(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import Button from "../components/Button";
import Empty from "../components/Empty";

export default function Tokens() {
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tokens"], queryFn: api.tokens });

  const create = useMutation({
    mutationFn: (n: string) => api.createToken(n, "write"),
    onSuccess: (res) => {
      setFresh(res.token);
      setName("");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tokens"] }),
  });
  const remove = useMutation({
    mutationFn: api.deleteToken,
    onSettled: () => qc.invalidateQueries({ queryKey: ["tokens"] }),
  });

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="font-display text-lg font-semibold">API tokens</h1>
      <p className="mt-1 text-sm text-muted">
        For agents and scripts. Send as{" "}
        <span className="font-mono">Authorization: Bearer &lt;token&gt;</span> to
        POST /api/upload.
      </p>

      <form
        className="mt-6 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name) create.mutate(name);
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="claude-code-local"
          className="flex-1 rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-sm placeholder:text-muted"
        />
        <Button variant="primary" type="submit" disabled={create.isPending}>
          Create token
        </Button>
      </form>

      {fresh && (
        <div className="mt-4 max-w-xl rounded-xl border border-[rgba(255,178,86,0.4)] bg-[rgba(255,178,86,0.06)] p-4">
          <p className="text-sm font-medium">Copy this now — it won't be shown again.</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-bg px-3 py-2 font-mono text-xs">
              {fresh}
            </code>
            <Button onClick={() => navigator.clipboard.writeText(fresh)}>Copy</Button>
            <Button onClick={() => setFresh(null)}>Done</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : !data?.length ? (
        <div className="mt-8 max-w-xl">
          <Empty title="No tokens" hint="Create one and drop it into your agent's environment." />
        </div>
      ) : (
        <div className="mt-8 max-w-xl divide-y divide-line rounded-xl border border-line bg-panel">
          {data.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-display text-sm">{t.name}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {t.prefix}… · {t.scope} ·{" "}
                  {t.lastUsedAt
                    ? `used ${new Date(t.lastUsedAt).toLocaleDateString()}`
                    : "never used"}
                </p>
              </div>
              <Button variant="danger" onClick={() => remove.mutate(t.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

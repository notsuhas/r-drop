import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Button from "../components/ui/Button";
import Empty from "../components/ui/Empty";
import { buildAgentSkill } from "../lib/agentSkill";
import { api } from "../lib/api";
import { getConfig } from "../lib/config";

export default function Tokens() {
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const [copiedWhat, setCopiedWhat] = useState<string | null>(null);
  const flash = (what: string) => {
    setCopiedWhat(what);
    setTimeout(() => setCopiedWhat(null), 1500);
  };
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
        <span className="font-mono">Authorization: Bearer &lt;token&gt;</span> to POST /api/upload.
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
          className="flex-1 rounded-none border border-line bg-panel px-3 py-1.5 font-mono text-sm placeholder:text-muted"
        />
        <Button variant="primary" type="submit" disabled={create.isPending}>
          Create token
        </Button>
      </form>
      <button
        type="button"
        onClick={async () => {
          const { publicBase } = await getConfig();
          await navigator.clipboard.writeText(
            buildAgentSkill({ publicBase, appBase: window.location.origin }),
          );
          flash("prompt");
        }}
        className="mt-3 text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
      >
        Copy agent skill without a token (reads HO_DRIVE_TOKEN from the agent's env)
      </button>

      {fresh && (
        <div className="mt-4 max-w-xl rounded-none border border-[rgba(255,178,86,0.4)] bg-[rgba(255,178,86,0.06)] p-4">
          <p className="text-sm font-medium">Copy this now — it won't be shown again.</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded-none bg-bg px-3 py-2 font-mono text-xs">
              {fresh}
            </code>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(fresh);
                flash("token");
              }}
            >
              Copy token
            </Button>
            <Button onClick={() => setFresh(null)}>Done</Button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="primary"
              onClick={async () => {
                const { publicBase } = await getConfig();
                await navigator.clipboard.writeText(
                  buildAgentSkill({ publicBase, appBase: window.location.origin, token: fresh }),
                );
                flash("prompt");
              }}
            >
              Copy agent skill
            </Button>
            <span className="text-xs text-muted">
              SKILL.md with this token — save as ~/.claude/skills/ho-drive/SKILL.md
            </span>
          </div>
          {copiedWhat && <p className="mt-2 text-xs text-ok">copied {copiedWhat}</p>}
        </div>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted">Loading…</p>
      ) : !data?.length ? (
        <div className="mt-8 max-w-xl">
          <Empty title="No tokens" hint="Create one and drop it into your agent's environment." />
        </div>
      ) : (
        <div className="mt-8 max-w-xl divide-y divide-line rounded-none border border-line bg-panel">
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

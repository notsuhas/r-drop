import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { buildAgentSetupPrompt } from "@/lib/agent-content";
import { api } from "@/lib/api";
import { getConfig } from "@/lib/config";

export default function AgentSetupCard() {
  const [done, setDone] = useState<string | null>(null);
  const qc = useQueryClient();

  const setup = useMutation({
    mutationFn: async () => {
      const name = `agent-${new Date().toISOString().slice(0, 10)}`;
      const { token } = await api.createToken(name, "write");
      const { publicBase } = await getConfig();
      const prompt = buildAgentSetupPrompt({
        publicBase,
        appBase: window.location.origin,
        token,
      });
      await navigator.clipboard.writeText(prompt);
      return name;
    },
    onSuccess: (name) => setDone(name),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tokens"] }),
  });

  return (
    <div className="border-2 border-honey bg-[rgba(255,178,86,0.06)] p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 font-display text-base font-semibold">
            <Sparkles size={16} className="text-honey" /> Let an agent upload for you
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted">
            One click creates an upload token and copies a ready-made prompt. Paste it into any
            agent session (Claude Code, Cursor, a cloud session) — the agent installs r-drop as a
            permanent skill and can upload assets from then on.
          </p>
        </div>
        <Button variant="primary" onClick={() => setup.mutate()} disabled={setup.isPending}>
          {setup.isPending ? "Setting up…" : "Create token + copy prompt"}
        </Button>
      </div>
      {done && (
        <p className="mt-3 text-sm text-ok">
          Copied. Paste it into your agent — token "{done}" is in the list below (rename or delete
          it anytime).
        </p>
      )}
      {setup.isError && <p className="mt-3 text-sm text-danger">{setup.error.message}</p>}
    </div>
  );
}

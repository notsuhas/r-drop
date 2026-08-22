import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import AgentSetupDialog from "@/components/tokens/AgentSetupDialog";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import { buildAgentSetupPrompt } from "@/lib/agent-content";
import { api } from "@/lib/api";
import { getConfig } from "@/lib/config";

interface ISetupResult {
  tokenName: string;
  prompt: string;
  copied: boolean;
}

export default function AgentSetupCard() {
  const qc = useQueryClient();
  // A toast was the wrong surface here: the copy is only half the job, and the
  // half that matters — paste this into an agent — needs to be read, not
  // glimpsed. The dialog also keeps the prompt recoverable if the copy failed.
  const [result, setResult] = useState<ISetupResult | null>(null);

  const setup = useMutation({
    mutationFn: async (): Promise<ISetupResult> => {
      const tokenName = `agent-${new Date().toISOString().slice(0, 10)}`;
      const { token } = await api.createToken(tokenName, "write");
      const { publicBase } = await getConfig();
      const prompt = buildAgentSetupPrompt({
        publicBase,
        appBase: window.location.origin,
        token,
      });
      // The token exists either way, so a blocked clipboard must not read as a
      // failed setup — fall through and let the dialog show the text.
      const copied = await navigator.clipboard
        .writeText(prompt)
        .then(() => true)
        .catch(() => false);
      return { tokenName, prompt, copied };
    },
    onSuccess: setResult,
    onSettled: () => qc.invalidateQueries({ queryKey: ["tokens"] }),
  });

  return (
    <div className="rounded-lg bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-medium text-ink">
            <Sparkles size={15} className="shrink-0 text-accent-text" />
            Set up an agent to upload for you
          </p>
          <p className="mt-1.5 max-w-xl text-sm text-ink-2">
            Creates an upload token and copies a ready-made prompt. Paste it into any agent session
            — Claude Code, Cursor, a cloud session — and the agent installs r-drop as a permanent
            skill it can use from then on.
          </p>
        </div>
        <Button variant="primary" loading={setup.isPending} onClick={() => setup.mutate()}>
          {setup.isPending ? "Setting up…" : "Create token and copy prompt"}
        </Button>
      </div>
      {setup.isError && (
        <div className="mt-4">
          <Notice>{setup.error.message}</Notice>
        </div>
      )}
      {result && <AgentSetupDialog {...result} onClose={() => setResult(null)} />}
    </div>
  );
}

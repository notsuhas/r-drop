import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import { useToast } from "@/hooks/useToast";
import { buildAgentSetupPrompt } from "@/lib/agent-content";
import { api } from "@/lib/api";
import { getConfig } from "@/lib/config";

export default function AgentSetupCard() {
  const qc = useQueryClient();
  const { toast } = useToast();

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
    onSuccess: (name) => toast(`Prompt copied. Token "${name}" is in the list below.`, "ok"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tokens"] }),
  });

  return (
    <div className="rounded-lg bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-medium text-ink">
            <Sparkles size={15} className="shrink-0 text-honey" />
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
    </div>
  );
}

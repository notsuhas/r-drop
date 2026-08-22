import { Check, ClipboardCopy } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Notice from "@/components/ui/Notice";

interface IAgentSetupDialog {
  /** Name of the token that was just created, so it can be found in the list. */
  tokenName: string;
  prompt: string;
  /** False when the browser refused clipboard access — then we must show the text. */
  copied: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Open your coding agent",
    body: "Claude Code, Cursor, Codex, Copilot, Gemini CLI — any session that can write files.",
  },
  {
    title: "Paste the prompt and send it",
    body: "Ctrl+V, or ⌘V on a Mac. It's a full instruction, not a question — no editing needed.",
  },
  {
    title: "The agent installs r-drop for itself",
    body: "It writes the skill wherever its own persistent instructions live and tells you the path. From then on it uploads assets here instead of committing them — in this session and every future one.",
  },
];

export default function AgentSetupDialog(props: IAgentSetupDialog) {
  const { tokenName, prompt, copied, onClose } = props;
  const [recopied, setRecopied] = useState(false);

  const recopy = () => {
    void navigator.clipboard
      .writeText(prompt)
      .then(() => {
        setRecopied(true);
        setTimeout(() => setRecopied(false), 1600);
      })
      .catch(() => setRecopied(false));
  };

  return (
    <Modal
      title={copied ? "Prompt copied — now paste it into your agent" : "Token created"}
      subtitle={
        copied
          ? "The prompt is on your clipboard. It does the setup for you; you don't have to write any config."
          : "Your browser blocked the clipboard, so copy the prompt below by hand."
      }
      onClose={onClose}
      footer={
        <>
          <Button
            icon={recopied ? <Check size={14} className="text-ok" /> : <ClipboardCopy size={14} />}
            onClick={recopy}
          >
            {recopied ? "Copied" : "Copy prompt again"}
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <ol className="flex flex-col gap-3.5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-2xs text-accent-text">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{step.title}</p>
              <p className="mt-0.5 text-sm text-ink-2">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {!copied && (
        <textarea
          readOnly
          value={prompt}
          aria-label="Agent setup prompt"
          onFocus={(e) => e.currentTarget.select()}
          className="mt-4 h-40 w-full resize-none rounded-md bg-bg p-3 font-mono text-xs text-ink-2 outline-none"
        />
      )}

      <div className="mt-4">
        <Notice tone="info">
          The prompt carries the upload token <code className="font-mono text-xs">{tokenName}</code>
          , so treat it like a password — don't paste it into a shared channel or commit it. Revoke
          it in the list below if it leaks.
        </Notice>
      </div>
    </Modal>
  );
}

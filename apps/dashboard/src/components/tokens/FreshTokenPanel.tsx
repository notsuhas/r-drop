import { KeyRound } from "lucide-react";
import Button from "@/components/ui/Button";
import CopyField from "@/components/ui/CopyField";

interface IFreshTokenPanel {
  token: string;
  onDone: () => void;
}

export default function FreshTokenPanel(props: IFreshTokenPanel) {
  const { token, onDone } = props;
  return (
    <div className="rounded-lg bg-surface-2 p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <KeyRound size={14} className="text-honey" />
        Copy this token now — it isn't shown again
      </p>
      <p className="mt-1 text-sm text-ink-2">
        Store it as <code className="font-mono text-xs text-ink">R_DROP_TOKEN</code> wherever the
        agent or script runs.
      </p>
      <div className="mt-3">
        <CopyField value={token} label="Copy token" />
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={onDone}>
          I've saved it
        </Button>
      </div>
    </div>
  );
}

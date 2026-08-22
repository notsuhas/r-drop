import Button from "@/components/ui/Button";
import CopyField from "@/components/ui/CopyField";

interface IFreshTokenPanel {
  token: string;
  onDone: () => void;
}

export default function FreshTokenPanel(props: IFreshTokenPanel) {
  const { token, onDone } = props;
  return (
    <div className="max-w-2xl border-2 border-line bg-panel p-4">
      <p className="text-sm font-medium">Copy this now — it won't be shown again.</p>
      <div className="mt-2">
        <CopyField value={token} label="Copy token" />
      </div>
      <div className="mt-2 text-right">
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

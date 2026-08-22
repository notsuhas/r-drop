import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cx } from "@/lib/cx";

type Tone = "danger" | "ok" | "info";

interface INotice {
  children: React.ReactNode;
  tone?: Tone;
}

const tones: Record<Tone, { box: string; icon: React.ReactNode }> = {
  danger: { box: "bg-danger-wash text-danger", icon: <AlertTriangle size={14} /> },
  ok: { box: "bg-ok-wash text-ok", icon: <CheckCircle2 size={14} /> },
  info: { box: "bg-surface-2 text-ink-2", icon: <Info size={14} /> },
};

export default function Notice(props: INotice) {
  const { children, tone = "danger" } = props;
  const { box, icon } = tones[tone];
  return (
    <div className={cx("flex items-start gap-2.5 rounded-md px-3 py-2.5 text-sm", box)}>
      <span className="mt-px shrink-0">{icon}</span>
      <p className="min-w-0">{children}</p>
    </div>
  );
}

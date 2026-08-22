import { cx } from "@/lib/cx";

type Tone = "neutral" | "ok" | "danger" | "honey";

interface IBadge {
  children: React.ReactNode;
  tone?: Tone;
  mono?: boolean;
}

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  ok: "bg-ok-wash text-ok",
  danger: "bg-danger-wash text-danger",
  honey: "bg-honey-wash text-honey",
};

export default function Badge(props: IBadge) {
  const { children, tone = "neutral", mono } = props;
  return (
    <span
      className={cx(
        "inline-flex h-5 items-center rounded-sm px-1.5 text-2xs font-medium",
        mono && "font-mono",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

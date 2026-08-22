interface IBadge {
  children: React.ReactNode;
  tone?: "ok" | "muted";
}

const tones = {
  ok: "bg-[rgba(97,214,155,0.12)] text-ok",
  muted: "bg-panel-2 text-muted",
};

export default function Badge(props: IBadge) {
  const { children, tone = "muted" } = props;
  return <span className={`px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>;
}

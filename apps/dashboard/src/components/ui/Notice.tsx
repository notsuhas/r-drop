interface INotice {
  children: React.ReactNode;
  tone?: "danger" | "ok";
}

const tones = {
  danger: "border-[rgba(255,110,110,0.35)] bg-[rgba(255,110,110,0.06)] text-danger",
  ok: "border-[rgba(97,214,155,0.35)] bg-[rgba(97,214,155,0.06)] text-ok",
};

export default function Notice(props: INotice) {
  const { children, tone = "danger" } = props;
  return <p className={`border px-3 py-2 text-sm ${tones[tone]}`}>{children}</p>;
}

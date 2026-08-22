import { cx } from "@/lib/cx";

interface IEmpty {
  title: string;
  hint: string;
  icon?: React.ReactNode;
  /** An empty screen is an invitation to act — give it the action. */
  action?: React.ReactNode;
  size?: "sm" | "md";
}

export default function Empty(props: IEmpty) {
  const { title, hint, icon, action, size = "md" } = props;
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline px-6 text-center",
        size === "md" ? "py-16" : "py-10",
      )}
    >
      {icon && (
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-ink-3">
          {icon}
        </span>
      )}
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-2">{hint}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

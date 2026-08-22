import { cx } from "@/lib/cx";

interface ISegment<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface ISegmentedControl<T extends string> {
  value: T;
  segments: ISegment<T>[];
  onChange: (value: T) => void;
  /** Show icons only; the label still reaches assistive tech. */
  iconOnly?: boolean;
  label: string;
}

export default function SegmentedControl<T extends string>(props: ISegmentedControl<T>) {
  const { value, segments, onChange, iconOnly, label } = props;
  return (
    <fieldset className="flex h-8 items-center gap-0.5 rounded-md bg-surface-2 p-0.5">
      <legend className="sr-only">{label}</legend>
      {segments.map((s) => {
        const active = s.id === value;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            aria-pressed={active}
            title={iconOnly ? s.label : undefined}
            aria-label={iconOnly ? s.label : undefined}
            className={cx(
              "inline-flex h-7 items-center justify-center gap-1.5 rounded-sm text-xs font-medium",
              "transition-colors duration-(--duration-fast) ease-(--ease-out-quart)",
              iconOnly ? "w-7" : "px-2.5",
              active ? "bg-surface-3 text-ink shadow-e1" : "text-ink-3 hover:text-ink",
            )}
          >
            {s.icon}
            {!iconOnly && s.label}
          </button>
        );
      })}
    </fieldset>
  );
}

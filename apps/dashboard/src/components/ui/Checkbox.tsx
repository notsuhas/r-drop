import { Check, Minus } from "lucide-react";
import { useEffect, useRef } from "react";
import { cx } from "@/lib/cx";

interface ICheckbox {
  checked: boolean;
  /** Some-but-not-all children selected — renders a dash instead of a tick. */
  indeterminate?: boolean;
  label: string;
  /** Receives the click so callers can read Shift/Cmd and stop propagation. */
  onChange: (event: React.MouseEvent<HTMLInputElement>) => void;
  /** Hidden until hover on grid tiles, always visible once selected. */
  hideUntilHover?: boolean;
  className?: string;
}

/** A real checkbox input with a styled box on top, so screen readers and
 *  keyboards get native semantics — including the mixed state. */
export default function Checkbox(props: ICheckbox) {
  const { checked, indeterminate, label, onChange, hideUntilHover, className = "" } = props;
  const ref = useRef<HTMLInputElement>(null);
  const on = checked || Boolean(indeterminate);

  // indeterminate is a DOM property, not an attribute React can set directly.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <span
      className={cx(
        "relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center",
        hideUntilHover &&
          !on &&
          "opacity-0 transition-opacity group-hover:opacity-100 has-focus-visible:opacity-100",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        aria-label={label}
        onClick={onChange}
        // The click handler owns the state; onChange exists only to keep React
        // from warning about a controlled input without one.
        onChange={() => {}}
        className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-xs"
      />
      <span
        aria-hidden="true"
        className={cx(
          "pointer-events-none flex h-full w-full items-center justify-center rounded-xs border",
          "transition-colors duration-(--duration-fast) ease-(--ease-out-quart)",
          on
            ? "border-accent bg-accent text-accent-ink"
            : "border-border-strong bg-surface/80 peer-hover:border-accent",
        )}
      >
        {indeterminate ? (
          <Minus size={12} strokeWidth={3.5} />
        ) : (
          checked && <Check size={12} strokeWidth={3.5} />
        )}
      </span>
    </span>
  );
}

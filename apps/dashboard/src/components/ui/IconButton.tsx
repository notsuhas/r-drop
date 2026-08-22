import { forwardRef } from "react";
import { cx } from "@/lib/cx";

type Variant = "ghost" | "solid" | "danger";
type Size = "sm" | "md";

interface IIconButton {
  children: React.ReactNode;
  /** Required: an icon alone gives assistive tech nothing to announce. */
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: Variant;
  size?: Size;
  active?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const variants: Record<Variant, string> = {
  ghost: "text-ink-3 hover:bg-surface-2 hover:text-ink",
  solid: "bg-surface-2 text-ink-2 hover:bg-surface-3 hover:text-ink",
  danger: "text-ink-3 hover:bg-danger-wash hover:text-danger",
};

const sizes: Record<Size, string> = { sm: "h-6 w-6 rounded-xs", md: "h-8 w-8 rounded-md" };

const IconButton = forwardRef<HTMLButtonElement, IIconButton>(function IconButton(props, ref) {
  const {
    children,
    label,
    onClick,
    variant = "ghost",
    size = "md",
    active,
    disabled,
    type = "button",
    className = "",
  } = props;

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cx(
        "inline-flex shrink-0 items-center justify-center",
        "transition-colors duration-(--duration-fast) ease-(--ease-out-quart)",
        "disabled:pointer-events-none disabled:opacity-45",
        active ? "bg-surface-3 text-accent-text" : variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
});

export default IconButton;

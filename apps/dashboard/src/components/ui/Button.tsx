import { forwardRef } from "react";
import Spinner from "@/components/ui/Spinner";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

interface IButton {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean;
}

// Filled variants carry no border; outlined variants carry no shadow. Pairing a
// 1px border with a wide drop shadow is the pattern this system refuses.
const variants: Record<Variant, string> = {
  // Dimmed honey reads as muddy rather than unavailable, so the disabled
  // primary drops to a neutral fill instead of losing opacity.
  primary:
    "bg-honey text-honey-ink shadow-e1 hover:bg-honey-dim active:brightness-95 disabled:bg-surface-2 disabled:text-ink-3 disabled:shadow-none disabled:opacity-100",
  secondary: "bg-surface-2 text-ink border border-hairline hover:bg-surface-3 hover:border-border",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  subtle: "bg-surface-2/60 text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "bg-danger-wash text-danger hover:bg-danger hover:text-bg",
};

const sizes: Record<Size, string> = {
  sm: "h-7 gap-1.5 px-2.5 text-xs rounded-sm",
  md: "h-8 gap-2 px-3 text-sm rounded-md",
  lg: "h-10 gap-2 px-4 text-base rounded-md",
};

const Button = forwardRef<HTMLButtonElement, IButton>(function Button(props, ref) {
  const {
    children,
    onClick,
    variant = "secondary",
    size = "md",
    disabled,
    loading,
    type = "button",
    icon,
    trailing,
    className = "",
    ...rest
  } = props;

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cx(
        "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium",
        "transition-colors duration-(--duration-fast) ease-(--ease-out-quart)",
        "disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size={size === "sm" ? 12 : 14} /> : icon}
      {children}
      {trailing}
    </button>
  );
});

export default Button;

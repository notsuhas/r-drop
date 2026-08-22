import { forwardRef } from "react";
import { cx } from "@/lib/cx";

interface IInput {
  value: string;
  id?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "search";
  name?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Object keys, URLs and emails are data — set this so they render in mono. */
  mono?: boolean;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  /** Rendered inside the field on the right, e.g. a clear button. */
  trailing?: React.ReactNode;
  className?: string;
  onEscape?: () => void;
  "aria-label"?: string;
}

const sizes = {
  sm: "h-7 text-xs rounded-sm",
  md: "h-8 text-sm rounded-md",
};

const Input = forwardRef<HTMLInputElement, IInput>(function Input(props, ref) {
  const {
    value,
    id,
    onChange,
    placeholder,
    type = "text",
    name,
    autoFocus,
    disabled,
    invalid,
    mono,
    size = "md",
    icon,
    trailing,
    className = "",
    onEscape,
    ...rest
  } = props;

  return (
    <div
      className={cx(
        "group/input relative flex min-w-0 items-center bg-surface-2",
        "border transition-colors duration-(--duration-fast)",
        // Placeholder text sits at ink-3, which clears 4.5:1 on surface-2 —
        // the usual muted-gray placeholder does not.
        invalid ? "border-danger" : "border-border-strong focus-within:border-honey",
        disabled && "opacity-45",
        sizes[size],
        className,
      )}
    >
      {icon && <span className="pointer-events-none pl-2.5 text-ink-3">{icon}</span>}
      <input
        ref={ref}
        id={id}
        type={type}
        name={name}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onEscape?.();
        }}
        placeholder={placeholder}
        // biome-ignore lint/a11y/noAutofocus: only set when focus follows the control that revealed the input
        autoFocus={autoFocus}
        className={cx(
          "min-w-0 flex-1 bg-transparent px-2.5 text-ink outline-none placeholder:text-ink-3",
          mono && "font-mono",
        )}
        {...rest}
      />
      {trailing && <span className="flex shrink-0 items-center pr-1">{trailing}</span>}
    </div>
  );
});

export default Input;

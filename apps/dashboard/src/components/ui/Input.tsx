interface IInput {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email";
  name?: string;
  autoFocus?: boolean;
  className?: string;
  onEscape?: () => void;
}

export default function Input(props: IInput) {
  const {
    value,
    onChange,
    placeholder,
    type = "text",
    name,
    autoFocus,
    className = "",
    onEscape,
  } = props;
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Escape" && onEscape?.()}
      placeholder={placeholder}
      // biome-ignore lint/a11y/noAutofocus: only set when focus follows the control that revealed the input
      autoFocus={autoFocus}
      className={`border border-line bg-panel px-3 py-1.5 font-mono text-sm placeholder:text-muted ${className}`}
    />
  );
}

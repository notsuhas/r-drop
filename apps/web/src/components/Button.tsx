interface IButton {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}

const styles = {
  primary: "bg-honey text-honey-ink font-semibold hover:brightness-105",
  ghost: "border border-line bg-panel-2 text-ink hover:border-[rgba(255,255,255,0.18)]",
  danger: "border border-[rgba(255,110,110,0.35)] text-danger hover:bg-[rgba(255,110,110,0.1)]",
};

export default function Button(props: IButton) {
  const { children, onClick, variant = "ghost", disabled, type = "button" } = props;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 font-display text-sm transition-colors active:scale-[0.99] disabled:opacity-40 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// Hover-revealed icon button used on top of file previews.
interface IOverlayIconButton {
  children: React.ReactNode;
  title: string;
  position: "top-right" | "bottom-right";
  onClick: () => void;
}

export default function OverlayIconButton(props: IOverlayIconButton) {
  const { children, title, position, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`absolute right-2 ${position === "top-right" ? "top-2" : "bottom-12"} border border-line bg-bg/90 px-2 py-1 font-mono text-[10px] text-muted opacity-0 backdrop-blur transition-opacity hover:text-ink group-hover:opacity-100`}
    >
      {children}
    </button>
  );
}

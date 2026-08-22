import { cx } from "@/lib/cx";

interface IBrandMark {
  size?: "sm" | "md" | "lg";
  /** Rail mode: the glyph alone, no wordmark. */
  glyphOnly?: boolean;
}

const sizes = {
  sm: "text-sm",
  md: "text-md",
  lg: "text-xl",
};

/** The wordmark's separator: a real element rather than a middot glyph, so it
 *  carries the brand color at a consistent optical size across the type scale. */
function Glyph(props: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("inline-block shrink-0 rounded-full bg-accent", props.className)}
    />
  );
}

/** The app icon, matching favicon.svg — a drop landing on a surface. Used
 *  wherever there is no room for the wordmark. */
function AppIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={props.className} role="img" aria-label="r-drop">
      <rect width="64" height="64" rx="14" fill="var(--color-accent)" />
      <g
        fill="none"
        stroke="var(--color-accent-ink)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M32 13v18" />
        <path d="M22.5 26.5 32 36l9.5-9.5" />
        <path d="M20 47h24" />
      </g>
    </svg>
  );
}

export default function BrandMark(props: IBrandMark) {
  const { size = "md", glyphOnly } = props;

  if (glyphOnly) return <AppIcon className="h-8 w-8" />;

  return (
    <span
      className={cx(
        "inline-flex items-baseline font-semibold tracking-tight text-ink",
        sizes[size],
      )}
    >
      r
      <Glyph className={cx("mx-[0.12em] self-center", size === "lg" ? "h-1.5 w-1.5" : "h-1 w-1")} />
      drop
    </span>
  );
}

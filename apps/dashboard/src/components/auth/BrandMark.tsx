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

/** The mark is the product's own syntax: a path separator holding a drop.
 *  The dot is a real element rather than a middot glyph so it can carry the
 *  brand color at a consistent optical size across the type scale. */
function Glyph(props: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("inline-block shrink-0 rounded-full bg-honey", props.className)}
    />
  );
}

export default function BrandMark(props: IBrandMark) {
  const { size = "md", glyphOnly } = props;

  if (glyphOnly)
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2">
        <span className="font-semibold text-sm tracking-tight text-ink">r</span>
        <Glyph className="ml-px h-1 w-1" />
      </span>
    );

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

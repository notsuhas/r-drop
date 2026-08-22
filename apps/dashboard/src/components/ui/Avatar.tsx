import { User } from "lucide-react";
import { cx } from "@/lib/cx";

interface IAvatar {
  /** Real profile picture; only people who have signed in have one. */
  picture?: string | null;
  /** Falls back to a monogram, then to a generic glyph. */
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md";
  /** Pending invites read as not-yet-real, so their placeholder is dimmed. */
  muted?: boolean;
  className?: string;
}

const sizes = { sm: "h-7 w-7 text-2xs", md: "h-9 w-9 text-xs" };

/** First letter of the display name, else of the email local part. */
const monogramOf = (name?: string | null, email?: string | null) =>
  (name?.trim()?.[0] ?? email?.trim()?.[0] ?? "").toUpperCase();

export default function Avatar(props: IAvatar) {
  const { picture, name, email, size = "sm", muted, className = "" } = props;
  const base = cx("shrink-0 rounded-full object-cover", sizes[size], className);

  if (picture) return <img src={picture} alt="" referrerPolicy="no-referrer" className={base} />;

  const monogram = monogramOf(name, email);
  return (
    <span
      aria-hidden="true"
      className={cx(
        base,
        "flex items-center justify-center font-medium",
        muted
          ? "border border-dashed border-border bg-transparent text-ink-3"
          : "bg-surface-3 text-ink-2",
      )}
    >
      {monogram || <User size={size === "sm" ? 14 : 16} />}
    </span>
  );
}

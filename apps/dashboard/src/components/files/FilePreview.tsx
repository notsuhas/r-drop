import { lazy, Suspense } from "react";
import FileTypeIcon from "@/components/files/FileTypeIcon";
import { basename, extension, type FileKind, fileKind } from "@/lib/format";

/**
 * row  — 28px thumbnail in a list row: cover image or a bare type icon.
 * tile — grid cell: still previews plus hover-to-play video.
 * full — details panel: real players, since there's room and intent.
 */
export type PreviewVariant = "row" | "tile" | "full";

interface IFilePreview {
  url: string;
  keyName: string;
  contentType: string;
  variant?: PreviewVariant;
}

const RivePreview = lazy(() => import("./RivePreview"));

export default function FilePreview(props: IFilePreview) {
  const { url, keyName, contentType, variant = "tile" } = props;
  const kind = fileKind(contentType, keyName);
  const glyph = <TypeGlyph kind={kind} keyName={keyName} variant={variant} />;

  if (kind === "image") return <ImagePreview url={url} keyName={keyName} variant={variant} />;

  if (kind === "rive" && variant !== "row")
    return (
      <Suspense fallback={glyph}>
        <div className="bg-checker h-full w-full">
          <RivePreview url={url} />
        </div>
      </Suspense>
    );

  if (kind === "video" && variant !== "row")
    return <VideoPreview url={url} variant={variant} glyph={glyph} />;

  if (kind === "audio" && variant === "full") return <AudioPreview url={url} />;

  return glyph;
}

function ImagePreview(props: { url: string; keyName: string; variant: PreviewVariant }) {
  const { url, keyName, variant } = props;
  return (
    <div className="bg-checker h-full w-full">
      <img
        src={url}
        alt={basename(keyName)}
        loading="lazy"
        decoding="async"
        className={
          variant === "row"
            ? "h-full w-full object-cover"
            : "h-full w-full object-contain p-2 transition-transform duration-(--duration-slow) ease-(--ease-out-quart) group-hover:scale-[1.03]"
        }
      />
    </div>
  );
}

function VideoPreview(props: { url: string; variant: PreviewVariant; glyph: React.ReactNode }) {
  const { url, variant, glyph } = props;

  if (variant === "full")
    return (
      // biome-ignore lint/a11y/useMediaCaption: throwaway dev assets have no captions
      <video
        src={url}
        controls
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
      />
    );

  // Video without a poster frame would render an empty box, which reads as a
  // broken tile. Show the type glyph, then fade the real video in on hover.
  return (
    <div className="relative h-full w-full">
      {glyph}
      <video
        src={url}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-(--duration-base) group-hover:opacity-100"
        onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
        onMouseLeave={(e) => e.currentTarget.pause()}
      />
    </div>
  );
}

/** A native audio player inside a grid cell breaks the tile rhythm and offers
 *  controls nobody asked for while scanning, so it lives only in details. */
function AudioPreview(props: { url: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4">
      <FileTypeIcon kind="audio" size={26} />
      {/* biome-ignore lint/a11y/useMediaCaption: throwaway dev assets have no captions */}
      <audio src={props.url} controls preload="none" className="w-full max-w-[240px]" />
    </div>
  );
}

/** Fallback face: the type icon plus the literal extension, which is what
 *  people actually recognise a file by. */
function TypeGlyph(props: { kind: FileKind; keyName: string; variant: PreviewVariant }) {
  const { kind, keyName, variant } = props;
  if (variant === "row")
    return (
      <div className="flex h-full w-full items-center justify-center">
        <FileTypeIcon kind={kind} size={15} />
      </div>
    );

  const ext = extension(keyName);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <FileTypeIcon kind={kind} size={24} />
      {ext && <span className="font-mono text-2xs uppercase tracking-wide text-ink-3">{ext}</span>}
    </div>
  );
}

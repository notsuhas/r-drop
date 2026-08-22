import { lazy, Suspense } from "react";
import { basename, extension, fileKind } from "@/lib/format";

interface IFilePreview {
  url: string;
  keyName: string;
  contentType: string;
}

// Checkerboard so transparent assets read against something.
const RivePreview = lazy(() => import("./RivePreview"));

const checker =
  "bg-[length:16px_16px] bg-[conic-gradient(rgba(255,255,255,0.04)_90deg,transparent_90deg_180deg,rgba(255,255,255,0.04)_180deg_270deg,transparent_270deg)]";

export default function FilePreview(props: IFilePreview) {
  const { url, keyName, contentType } = props;
  const kind = fileKind(contentType, keyName);

  if (kind === "image")
    return (
      <div className={`h-full w-full ${checker}`}>
        <img
          src={url}
          alt={basename(keyName)}
          loading="lazy"
          className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.04]"
        />
      </div>
    );

  if (kind === "rive")
    return (
      <Suspense fallback={<ExtBadge label="riv" />}>
        <div className={`h-full w-full ${checker}`}>
          <RivePreview url={url} />
        </div>
      </Suspense>
    );

  if (kind === "video")
    return (
      // biome-ignore lint/a11y/useMediaCaption: throwaway dev assets have no captions
      <video
        src={url}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => e.currentTarget.pause()}
      />
    );

  if (kind === "audio")
    return (
      <div className="flex h-full w-full items-center justify-center">
        {/* biome-ignore lint/a11y/useMediaCaption: throwaway dev assets have no captions */}
        <audio src={url} controls preload="none" className="w-[90%]" />
      </div>
    );

  return <ExtBadge label={extension(keyName) || "file"} />;
}

function ExtBadge(props: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className=" rounded-none border border-line px-2 py-1 font-mono text-xs uppercase text-muted">
        {props.label}
      </span>
    </div>
  );
}

import {
  Archive,
  Braces,
  FileAudio,
  File as FileIcon,
  FileText,
  FileVideo,
  Film,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import type { FileKind } from "@/lib/format";

/** One icon and one tint per file kind, so a folder of mixed assets is
 *  scannable by type before any thumbnail finishes loading. */
const MAP: Record<FileKind, { icon: typeof FileIcon; tint: string }> = {
  image: { icon: ImageIcon, tint: "text-ok" },
  rive: { icon: Film, tint: "text-accent-text" },
  video: { icon: FileVideo, tint: "text-accent-text" },
  audio: { icon: FileAudio, tint: "text-ink-2" },
  pdf: { icon: FileText, tint: "text-danger" },
  font: { icon: Type, tint: "text-ink-2" },
  archive: { icon: Archive, tint: "text-ink-2" },
  code: { icon: Braces, tint: "text-ok" },
  text: { icon: FileText, tint: "text-ink-2" },
  other: { icon: FileIcon, tint: "text-ink-3" },
};

interface IFileTypeIcon {
  kind: FileKind;
  size?: number;
  className?: string;
}

export default function FileTypeIcon(props: IFileTypeIcon) {
  const { kind, size = 16, className = "" } = props;
  const { icon: Icon, tint } = MAP[kind];
  return <Icon size={size} className={`${tint} ${className}`} aria-hidden="true" />;
}

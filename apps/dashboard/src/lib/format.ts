// Pure display helpers shared across file components; unit-tested.

const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export const fmtSize = (n: number) => {
  if (n < 1024) return `${n} B`;
  let value = n;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${UNITS[unit]}`;
};

export const camelCase = (s: string) =>
  s
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());

export const basename = (key: string) => key.slice(key.lastIndexOf("/") + 1);

export const extension = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
};

/** The relative half of fmtWhen: seconds elapsed to a human phrase. */
function relativeWhen(seconds: number) {
  if (seconds < 45) return "just now";
  if (seconds < 90) return "a minute ago";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

/**
 * Upload times read as "3 min ago" while they're fresh and switch to an
 * absolute date once relative time stops being useful. Recency is what people
 * scan for right after an upload; older than a week, the date is what matters.
 */
export function fmtWhen(iso: string) {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "\u2014";
  const seconds = Math.round((Date.now() - then.getTime()) / 1000);
  if (seconds < 7 * 86_400) return relativeWhen(seconds);
  return then.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: then.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export const fmtWhenExact = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

export type FileKind =
  | "image"
  | "rive"
  | "video"
  | "audio"
  | "pdf"
  | "font"
  | "archive"
  | "code"
  | "text"
  | "other";

const BY_EXTENSION: Record<string, FileKind> = {
  riv: "rive",
  pdf: "pdf",
  woff: "font",
  woff2: "font",
  ttf: "font",
  otf: "font",
  zip: "archive",
  gz: "archive",
  tgz: "archive",
  tar: "archive",
  rar: "archive",
  "7z": "archive",
  json: "code",
  js: "code",
  mjs: "code",
  ts: "code",
  tsx: "code",
  jsx: "code",
  css: "code",
  html: "code",
  svg: "image",
  lottie: "code",
  md: "text",
  txt: "text",
  csv: "text",
};

export function fileKind(contentType: string, key: string): FileKind {
  // Extension wins for the formats R2 serves as octet-stream (.riv, fonts).
  const byExt = BY_EXTENSION[extension(key)];
  if (byExt) return byExt;
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  if (contentType.startsWith("font/")) return "font";
  if (contentType === "application/pdf") return "pdf";
  if (contentType.startsWith("text/")) return "text";
  return "other";
}

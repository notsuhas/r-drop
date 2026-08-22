// Copy-as formats for the selection pill; unit-tested.
import { basename, camelCase } from "./format";

export type CopyFormat = "newline" | "json" | "ts" | "manifest";

/** Folder part of an object key ("a/b/c.png" -> "a/b"), or "" at the root. */
export const folderOf = (key: string) =>
  key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";

/** What a completed copy is called in a confirmation, e.g. "Copied 3 URLs". */
export function describeCopy(format: CopyFormat, count: number) {
  if (format === "manifest") return "Copied manifest URL";
  if (format === "json") return `Copied JSON for ${count} ${count === 1 ? "file" : "files"}`;
  if (format === "ts") return `Copied TypeScript for ${count} ${count === 1 ? "file" : "files"}`;
  return `Copied ${count} ${count === 1 ? "URL" : "URLs"}`;
}

/** Label for the segment of a folder path below its parent. */
export const folderLabel = (full: string, parent: string) =>
  parent && full.startsWith(`${parent}/`) ? full.slice(parent.length + 1) : full;

interface ILinkable {
  key: string;
  url: string;
}

export function formatLinks(
  objects: ILinkable[],
  format: CopyFormat,
  folder: string,
  publicBase: string,
) {
  if (format === "manifest") return `${publicBase}/_manifest/${folder}.json`;
  if (format === "newline") return objects.map((o) => o.url).join("\n");
  const entries = objects.map((o) => [camelCase(basename(o.key)), o.url] as const);
  if (format === "json") return JSON.stringify(Object.fromEntries(entries), null, 2);
  return `export const ASSETS = {\n${entries
    .map(([k, v]) => `  ${k}: "${v}",`)
    .join("\n")}\n} as const;`;
}

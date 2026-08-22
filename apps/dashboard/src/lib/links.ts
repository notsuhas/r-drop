import { basename, camelCase } from "./format";

export type CopyFormat = "newline" | "json" | "ts" | "manifest";

export const COPY_FORMATS: { id: CopyFormat; label: string }[] = [
  { id: "newline", label: "urls" },
  { id: "json", label: "json" },
  { id: "ts", label: "ts const" },
  { id: "manifest", label: "manifest url" },
];

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

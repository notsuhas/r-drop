// Object-key hygiene: slugs, folder cleaning, and the reserved manifest namespace.
export const slugify = (s: string) => {
  const dot = s.lastIndexOf(".");
  const [base, ext] = dot > 0 ? [s.slice(0, dot), s.slice(dot)] : [s, ""];
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (slug || "file") + ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
};

export const camelCase = (s: string) =>
  s
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());

export const cleanFolder = (f: string) =>
  f
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/");

export const RESERVED_PREFIX = "_manifest";

/** Folder part of an object key ("a/b/c.png" -> "a/b"), or "" at bucket root. */
export const folderOf = (key: string) =>
  key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";

export const isReservedKey = (key: string) =>
  key === RESERVED_PREFIX || key.startsWith(`${RESERVED_PREFIX}/`);

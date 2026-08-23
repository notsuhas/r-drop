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

/**
 * Reduce a requested folder to the characters an object key may contain.
 *
 * Order matters: illegal characters go first, because stripping the outer
 * slashes before removing the dots left "../../etc" as "/etc" — a leading
 * slash that produced a double-slash CDN URL and a manifest the browser could
 * not navigate back to.
 */
export const cleanFolder = (f: string) =>
  f
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");

export const RESERVED_PREFIX = "_manifest";

/** Folder part of an object key ("a/b/c.png" -> "a/b"), or "" at bucket root. */
export const folderOf = (key: string) =>
  key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "";

export const isReservedKey = (key: string) =>
  key === RESERVED_PREFIX || key.startsWith(`${RESERVED_PREFIX}/`);

/**
 * True when a key is shaped like one of our own writers would have produced.
 *
 * Delete takes its key straight from the URL, and that key reaches a bucket
 * write through the manifest regeneration that follows it — "a/../b/x.png"
 * used to leave a stray "_manifest/a/../b.json" behind.
 */
export const isCleanKey = (key: string) => {
  if (!key || isReservedKey(key) || key.endsWith("/")) return false;
  const folder = folderOf(key);
  return folder === "" ? true : cleanFolder(folder) === folder;
};

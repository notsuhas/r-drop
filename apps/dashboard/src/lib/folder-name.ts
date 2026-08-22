// User-typed folder names become url/key-safe slugs.
export const normalizeFolderName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

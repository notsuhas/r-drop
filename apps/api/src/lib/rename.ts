import { cleanFolder, folderOf, isReservedKey, slugify } from "./keys";

export type RenameResolution =
  | { ok: true; newKey: string; oldFolder: string; newFolder: string }
  | { ok: false; error: string; status: 400 };

/**
 * Turn a requested rename/move ("folder/New Name.PNG", typed by a user or
 * agent) into a safe object key, or explain why it can't be one.
 */
export function resolveRenameTarget(
  key: string | undefined,
  requestedKey: string | undefined,
): RenameResolution {
  const invalid = (error: string): RenameResolution => ({ ok: false, error, status: 400 });

  if (!key || isReservedKey(key)) {
    return invalid("invalid key");
  }
  if (!requestedKey) {
    return invalid("invalid new key");
  }

  // A bare filename would drop the object at the bucket root, so the target
  // must always be "folder/name".
  const lastSlash = requestedKey.lastIndexOf("/");
  if (lastSlash <= 0) {
    return invalid("invalid new key");
  }

  const newFolder = cleanFolder(requestedKey.slice(0, lastSlash));
  const newName = slugify(requestedKey.slice(lastSlash + 1));
  if (!newFolder) {
    return invalid("invalid new key");
  }

  const newKey = `${newFolder}/${newName}`;
  if (isReservedKey(newKey)) {
    return invalid("reserved folder name");
  }

  return { ok: true, newKey, oldFolder: folderOf(key), newFolder };
}

import { cleanFolder, isReservedKey, slugify } from "./keys";

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export type UploadResolution =
  | { ok: true; file: File; key: string; folder: string }
  | { ok: false; error: string; status: 400 | 413 };

export function resolveUpload(form: FormData): UploadResolution {
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, error: "no file field", status: 400 };
  if (file.size === 0) return { ok: false, error: "empty file", status: 400 };
  if (file.size > MAX_UPLOAD_BYTES)
    return { ok: false, error: `file exceeds ${MAX_UPLOAD_BYTES / 1048576}MB limit`, status: 413 };

  const rawFolder = typeof form.get("folder") === "string" ? (form.get("folder") as string) : "";
  const folder = cleanFolder(rawFolder) || "scratch";
  if (isReservedKey(folder)) return { ok: false, error: "reserved folder name", status: 400 };
  return { ok: true, file, folder, key: `${folder}/${slugify(file.name)}` };
}

import { useCallback, useRef, useState } from "react";
import { uploadWithProgress } from "../lib/upload";

export type UploadStatus = "queued" | "reading" | "uploading" | "done" | "error";

export interface IUploadItem {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export function useUploads(onUploaded: () => void) {
  const [items, setItems] = useState<IUploadItem[]>([]);
  const busy = useRef(false);
  const queue = useRef<{ id: string; file: File; folder: string }[]>([]);

  const patch = (id: string, changes: Partial<IUploadItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)));

  const drain = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    let job = queue.current.shift();
    while (job) {
      const { id, file, folder } = job;
      try {
        // Snapshot bytes immediately: a dragged file's read grant can expire,
        // and reading here turns disk failures into per-file errors.
        patch(id, { status: "reading" });
        const bytes = await file.arrayBuffer();
        patch(id, { status: "uploading", progress: 0 });
        await uploadWithProgress(bytes, file.name, file.type, folder, (fraction) =>
          patch(id, { progress: fraction }),
        );
        patch(id, { status: "done", progress: 1 });
        onUploaded();
      } catch (err) {
        patch(id, {
          status: "error",
          error: err instanceof Error ? err.message : "failed",
        });
      }
      job = queue.current.shift();
    }
    busy.current = false;
  }, [onUploaded]);

  const enqueue = useCallback(
    (entries: { file: File; folder: string }[]) => {
      const jobs = entries.map((e) => ({ id: crypto.randomUUID(), ...e }));
      setItems((prev) => [
        ...prev,
        ...jobs.map((j) => ({
          id: j.id,
          name: j.file.name,
          size: j.file.size,
          status: "queued" as const,
          progress: 0,
        })),
      ]);
      queue.current.push(...jobs);
      void drain();
    },
    [drain],
  );

  const dismiss = useCallback(
    () => setItems((prev) => prev.filter((it) => it.status !== "done" && it.status !== "error")),
    [],
  );

  const active = items.some((it) => it.status !== "done" && it.status !== "error");
  return { items, enqueue, dismiss, active };
}

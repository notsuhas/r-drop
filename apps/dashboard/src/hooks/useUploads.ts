import { useCallback, useRef, useState } from "react";
import { uploadWithProgress } from "@/lib/upload";

export type UploadStatus = "queued" | "reading" | "uploading" | "done" | "error" | "cancelled";

export interface IUploadItem {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number;
  error?: string;
}

const SETTLED: UploadStatus[] = ["done", "error", "cancelled"];

export function useUploads(onUploaded: () => void) {
  const [items, setItems] = useState<IUploadItem[]>([]);
  const busy = useRef(false);
  const queue = useRef<{ id: string; file: File; folder: string }[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const patch = (id: string, changes: Partial<IUploadItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)));

  const drain = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    let job = queue.current.shift();
    while (job) {
      const { id, file, folder } = job;
      const controller = new AbortController();
      controllers.current.set(id, controller);
      try {
        // Snapshot bytes immediately: a dragged file's read grant can expire,
        // and reading here turns disk failures into per-file errors.
        patch(id, { status: "reading" });
        const bytes = await file.arrayBuffer();
        patch(id, { status: "uploading", progress: 0 });
        await uploadWithProgress(
          bytes,
          file.name,
          file.type,
          folder,
          (fraction) => patch(id, { progress: fraction }),
          controller.signal,
        );
        patch(id, { status: "done", progress: 1 });
        onUploaded();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          patch(id, { status: "cancelled" });
        } else {
          patch(id, { status: "error", error: err instanceof Error ? err.message : "failed" });
        }
      } finally {
        controllers.current.delete(id);
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

  const cancel = useCallback((id: string) => {
    const queuedIndex = queue.current.findIndex((j) => j.id === id);
    if (queuedIndex >= 0) {
      queue.current.splice(queuedIndex, 1);
      patch(id, { status: "cancelled" });
      return;
    }
    controllers.current.get(id)?.abort();
  }, []);

  const cancelAll = useCallback(() => {
    for (const job of queue.current.splice(0)) patch(job.id, { status: "cancelled" });
    for (const controller of controllers.current.values()) controller.abort();
  }, []);

  const dismiss = useCallback(
    () => setItems((prev) => prev.filter((it) => !SETTLED.includes(it.status))),
    [],
  );

  const active = items.some((it) => !SETTLED.includes(it.status));
  return { items, enqueue, cancel, cancelAll, dismiss, active };
}

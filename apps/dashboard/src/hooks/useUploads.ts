import { MAX_UPLOAD_BYTES } from "@api/lib/upload-input";
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

  const patch = useCallback(
    (id: string, changes: Partial<IUploadItem>) =>
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it))),
    [],
  );

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
  }, [onUploaded, patch]);

  const enqueue = useCallback(
    (entries: { file: File; folder: string }[]) => {
      const jobs = entries.map((e) => ({ id: crypto.randomUUID(), ...e }));
      // Reject oversize here rather than letting the worker do it: the queue
      // reads the whole file into memory and uploads every byte before the
      // server can answer 413, so a 500MB drop cost a 500MB round trip.
      const tooBig = new Set(jobs.filter((j) => j.file.size > MAX_UPLOAD_BYTES).map((j) => j.id));
      setItems((prev) => [
        ...prev,
        ...jobs.map((j) => ({
          id: j.id,
          name: j.file.name,
          size: j.file.size,
          ...(tooBig.has(j.id)
            ? {
                status: "error" as const,
                error: `over the ${MAX_UPLOAD_BYTES / 1048576}MB limit`,
              }
            : { status: "queued" as const }),
          progress: 0,
        })),
      ]);
      queue.current.push(...jobs.filter((j) => !tooBig.has(j.id)));
      void drain();
    },
    [drain],
  );

  const cancel = useCallback(
    (id: string) => {
      const queuedIndex = queue.current.findIndex((j) => j.id === id);
      if (queuedIndex >= 0) {
        queue.current.splice(queuedIndex, 1);
        patch(id, { status: "cancelled" });
        return;
      }
      controllers.current.get(id)?.abort();
    },
    [patch],
  );

  const cancelAll = useCallback(() => {
    for (const job of queue.current.splice(0)) patch(job.id, { status: "cancelled" });
    for (const controller of controllers.current.values()) controller.abort();
  }, [patch]);

  const dismiss = useCallback(
    () => setItems((prev) => prev.filter((it) => !SETTLED.includes(it.status))),
    [],
  );

  const active = items.some((it) => !SETTLED.includes(it.status));
  return { items, enqueue, cancel, cancelAll, dismiss, active };
}

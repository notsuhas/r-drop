import type { IObject } from "@/lib/api";

export interface IUploadResult extends IObject {
  manifestUrl: string;
}

// XHR instead of fetch: fetch cannot report upload progress.
export function uploadWithProgress(
  bytes: ArrayBuffer,
  filename: string,
  contentType: string,
  folder: string,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<IUploadResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.set("folder", folder);
    form.set("file", new File([bytes], filename, { type: contentType }));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response as IUploadResult);
      else reject(new Error(xhr.response?.error ?? `upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("network error"));
    xhr.onabort = () => reject(new DOMException("cancelled", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(form);
  });
}

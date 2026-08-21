import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PUBLIC_BASE, type IObject } from "../lib/api";
import Button from "../components/Button";
import Empty from "../components/Empty";

type CopyFormat = "newline" | "json" | "ts" | "manifest";

const fmtSize = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;

const camel = (s: string) =>
  s
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());

const basename = (key: string) => key.slice(key.lastIndexOf("/") + 1);

function formatLinks(objects: IObject[], format: CopyFormat, folder: string) {
  if (format === "manifest") return `${PUBLIC_BASE}/_manifest/${folder}.json`;
  if (format === "newline") return objects.map((o) => o.url).join("\n");
  const entries = objects.map((o) => [camel(basename(o.key)), o.url] as const);
  if (format === "json")
    return JSON.stringify(Object.fromEntries(entries), null, 2);
  return `export const ASSETS = {\n${entries
    .map(([k, v]) => `  ${k}: "${v}",`)
    .join("\n")}\n} as const;`;
}

export default function Files() {
  const [folder, setFolder] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["objects", folder],
    queryFn: () => api.objects(folder),
  });

  const uploadTarget = folder || "scratch";

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      for (const f of files) await api.upload(f, uploadTarget);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["objects"] }),
  });

  const remove = useMutation({
    mutationFn: async (keys: string[]) => {
      for (const k of keys) await api.deleteObject(k);
    },
    onSuccess: () => setSelected(new Set()),
    onSettled: () => qc.invalidateQueries({ queryKey: ["objects"] }),
  });

  const visible = (data?.objects ?? []).filter((o) => !o.key.startsWith("_manifest/"));
  const folders = (data?.folders ?? []).filter((f) => f !== "_manifest");
  const selectedObjects = visible.filter((o) => selected.has(o.key));

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const copy = async (format: CopyFormat) => {
    await navigator.clipboard.writeText(formatLinks(selectedObjects, format, folder || "scratch"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const enterFolder = (f: string) => {
    setFolder(f);
    setSelected(new Set());
  };

  return (
    <div
      className="relative flex-1 overflow-y-auto p-8 pb-28"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        upload.mutate([...e.dataTransfer.files]);
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 font-display text-lg">
          <button
            type="button"
            onClick={() => enterFolder("")}
            className={folder ? "text-muted hover:text-ink" : "font-semibold"}
          >
            files
          </button>
          {folder && (
            <>
              <span className="text-muted">/</span>
              <span className="font-semibold">{folder}</span>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {!folder && (
            <Button
              onClick={() => {
                const name = prompt("New folder name");
                if (name) enterFolder(name.toLowerCase().replace(/[^a-z0-9/_-]+/g, "-"));
              }}
            >
              New folder
            </Button>
          )}
          <Button variant="primary" onClick={() => fileInput.current?.click()}>
            Upload to {uploadTarget}
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) upload.mutate([...e.target.files]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {upload.isPending && (
        <p className="mt-3 text-sm text-honey">Uploading…</p>
      )}
      {upload.isError && (
        <p className="mt-3 text-sm text-danger">Upload failed: {upload.error.message}</p>
      )}

      {!folder && folders.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {folders.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => enterFolder(f)}
              className="group flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 transition-colors hover:border-[rgba(255,178,86,0.4)]"
            >
              <span className="text-honey">▸</span>
              <span className="font-display text-sm">{f}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="mt-10 text-sm text-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <Empty
            title={folder ? `${folder} is empty` : "No files yet"}
            hint="Drop files anywhere in this window, or use Upload. Files get a public URL immediately."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {visible.map((o) => {
            const isSel = selected.has(o.key);
            const isImage = o.contentType.startsWith("image/");
            return (
              <div
                key={o.key}
                className={`group relative overflow-hidden rounded-xl border bg-panel transition-colors ${
                  isSel ? "border-honey" : "border-line hover:border-[rgba(255,255,255,0.2)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(o.key)}
                  className="block w-full text-left"
                >
                  <div className="flex h-32 items-center justify-center bg-panel-2">
                    {isImage ? (
                      <img
                        src={o.url}
                        alt={basename(o.key)}
                        loading="lazy"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="font-mono text-xs uppercase text-muted">
                        {basename(o.key).split(".").pop()}
                      </span>
                    )}
                  </div>
                  <div className="border-t border-line p-3">
                    <p className="truncate font-mono text-xs">{basename(o.key)}</p>
                    <p className="mt-1 text-xs text-muted">{fmtSize(o.size)}</p>
                  </div>
                </button>
                <div
                  className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border text-xs transition-opacity ${
                    isSel
                      ? "border-honey bg-honey text-honey-ink opacity-100"
                      : "border-line bg-bg opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isSel ? "✓" : ""}
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(o.url)}
                  title="Copy public URL"
                  className="absolute right-2 top-2 rounded-md border border-line bg-bg px-2 py-0.5 font-mono text-[10px] text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
                >
                  copy url
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedObjects.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-line bg-panel-2 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <span className="px-3 font-display text-sm">
            {selectedObjects.length} selected
          </span>
          <span className="mr-1 text-xs text-muted">copy as</span>
          {(
            [
              ["newline", "urls"],
              ["json", "json"],
              ["ts", "ts const"],
              ["manifest", "manifest url"],
            ] as const
          ).map(([fmt, label]) => (
            <button
              key={fmt}
              type="button"
              onClick={() => copy(fmt)}
              className="rounded-lg px-2.5 py-1.5 font-mono text-xs text-ink transition-colors hover:bg-[rgba(255,178,86,0.15)]"
            >
              {label}
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-line" />
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete ${selectedObjects.length} file(s)? Public URLs will 404.`))
                remove.mutate([...selected]);
            }}
            className="rounded-lg px-2.5 py-1.5 font-mono text-xs text-danger transition-colors hover:bg-[rgba(255,110,110,0.12)]"
          >
            delete
          </button>
          {copied && <span className="px-2 text-xs text-ok">copied</span>}
        </div>
      )}

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-[rgba(13,15,20,0.85)]">
          <div className="rounded-2xl border-2 border-dashed border-honey px-16 py-12 text-center">
            <p className="font-display text-xl font-semibold">
              Drop to upload to <span className="text-honey">{uploadTarget}/</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

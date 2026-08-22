import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Folder, LayoutGrid, List } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import DropOverlay from "../components/files/DropOverlay";
import FileCard from "../components/files/FileCard";
import InspectorDrawer from "../components/files/InspectorDrawer";
import ListView, { type SortKey } from "../components/files/ListView";
import SelectionPill from "../components/files/SelectionPill";
import UploadTray from "../components/files/UploadTray";
import Button from "../components/ui/Button";
import Empty from "../components/ui/Empty";
import SkeletonGrid from "../components/ui/Skeleton";
import { useMarquee } from "../hooks/useMarquee";
import { useUploads } from "../hooks/useUploads";
import { api, type IObject } from "../lib/api";
import { getConfig } from "../lib/config";
import { collectDropped } from "../lib/dropped";
import { basename } from "../lib/format";
import { type CopyFormat, formatLinks } from "../lib/links";

export default function Files() {
  const [location, navigate] = useLocation();
  const folder = location.startsWith("/f/") ? decodeURIComponent(location.slice(3)) : "";
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inspected, setInspected] = useState<IObject | null>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("");
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [view, setView] = useState<"grid" | "list">(
    (localStorage.getItem("ho-drive:view") as "grid" | "list") ?? "grid",
  );
  const [sortKey, setSortKey] = useState<SortKey>("uploaded");
  const [sortAsc, setSortAsc] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["objects", folder],
    queryFn: () => api.objects(folder),
  });

  const uploadTarget = folder || "scratch";
  const invalidate = useCallback(() => qc.invalidateQueries({ queryKey: ["objects"] }), [qc]);
  const uploads = useUploads(invalidate);

  const { data: rootListing } = useQuery({
    queryKey: ["objects", ""],
    queryFn: () => api.objects(""),
  });

  const rename = useMutation({
    mutationFn: ({ key, newKey }: { key: string; newKey: string }) => api.renameObject(key, newKey),
    onSuccess: () => setInspected(null),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (keys: string[]) => {
      for (const k of keys) await api.deleteObject(k);
    },
    onSuccess: () => {
      setSelected(new Set());
      setInspected(null);
    },
    onSettled: invalidate,
  });

  const visible = useMemo(() => {
    const dir = sortAsc ? 1 : -1;
    const objects = [...(data?.objects ?? [])].sort((a, b) => {
      if (sortKey === "size") return (a.size - b.size) * dir;
      if (sortKey === "name") return basename(a.key).localeCompare(basename(b.key)) * dir;
      return a.uploaded.localeCompare(b.uploaded) * dir;
    });
    if (!filter) return objects;
    const q = filter.toLowerCase();
    return objects.filter((o) => basename(o.key).toLowerCase().includes(q));
  }, [data, filter, sortKey, sortAsc]);

  const selectedObjects = visible.filter((o) => selected.has(o.key));
  const allSelected = visible.length > 0 && selectedObjects.length === visible.length;

  const marquee = useMarquee(
    useCallback((keys: string[], additive: boolean) => {
      setSelected((prev) => (additive ? new Set([...prev, ...keys]) : new Set(keys)));
    }, []),
  );

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copy = async (format: CopyFormat) => {
    const { publicBase } = await getConfig();
    await navigator.clipboard.writeText(
      formatLinks(selectedObjects, format, folder || "scratch", publicBase),
    );
    flashCopied();
  };

  const enterFolder = (f: string) => {
    navigate(f ? `/f/${encodeURIComponent(f)}` : "/");
    setSelected(new Set());
    setInspected(null);
    setFilter("");
  };

  const setViewMode = (v: "grid" | "list") => {
    setView(v);
    localStorage.setItem("ho-drive:view", v);
  };

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-drop and marquee are enhancements; buttons remain the accessible path
    <div
      className="relative flex-1 touch-none select-none overflow-y-auto p-8 pb-28"
      {...marquee.handlers}
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
        void collectDropped(e.dataTransfer).then((dropped) =>
          uploads.enqueue(
            dropped.map(({ file, dir }) => ({
              file,
              folder: dir ? `${uploadTarget}/${dir}` : uploadTarget,
            })),
          ),
        );
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 font-display text-lg">
          <button
            type="button"
            onClick={() => enterFolder("")}
            className={folder ? "text-muted transition-colors hover:text-ink" : "font-semibold"}
          >
            files
          </button>
          {folder && (
            <>
              <span className="text-muted">/</span>
              <span className="font-semibold">{folder}</span>
            </>
          )}
          {visible.length > 0 && (
            <span className="ml-2 rounded-none bg-panel-2 px-2 py-0.5 text-xs text-muted">
              {visible.length}
            </span>
          )}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          {visible.length > 0 && (
            <Button
              onClick={() =>
                setSelected(allSelected ? new Set() : new Set(visible.map((o) => o.key)))
              }
            >
              {allSelected ? "Clear selection" : "Select all"}
            </Button>
          )}
          <div className="flex border border-line">
            {(
              [
                ["grid", LayoutGrid],
                ["list", List],
              ] as const
            ).map(([mode, Icon]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-label={`${mode} view`}
                className={`px-2.5 py-1.5 transition-colors ${
                  view === mode ? "bg-panel-2 text-honey" : "text-muted hover:text-ink"
                }`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filter…"
            className="w-36 rounded-none border border-line bg-panel px-3 py-1.5 font-mono text-sm transition-[width] placeholder:text-muted focus:w-52"
          />
          {!folder &&
            (newFolderOpen ? (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = newFolderName.toLowerCase().replace(/[^a-z0-9/_-]+/g, "-");
                  if (name) {
                    enterFolder(name);
                    setNewFolderOpen(false);
                    setNewFolderName("");
                  }
                }}
              >
                <input
                  // biome-ignore lint/a11y/noAutofocus: focus follows the button that revealed this input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setNewFolderOpen(false)}
                  placeholder="folder-name"
                  className="w-40 rounded-none border border-line bg-panel px-3 py-1.5 font-mono text-sm placeholder:text-muted"
                />
                <Button variant="primary" type="submit">
                  Go
                </Button>
              </form>
            ) : (
              <Button onClick={() => setNewFolderOpen(true)}>New folder</Button>
            ))}
          <Button variant="primary" onClick={() => fileInput.current?.click()}>
            Upload to {uploadTarget}
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length)
                uploads.enqueue(
                  [...e.target.files].map((file) => ({ file, folder: uploadTarget })),
                );
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {!folder && (data?.folders.length ?? 0) > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {data?.folders.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => enterFolder(f)}
              className="flex items-center gap-2 rounded-none border border-line bg-panel px-4 py-2.5 transition-colors hover:border-[rgba(255,178,86,0.4)]"
            >
              <Folder size={15} className="text-honey" />
              <span className="font-display text-sm">{f}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid />
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <Empty
            title={
              filter
                ? `Nothing matches "${filter}"`
                : folder
                  ? `${folder} is empty`
                  : "No files yet"
            }
            hint="Drop files or folders anywhere in this window, or use Upload. Files get a public URL immediately."
          />
        </div>
      ) : view === "list" ? (
        <ListView
          objects={visible}
          selected={selected}
          sortKey={sortKey}
          sortAsc={sortAsc}
          onSort={onSort}
          onToggle={toggle}
          onInspect={setInspected}
        />
      ) : (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {visible.map((o) => (
            <div key={o.key} data-key={o.key}>
              <FileCard
                object={o}
                selected={selected.has(o.key)}
                onToggle={() => toggle(o.key)}
                onInspect={() => setInspected(o)}
                onCopied={flashCopied}
              />
            </div>
          ))}
        </div>
      )}

      {selectedObjects.length > 0 && (
        <SelectionPill
          count={selectedObjects.length}
          copied={copied}
          onCopy={copy}
          onDelete={() => remove.mutate([...selected])}
        />
      )}

      {inspected && (
        <InspectorDrawer
          object={inspected}
          folders={rootListing?.folders ?? []}
          onClose={() => setInspected(null)}
          onCopied={flashCopied}
          onDelete={() => remove.mutate([inspected.key])}
          onRename={(newKey) => rename.mutate({ key: inspected.key, newKey })}
        />
      )}

      <UploadTray items={uploads.items} active={uploads.active} onDismiss={uploads.dismiss} />
      {dragging && <DropOverlay target={uploadTarget} />}
      {marquee.rect && (
        <div
          className="pointer-events-none fixed z-10 rounded-none border border-honey bg-[rgba(255,178,86,0.1)]"
          style={marquee.rect}
        />
      )}
    </div>
  );
}

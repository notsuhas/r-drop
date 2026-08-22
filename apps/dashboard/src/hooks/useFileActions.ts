// Every mutating or clipboard action the file browser can take, with its
// confirmation wired in. Extracted from the page so the page stays composition.
import { useCallback } from "react";
import type { FileBrowser } from "@/hooks/useFileBrowser";
import { modeFromEvent, type SelectMode } from "@/hooks/useSelection";
import { useToast } from "@/hooks/useToast";
import type { IObject } from "@/lib/api";
import { basename } from "@/lib/format";
import { type CopyFormat, describeCopy } from "@/lib/links";

const CLIPBOARD_DENIED = "Couldn't reach the clipboard. Check browser permissions.";

export function useFileActions(b: FileBrowser) {
  const { toast } = useToast();

  const enqueue = useCallback(
    (entries: { file: File; dir: string }[]) => {
      if (entries.length === 0) return;
      b.uploads.enqueue(
        entries.map(({ file, dir }) => ({
          file,
          folder: dir ? `${b.uploadTarget}/${dir}` : b.uploadTarget,
        })),
      );
    },
    [b.uploads.enqueue, b.uploadTarget],
  );

  const select = useCallback(
    (key: string, mode: SelectMode) => b.select(key, mode, b.orderedKeys),
    [b.select, b.orderedKeys],
  );

  const selectFromClick = useCallback(
    (key: string, event: React.MouseEvent) => select(key, modeFromEvent(event)),
    [select],
  );

  /**
   * Ticking a checkbox always adds or removes, never replaces — that is the
   * whole point of the control, and it is what makes "select all, then untick
   * a few" work. Shift still extends a range, as it does in Finder and Drive.
   */
  const toggleFromCheckbox = useCallback(
    (key: string, event: React.MouseEvent) => select(key, event.shiftKey ? "range" : "toggle"),
    [select],
  );

  const copy = useCallback(
    (format: CopyFormat) => {
      void b
        .copy(format)
        .then(({ count }) => toast(describeCopy(format, count), "ok"))
        .catch(() => toast(CLIPBOARD_DENIED, "danger"));
    },
    [b.copy, toast],
  );

  const copyOneUrl = useCallback(
    (object: IObject) => {
      void navigator.clipboard
        .writeText(object.url)
        .then(() => toast(`Copied URL for ${basename(object.key)}`, "ok"))
        .catch(() => toast(CLIPBOARD_DENIED, "danger"));
    },
    [toast],
  );

  const remove = useCallback(
    (keys: string[]) => {
      if (keys.length === 0) return;
      const label = keys.length === 1 ? basename(keys[0]) : `${keys.length} files`;
      b.remove.mutate(keys, {
        onSuccess: () => toast(`Deleted ${label}`, "neutral"),
        onError: (error) => toast(error.message || "Delete failed", "danger"),
      });
    },
    [b.remove.mutate, toast],
  );

  const rename = useCallback(
    (key: string, newKey: string) => {
      b.rename.mutate(
        { key, newKey },
        {
          onSuccess: () => toast(`Renamed to ${basename(newKey)}`, "ok"),
          onError: (error) => toast(error.message || "Rename failed", "danger"),
        },
      );
    },
    [b.rename.mutate, toast],
  );

  return { enqueue, select, selectFromClick, toggleFromCheckbox, copy, copyOneUrl, remove, rename };
}

export type FileActions = ReturnType<typeof useFileActions>;

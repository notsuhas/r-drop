// Clipboard copy for the selection, in each of the formats agents consume.
import { useCallback } from "react";
import type { IObject } from "@/lib/api";
import { getConfig } from "@/lib/config";
import { type CopyFormat, formatLinks } from "@/lib/links";

export interface ICopyResult {
  format: CopyFormat;
  count: number;
}

export function useCopyLinks(getObjects: () => IObject[], getFolder: () => string) {
  const copy = useCallback(
    async (format: CopyFormat): Promise<ICopyResult> => {
      const objects = getObjects();
      const { publicBase } = await getConfig();
      await navigator.clipboard.writeText(formatLinks(objects, format, getFolder(), publicBase));
      return { format, count: objects.length };
    },
    [getObjects, getFolder],
  );

  return { copy };
}

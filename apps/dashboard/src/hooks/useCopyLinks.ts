// Clipboard copy for the selection pill, with a transient "copied" flash.
import { useCallback, useState } from "react";
import type { IObject } from "../lib/api";
import { getConfig } from "../lib/config";
import { type CopyFormat, formatLinks } from "../lib/links";

export function useCopyLinks(getObjects: () => IObject[], getFolder: () => string) {
  const [copied, setCopied] = useState(false);

  const flashCopied = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  const copy = useCallback(
    async (format: CopyFormat) => {
      const { publicBase } = await getConfig();
      await navigator.clipboard.writeText(
        formatLinks(getObjects(), format, getFolder(), publicBase),
      );
      flashCopied();
    },
    [getObjects, getFolder, flashCopied],
  );

  return { copied, flashCopied, copy };
}

// Floating bar for the current selection. Its primary action is copying URLs
// because that is what a selection in r-drop is usually *for*.
import { Braces, FileCode2, FileJson, Link2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Menu from "@/components/ui/Menu";
import { useMenu } from "@/hooks/useMenu";
import { fmtSize } from "@/lib/format";
import type { CopyFormat } from "@/lib/links";

interface ISelectionBar {
  count: number;
  totalSize: number;
  onCopy: (format: CopyFormat) => void;
  onDelete: () => void;
  onClear: () => void;
  /** Set by the Delete key so the bar opens already asking for confirmation. */
  deleteArmed: boolean;
  onDeleteArmedChange: (armed: boolean) => void;
}

export default function SelectionBar(props: ISelectionBar) {
  const { count, totalSize, onCopy, onDelete, onClear, deleteArmed, onDeleteArmedChange } = props;
  const formatMenu = useMenu();
  const [confirming, setConfirming] = useState(false);

  // The keyboard shortcut and the button lead to the same confirmation.
  useEffect(() => {
    if (deleteArmed) setConfirming(true);
  }, [deleteArmed]);

  const stopConfirming = () => {
    setConfirming(false);
    onDeleteArmedChange(false);
  };

  return (
    <div className="animate-rise pointer-events-none fixed inset-x-0 bottom-4 z-(--z-index-drawer) flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-1.5 rounded-xl bg-surface-3 p-1.5 pl-3 shadow-e4">
        <p className="shrink-0 text-sm">
          <span className="font-medium text-ink">{count} selected</span>
          {totalSize > 0 && (
            <span className="ml-1.5 font-mono text-xs text-ink-3">{fmtSize(totalSize)}</span>
          )}
        </p>

        <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />

        {confirming ? (
          <>
            <p className="min-w-0 truncate text-sm text-danger">
              Delete permanently? Existing URLs will 404.
            </p>
            <Button
              size="sm"
              variant="danger"
              icon={<Trash2 size={13} />}
              onClick={() => {
                onDelete();
                stopConfirming();
              }}
            >
              Delete {count}
            </Button>
            <Button size="sm" variant="ghost" onClick={stopConfirming}>
              Keep
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="primary"
              icon={<Link2 size={13} />}
              onClick={() => onCopy("newline")}
            >
              Copy {count === 1 ? "URL" : `${count} URLs`}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={formatMenu.openBelow}
              aria-haspopup
              aria-expanded={formatMenu.open}
            >
              Copy as…
            </Button>
            <IconButton
              size="md"
              variant="danger"
              label={`Delete ${count} selected`}
              onClick={() => setConfirming(true)}
            >
              <Trash2 size={14} />
            </IconButton>
            <IconButton size="md" label="Clear selection" onClick={onClear}>
              <X size={14} />
            </IconButton>
          </>
        )}
      </div>

      {formatMenu.anchor && (
        <Menu
          label="Copy selection as"
          anchor={formatMenu.anchor}
          onClose={formatMenu.close}
          groups={[
            {
              label: "Copy as",
              items: [
                {
                  id: "json",
                  label: "JSON object",
                  icon: <Braces size={14} />,
                  onSelect: () => onCopy("json"),
                },
                {
                  id: "ts",
                  label: "TypeScript const",
                  icon: <FileCode2 size={14} />,
                  onSelect: () => onCopy("ts"),
                },
                {
                  id: "manifest",
                  label: "Folder manifest URL",
                  icon: <FileJson size={14} />,
                  onSelect: () => onCopy("manifest"),
                },
              ],
            },
          ]}
        />
      )}
    </div>
  );
}

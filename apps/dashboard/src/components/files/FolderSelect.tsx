import { Check, ChevronDown, Folder } from "lucide-react";
import Menu from "@/components/ui/Menu";
import { useMenu } from "@/hooks/useMenu";

interface IFolderSelect {
  current: string;
  folders: string[];
  onMove: (folder: string) => void;
}

const label = (folder: string) => folder || "(root)";

/**
 * Moving a file is a rename under the hood, so this is a picker of existing
 * folders rather than a move dialog. It uses the app's own menu instead of a
 * native <select>, which the OS paints in its own light chrome.
 */
export default function FolderSelect(props: IFolderSelect) {
  const { current, folders, onMove } = props;
  const menu = useMenu();
  const options = [current, ...folders.filter((f) => f !== current)];

  return (
    <>
      <button
        type="button"
        onClick={menu.openBelow}
        aria-haspopup
        aria-expanded={menu.open}
        aria-label={`Folder: ${label(current)}. Move to another folder`}
        className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-sm bg-surface-2 py-1 pl-2 pr-1.5 font-mono text-xs text-ink transition-colors duration-(--duration-fast) hover:bg-surface-3"
      >
        <span className="min-w-0 truncate">{label(current)}</span>
        <ChevronDown size={12} className="shrink-0 text-ink-3" aria-hidden="true" />
      </button>

      {menu.anchor && (
        <Menu
          label="Move to folder"
          anchor={menu.anchor}
          onClose={menu.close}
          groups={[
            {
              label: "Move to",
              items: options.map((folder) => ({
                id: folder || "__root__",
                label: label(folder),
                icon:
                  folder === current ? (
                    <Check size={14} className="text-accent-text" />
                  ) : (
                    <Folder size={14} />
                  ),
                onSelect: () => folder !== current && onMove(folder),
              })),
            },
          ]}
        />
      )}
    </>
  );
}

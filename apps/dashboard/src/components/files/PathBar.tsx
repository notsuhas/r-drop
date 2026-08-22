// The path bar is the product's thesis made visible: a folder in r-drop *is* a
// public CDN path, so the breadcrumb is rendered as that path, in mono, and the
// URLs it describes are one click away.
import { ChevronRight, Copy, FileJson, Link2, MoreHorizontal } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import Menu from "@/components/ui/Menu";
import { useMenu } from "@/hooks/useMenu";
import { hostOf } from "@/hooks/usePublicBase";
import { useToast } from "@/hooks/useToast";
import { cx } from "@/lib/cx";

interface IPathBar {
  /** Current folder, "" at the root. */
  folder: string;
  publicBase: string;
  onEnter: (folder: string) => void;
}

interface ISegment {
  name: string;
  path: string;
}

/** Ancestor chain for "a/b/c" -> [{a}, {a/b}, {a/b/c}]. */
function segmentsOf(folder: string): ISegment[] {
  if (!folder) return [];
  const parts = folder.split("/").filter(Boolean);
  return parts.map((name, i) => ({ name, path: parts.slice(0, i + 1).join("/") }));
}

const VISIBLE_TAIL = 2;

export default function PathBar(props: IPathBar) {
  const { folder, publicBase, onEnter } = props;
  const overflow = useMenu();

  const segments = segmentsOf(folder);
  const host = hostOf(publicBase) || "r·drop";
  const elided = segments.length > VISIBLE_TAIL + 1 ? segments.slice(0, -VISIBLE_TAIL) : [];
  const shown = elided.length ? segments.slice(-VISIBLE_TAIL) : segments;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <nav
        aria-label="Folder path"
        className="flex min-w-0 items-center gap-1 overflow-hidden font-mono text-sm"
      >
        <button
          type="button"
          onClick={() => onEnter("")}
          className={cx(
            "shrink-0 truncate rounded-sm px-1.5 py-1 transition-colors duration-(--duration-fast)",
            folder ? "text-ink-3 hover:bg-surface-2 hover:text-ink" : "text-ink-2",
          )}
        >
          {host}
        </button>

        {elided.length > 0 && (
          <>
            <Divider />
            <IconButton size="sm" label="Show parent folders" onClick={overflow.openBelow}>
              <MoreHorizontal size={14} />
            </IconButton>
          </>
        )}

        {shown.map((seg, i) => (
          <span key={seg.path} className="flex min-w-0 items-center gap-1">
            <Divider />
            {i === shown.length - 1 ? (
              <span
                aria-current="page"
                className="min-w-0 truncate px-1.5 py-1 font-medium text-ink"
              >
                {seg.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onEnter(seg.path)}
                className="min-w-0 truncate rounded-sm px-1.5 py-1 text-ink-3 transition-colors duration-(--duration-fast) hover:bg-surface-2 hover:text-ink"
              >
                {seg.name}
              </button>
            )}
          </span>
        ))}
      </nav>

      {publicBase && <FolderUrlMenu folder={folder} publicBase={publicBase} />}

      {overflow.anchor && (
        <Menu
          label="Parent folders"
          anchor={overflow.anchor}
          onClose={overflow.close}
          groups={[
            {
              items: elided.map((seg) => ({
                id: seg.path,
                label: seg.name,
                onSelect: () => onEnter(seg.path),
              })),
            },
          ]}
        />
      )}
    </div>
  );
}

function Divider() {
  return <ChevronRight size={13} className="shrink-0 text-ink-3" aria-hidden="true" />;
}

/** Copies the two URLs a folder actually has: its CDN prefix and its manifest. */
function FolderUrlMenu(props: { folder: string; publicBase: string }) {
  const { folder, publicBase } = props;
  const menu = useMenu();
  const { toast } = useToast();

  const folderUrl = `${publicBase}/${folder}`.replace(/\/+$/, "");
  const manifestUrl = folder ? `${publicBase}/_manifest/${folder}.json` : "";

  const copy = (value: string, what: string) => {
    void navigator.clipboard.writeText(value);
    toast(`Copied ${what}`, "ok");
  };

  return (
    <>
      <IconButton size="sm" label="Copy this folder's URLs" onClick={menu.openBelow}>
        <Link2 size={14} />
      </IconButton>
      {menu.anchor && (
        <Menu
          label="Copy folder URLs"
          anchor={menu.anchor}
          onClose={menu.close}
          groups={[
            {
              items: [
                {
                  id: "folder",
                  label: folder ? `Copy ${folder}/ URL` : "Copy CDN base URL",
                  icon: <Copy size={14} />,
                  onSelect: () => copy(folderUrl, "folder URL"),
                },
                {
                  id: "manifest",
                  label: "Copy manifest URL",
                  icon: <FileJson size={14} />,
                  disabled: !manifestUrl,
                  onSelect: () => copy(manifestUrl, "manifest URL"),
                },
              ],
            },
          ]}
        />
      )}
    </>
  );
}

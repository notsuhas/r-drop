// Actions for the current selection, shown from right-click and from the
// per-row overflow button. Right-clicking an unselected item selects it first
// (Drive behaviour), so this menu can always speak for the selection.
import {
  Braces,
  Download,
  ExternalLink,
  FileCode2,
  FileJson,
  Info,
  Link2,
  Pencil,
  Trash2,
} from "lucide-react";
import Menu, { type IMenuAnchor, type IMenuGroup } from "@/components/ui/Menu";
import type { IObject } from "@/lib/api";
import { basename } from "@/lib/format";
import type { CopyFormat } from "@/lib/links";

interface IObjectMenu {
  anchor: IMenuAnchor;
  objects: IObject[];
  onClose: () => void;
  onCopy: (format: CopyFormat) => void;
  onInspect: (object: IObject) => void;
  onRename: (object: IObject) => void;
  onDownload: (object: IObject) => void;
  onDelete: () => void;
}

export default function ObjectMenu(props: IObjectMenu) {
  const { anchor, objects, onClose, onCopy, onInspect, onRename, onDownload, onDelete } = props;
  const single = objects.length === 1 ? objects[0] : null;
  const many = objects.length;

  const groups: IMenuGroup[] = [
    {
      items: [
        {
          id: "copy-url",
          label: single ? "Copy public URL" : `Copy ${many} public URLs`,
          icon: <Link2 size={14} />,
          onSelect: () => onCopy("newline"),
        },
        ...(single
          ? [
              {
                id: "open",
                label: "Open in new tab",
                icon: <ExternalLink size={14} />,
                onSelect: () => window.open(single.url, "_blank", "noreferrer"),
              },
            ]
          : []),
      ],
    },
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
    {
      items: [
        {
          id: "rename",
          label: "Rename",
          icon: <Pencil size={14} />,
          disabled: !single,
          onSelect: () => single && onRename(single),
        },
        {
          id: "download",
          label: "Download",
          icon: <Download size={14} />,
          disabled: !single,
          onSelect: () => single && onDownload(single),
        },
        {
          id: "details",
          label: "Details",
          icon: <Info size={14} />,
          kbd: "↵",
          disabled: !single,
          onSelect: () => single && onInspect(single),
        },
      ],
    },
    {
      items: [
        {
          id: "delete",
          label: single ? "Delete" : `Delete ${many} files`,
          icon: <Trash2 size={14} />,
          kbd: "Del",
          danger: true,
          onSelect: onDelete,
        },
      ],
    },
  ];

  return (
    <Menu
      label={single ? basename(single.key) : `${many} files`}
      anchor={anchor}
      onClose={onClose}
      groups={groups}
    />
  );
}

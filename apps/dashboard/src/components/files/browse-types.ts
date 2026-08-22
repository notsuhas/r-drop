import type { IObject } from "@/lib/api";

/** The callback surface every browse view (grid, list) is driven by. Declared
 *  once so the view components and their dispatcher can't drift apart. */
export interface IBrowseHandlers {
  onEnterFolder: (name: string) => void;
  onSelect: (key: string, event: React.MouseEvent) => void;
  /** Checkbox ticks: additive, unlike a click on the item itself. */
  onToggleSelect: (key: string, event: React.MouseEvent) => void;
  onOpen: (object: IObject) => void;
  onInspect: (object: IObject) => void;
  onCopyUrl: (object: IObject) => void;
  onMenu: (key: string, event: React.MouseEvent) => void;
}

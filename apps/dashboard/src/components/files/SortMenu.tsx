import { ArrowDownAZ, ArrowUpDown } from "lucide-react";
import Button from "@/components/ui/Button";
import Menu from "@/components/ui/Menu";
import { useMenu } from "@/hooks/useMenu";
import type { SortKey } from "@/hooks/useViewPrefs";

interface ISortMenu {
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
}

const SORTS: { id: SortKey; label: string }[] = [
  { id: "name", label: "Name" },
  { id: "size", label: "Size" },
  { id: "uploaded", label: "Last uploaded" },
];

export default function SortMenu(props: ISortMenu) {
  const { sortKey, sortAsc, onSort } = props;
  const menu = useMenu();
  const arrow = sortAsc ? "↑" : "↓";

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        icon={sortKey === "name" ? <ArrowDownAZ size={13} /> : <ArrowUpDown size={13} />}
        onClick={menu.openBelow}
        aria-haspopup
        aria-expanded={menu.open}
      >
        <span className="hidden sm:inline">
          {SORTS.find((s) => s.id === sortKey)?.label}
          <span className="ml-1 text-ink-3">{arrow}</span>
        </span>
      </Button>
      {menu.anchor && (
        <Menu
          label="Sort files"
          anchor={menu.anchor}
          onClose={menu.close}
          groups={[
            {
              label: "Sort by",
              items: SORTS.map((s) => ({
                id: s.id,
                label: s.label,
                kbd: sortKey === s.id ? arrow : undefined,
                onSelect: () => onSort(s.id),
              })),
            },
          ]}
        />
      )}
    </>
  );
}

// Server listings for the current folder plus the root (move targets),
// sorted and filtered into the visible set.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { SortKey } from "../components/files/ListView";
import { api, type IObject } from "../lib/api";
import { basename } from "../lib/format";

function sortObjects(objects: IObject[], sortKey: SortKey, sortAsc: boolean) {
  const dir = sortAsc ? 1 : -1;
  return [...objects].sort((a, b) => {
    if (sortKey === "size") return (a.size - b.size) * dir;
    if (sortKey === "name") return basename(a.key).localeCompare(basename(b.key)) * dir;
    return a.uploaded.localeCompare(b.uploaded) * dir;
  });
}

export function useObjectListing(
  folder: string,
  filter: string,
  sortKey: SortKey,
  sortAsc: boolean,
) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["objects", folder],
    queryFn: () => api.objects(folder),
  });
  const { data: rootListing } = useQuery({
    queryKey: ["objects", ""],
    queryFn: () => api.objects(""),
  });

  const invalidate = useCallback(() => qc.invalidateQueries({ queryKey: ["objects"] }), [qc]);

  const visible = useMemo(() => {
    const objects = sortObjects(data?.objects ?? [], sortKey, sortAsc);
    if (!filter) return objects;
    const query = filter.toLowerCase();
    return objects.filter((o) => basename(o.key).toLowerCase().includes(query));
  }, [data, filter, sortKey, sortAsc]);

  return {
    visible,
    isLoading,
    folders: data?.folders ?? [],
    rootFolders: rootListing?.folders ?? [],
    invalidate,
  };
}

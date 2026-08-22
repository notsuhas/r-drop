// Delete and rename/move mutations; onSettled refetches every listing.
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useObjectMutations(invalidate: () => void, onDone: () => void) {
  const remove = useMutation({
    mutationFn: async (keys: string[]) => {
      for (const key of keys) await api.deleteObject(key);
    },
    onSuccess: onDone,
    onSettled: invalidate,
  });

  const rename = useMutation({
    mutationFn: (input: { key: string; newKey: string }) =>
      api.renameObject(input.key, input.newKey),
    onSuccess: onDone,
    onSettled: invalidate,
  });

  return { remove, rename };
}

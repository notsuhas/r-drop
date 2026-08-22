// The CDN origin behind every asset. Cached indefinitely — it is deploy-time config.
import { useQuery } from "@tanstack/react-query";
import { getConfig } from "@/lib/config";

export function usePublicBase() {
  const { data } = useQuery({
    queryKey: ["config"],
    queryFn: getConfig,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
  return data?.publicBase ?? "";
}

/** Host portion of the CDN base, for display in the path bar. */
export const hostOf = (base: string) => {
  if (!base) return "";
  try {
    return new URL(base).host;
  } catch {
    return base.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
};

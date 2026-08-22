// The current folder lives in the URL (/f/<folder>) so folders are deep-linkable.
import { useCallback } from "react";
import { useLocation } from "wouter";

export function useFolderRoute(onNavigate: () => void) {
  const [location, navigate] = useLocation();
  const folder = location.startsWith("/f/") ? decodeURIComponent(location.slice(3)) : "";
  const uploadTarget = folder || "scratch";

  const enterFolder = useCallback(
    (target: string) => {
      navigate(target ? `/f/${encodeURIComponent(target)}` : "/");
      onNavigate();
    },
    [navigate, onNavigate],
  );

  return { folder, uploadTarget, enterFolder };
}

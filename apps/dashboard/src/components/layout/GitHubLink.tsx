import { ArrowUpRight } from "lucide-react";
import { cx } from "@/lib/cx";

/** Upstream project, not the deployed instance — a fork pointing here is fine. */
const REPO_URL = "https://github.com/notsuhas/r-drop";

/** lucide dropped brand icons in v1, so the GitHub mark is inlined rather than
 *  approximated with a generic git glyph. */
function GitHubMark(props: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

interface IGitHubLink {
  /** Rail mode: mark only, matching the collapsed nav items. */
  collapsed?: boolean;
  /** Closes the mobile sheet, which would otherwise linger over the new tab. */
  onNavigate?: () => void;
}

export default function GitHubLink(props: IGitHubLink) {
  const { collapsed, onNavigate } = props;
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      title={collapsed ? "View on GitHub" : undefined}
      aria-label="View on GitHub (opens in a new tab)"
      className={cx(
        "flex h-9 items-center gap-2.5 rounded-md text-sm font-medium text-ink-2",
        "transition-colors duration-(--duration-fast) ease-(--ease-out-quart)",
        "hover:bg-surface-2/60 hover:text-ink",
        collapsed ? "justify-center px-0" : "px-2.5",
      )}
    >
      <GitHubMark className="h-4 w-4 shrink-0 text-ink-3" />
      {!collapsed && (
        <>
          View on GitHub
          <ArrowUpRight size={13} className="ml-auto shrink-0 text-ink-3" />
        </>
      )}
    </a>
  );
}

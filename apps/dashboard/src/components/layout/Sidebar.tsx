import { FolderOpen, KeyRound, Mail, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import BrandMark from "@/components/auth/BrandMark";
import GitHubLink from "@/components/layout/GitHubLink";
import UserChip from "@/components/layout/UserChip";
import IconButton from "@/components/ui/IconButton";
import { cx } from "@/lib/cx";

interface ISidebarUser {
  name?: string;
  email?: string;
  picture?: string | null;
}

interface ISidebar {
  isAdmin: boolean;
  user: ISidebarUser;
  /** Mobile sheet visibility; the desktop sidebar ignores it. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface ITab {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

function useTabs(isAdmin: boolean): ITab[] {
  const [location] = useLocation();
  return [
    {
      href: "/",
      label: "Files",
      icon: <FolderOpen size={16} />,
      active: location === "/" || location.startsWith("/f/"),
    },
    {
      href: "/tokens",
      label: "API tokens",
      icon: <KeyRound size={16} />,
      active: location === "/tokens",
    },
    ...(isAdmin
      ? [
          {
            href: "/invites",
            label: "People",
            icon: <Mail size={16} />,
            active: location === "/invites",
          },
        ]
      : []),
  ];
}

/** Shared nav body. `collapsed` renders the icon rail used at medium widths. */
function SidebarBody(props: {
  tabs: ITab[];
  user: ISidebarUser;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { tabs, user, collapsed, onNavigate } = props;
  return (
    <>
      <div className={cx("flex h-14 shrink-0 items-center", collapsed ? "justify-center" : "px-4")}>
        <Link href="/" onClick={onNavigate} aria-label="r-drop home">
          {collapsed ? <BrandMark glyphOnly /> : <BrandMark />}
        </Link>
      </div>

      <nav className={cx("flex flex-col gap-0.5", collapsed ? "px-2" : "px-2")}>
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            onClick={onNavigate}
            aria-current={t.active ? "page" : undefined}
            title={collapsed ? t.label : undefined}
            className={cx(
              "flex h-9 items-center gap-2.5 rounded-md text-sm font-medium",
              "transition-colors duration-(--duration-fast) ease-(--ease-out-quart)",
              collapsed ? "justify-center px-0" : "px-2.5",
              t.active
                ? "bg-surface-2 text-ink"
                : "text-ink-2 hover:bg-surface-2/60 hover:text-ink",
            )}
          >
            <span className={t.active ? "text-accent-text" : "text-ink-3"}>{t.icon}</span>
            {!collapsed && t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-2">
        <GitHubLink collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-hairline p-2">
        <UserChip {...user} collapsed={collapsed} />
      </div>
    </>
  );
}

export default function Sidebar(props: ISidebar) {
  const { isAdmin, user, mobileOpen, onCloseMobile } = props;
  const tabs = useTabs(isAdmin);

  return (
    <>
      {/* Icon rail at medium widths, full sidebar from lg up. Hidden on mobile,
          where the sheet below takes over. */}
      <aside className="hidden shrink-0 flex-col border-r border-hairline bg-surface md:flex md:w-14 lg:w-60">
        <div className="flex flex-1 flex-col lg:hidden">
          <SidebarBody tabs={tabs} user={user} collapsed />
        </div>
        <div className="hidden flex-1 flex-col lg:flex">
          <SidebarBody tabs={tabs} user={user} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseMobile}
            className="animate-fade-in fixed inset-0 z-(--z-index-backdrop) bg-bg/70 backdrop-blur-sm"
          />
          <aside className="animate-slide-in fixed inset-y-0 left-0 z-(--z-index-modal) flex w-64 flex-col bg-surface shadow-e4">
            <div className="absolute right-2 top-3">
              <IconButton label="Close navigation" onClick={onCloseMobile}>
                <X size={16} />
              </IconButton>
            </div>
            <SidebarBody tabs={tabs} user={user} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}

import { LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import BrandMark from "@/components/auth/BrandMark";

interface ISidebarUser {
  name?: string;
  email?: string;
  picture?: string | null;
}

interface ISidebar {
  isAdmin: boolean;
  user: ISidebarUser;
}

export default function Sidebar(props: ISidebar) {
  const { isAdmin, user } = props;
  const [location] = useLocation();

  const tabs = [
    { href: "/", label: "Files", active: location === "/" || location.startsWith("/f/") },
    { href: "/tokens", label: "API tokens", active: location === "/tokens" },
    ...(isAdmin ? [{ href: "/invites", label: "Invites", active: location === "/invites" }] : []),
  ];

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-panel">
      <Link href="/" className="px-5 py-6">
        <BrandMark />
      </Link>
      <nav className="flex flex-col gap-1 px-3">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-2 text-left font-display text-sm transition-colors ${
              t.active ? "bg-panel-2 font-semibold text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-line p-4">
        <div className="flex items-center gap-2.5">
          {user.picture && (
            <img
              src={user.picture}
              alt=""
              className="h-7 w-7 rounded-none"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{user.name ?? user.email}</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/api/auth/logout";
              }}
              className="text-xs text-muted hover:text-ink"
            >
              <span className="inline-flex items-center gap-1">
                <LogOut size={11} /> Sign out
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

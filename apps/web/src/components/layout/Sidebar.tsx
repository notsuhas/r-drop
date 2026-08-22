import { LogOut } from "lucide-react";

interface ISidebarUser {
  name?: string;
  email?: string;
  picture?: string | null;
}

interface ISidebar {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  user: ISidebarUser;
}

export default function Sidebar(props: ISidebar) {
  const { tabs, activeTab, onSelectTab, user } = props;
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-panel">
      <div className="px-5 py-6 font-display text-lg font-bold tracking-tight">
        ho<span className="text-honey">·</span>drive
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTab(t.id)}
            className={` rounded-none px-3 py-2 text-left font-display text-sm transition-colors ${
              activeTab === t.id ? "bg-panel-2 font-semibold text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
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

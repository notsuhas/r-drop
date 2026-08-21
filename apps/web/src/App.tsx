import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "./lib/api";
import { signOut, useSession } from "./lib/auth";
import Files from "./pages/Files";
import Invites from "./pages/Invites";
import Login from "./pages/Login";
import Tokens from "./pages/Tokens";

type Tab = "files" | "invites" | "tokens";

export default function App() {
  const { data: session, isPending } = useSession();
  const [tab, setTab] = useState<Tab>("files");
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    enabled: !!session,
  });

  if (isPending)
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  if (!session) return <Login />;

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: "files", label: "Files" },
    { id: "tokens", label: "API tokens" },
    { id: "invites", label: "Invites", adminOnly: true },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-panel">
        <div className="px-5 py-6 font-display text-lg font-bold tracking-tight">
          ho<span className="text-honey">·</span>drops
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {tabs
            .filter((t) => !t.adminOnly || me?.isAdmin)
            .map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-2 text-left font-display text-sm transition-colors ${
                  tab === t.id ? "bg-panel-2 font-semibold text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
        </nav>
        <div className="mt-auto border-t border-line p-4">
          <div className="flex items-center gap-2.5">
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="h-7 w-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{session.user.name}</p>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-xs text-muted hover:text-ink"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        {tab === "files" && <Files />}
        {tab === "invites" && <Invites />}
        {tab === "tokens" && <Tokens />}
      </main>
    </div>
  );
}

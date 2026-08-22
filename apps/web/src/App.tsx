import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import { api } from "./lib/api";
import Files from "./pages/Files";
import Invites from "./pages/Invites";
import Login from "./pages/Login";
import Tokens from "./pages/Tokens";

type Tab = "files" | "invites" | "tokens";

export default function App() {
  const [tab, setTab] = useState<Tab>("files");
  const {
    data: me,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isPending)
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  if (isError || !me) return <Login />;

  const tabs = [
    { id: "files", label: "Files" },
    { id: "tokens", label: "API tokens" },
    ...(me.isAdmin ? [{ id: "invites", label: "Invites" }] : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        tabs={tabs}
        activeTab={tab}
        onSelectTab={(id) => setTab(id as Tab)}
        user={me.actor}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {tab === "files" && <Files />}
        {tab === "invites" && <Invites />}
        {tab === "tokens" && <Tokens />}
      </main>
    </div>
  );
}

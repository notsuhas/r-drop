import { useQuery } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import Sidebar from "./components/layout/Sidebar";
import { api } from "./lib/api";
import Files from "./pages/Files";
import Invites from "./pages/Invites";
import Login from "./pages/Login";
import Tokens from "./pages/Tokens";

export default function App() {
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isAdmin={me.isAdmin} user={me.actor} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Switch>
          <Route path="/tokens" component={Tokens} />
          {me.isAdmin && <Route path="/invites" component={Invites} />}
          <Route component={Files} />
        </Switch>
      </main>
    </div>
  );
}

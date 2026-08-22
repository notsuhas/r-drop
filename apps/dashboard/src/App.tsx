import { useQuery } from "@tanstack/react-query";
import { Menu as MenuIcon } from "lucide-react";
import { useState } from "react";
import { Route, Switch } from "wouter";
import BrandMark from "@/components/auth/BrandMark";
import Sidebar from "@/components/layout/Sidebar";
import IconButton from "@/components/ui/IconButton";
import Toaster from "@/components/ui/Toaster";
import { ToastProvider } from "@/hooks/useToast";
import { api } from "@/lib/api";
import Files from "@/pages/Files";
import Invites from "@/pages/Invites";
import Login from "@/pages/Login";
import Tokens from "@/pages/Tokens";

function BootScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <BrandMark size="lg" />
      <p className="text-sm text-ink-3">Checking your session…</p>
    </div>
  );
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
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

  if (isPending) return <BootScreen />;
  if (isError || !me || me.actor.type !== "user") return <Login />;

  return (
    <ToastProvider>
      <div className="flex h-dvh overflow-hidden">
        <Sidebar
          isAdmin={me.isAdmin}
          user={me.actor}
          mobileOpen={navOpen}
          onCloseMobile={() => setNavOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile-only chrome: the sidebar is off-canvas below md. */}
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-hairline bg-surface px-2 md:hidden">
            <IconButton label="Open navigation" onClick={() => setNavOpen(true)}>
              <MenuIcon size={18} />
            </IconButton>
            <BrandMark size="sm" />
          </div>
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Switch>
              <Route path="/tokens" component={Tokens} />
              {me.isAdmin && <Route path="/invites" component={Invites} />}
              <Route component={Files} />
            </Switch>
          </main>
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  );
}

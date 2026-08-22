import { LogOut } from "lucide-react";
import { api } from "@/lib/api";

export default function SignOutButton() {
  const signOut = async () => {
    const { logoutUrl } = await api.logout().catch(() => ({ logoutUrl: null }));
    window.location.href = logoutUrl ?? "/";
  };

  return (
    <button type="button" onClick={signOut} className="text-xs text-muted hover:text-ink">
      <span className="inline-flex items-center gap-1">
        <LogOut size={11} /> Sign out
      </span>
    </button>
  );
}

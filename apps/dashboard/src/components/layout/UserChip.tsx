import { LogOut, User } from "lucide-react";
import { useCallback } from "react";
import Menu from "@/components/ui/Menu";
import { useMenu } from "@/hooks/useMenu";
import { api } from "@/lib/api";
import { cx } from "@/lib/cx";

interface IUserChip {
  name?: string;
  email?: string;
  picture?: string | null;
  /** Rail mode: avatar only. */
  collapsed?: boolean;
}

function Avatar(props: { picture?: string | null }) {
  if (props.picture)
    return (
      <img
        src={props.picture}
        alt=""
        referrerPolicy="no-referrer"
        className="h-7 w-7 shrink-0 rounded-full object-cover"
      />
    );
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink-3">
      <User size={14} />
    </span>
  );
}

export default function UserChip(props: IUserChip) {
  const { name, email, picture, collapsed } = props;
  const menu = useMenu();

  const signOut = useCallback(async () => {
    const { logoutUrl } = await api.logout().catch(() => ({ logoutUrl: null }));
    window.location.href = logoutUrl ?? "/";
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={menu.openBelow}
        aria-haspopup
        aria-expanded={menu.open}
        aria-label={`Account: ${name ?? email ?? "signed in"}`}
        className={cx(
          "flex w-full items-center gap-2.5 rounded-md text-left transition-colors duration-(--duration-fast)",
          "hover:bg-surface-2",
          collapsed ? "justify-center p-1" : "p-1.5",
        )}
      >
        <Avatar picture={picture} />
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{name ?? email}</span>
            {name && email && (
              <span className="block truncate font-mono text-2xs text-ink-3">{email}</span>
            )}
          </span>
        )}
      </button>
      {menu.anchor && (
        <Menu
          label="Account"
          anchor={menu.anchor}
          onClose={menu.close}
          groups={[
            {
              label: email,
              items: [
                {
                  id: "signout",
                  label: "Sign out",
                  icon: <LogOut size={14} />,
                  onSelect: () => void signOut(),
                },
              ],
            },
          ]}
        />
      )}
    </>
  );
}

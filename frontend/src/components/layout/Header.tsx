import {
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";

interface HeaderProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export function Header({
  mobileMenuOpen,
  onToggleMobileMenu,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();

      success("You have been logged out successfully.");
      navigate("/login", { replace: true });
    } catch (err) {
      error(
        err instanceof Error
          ? err.message
          : "Failed to log out.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
          aria-label={
            mobileMenuOpen
              ? "Close navigation"
              : "Open navigation"
          }
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            ReachInbox Workspace
          </p>

          <p className="truncate text-xs text-slate-500">
            Manage your email campaigns
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden max-w-56 text-right sm:block">
          <p className="truncate text-sm font-medium text-slate-200">
            {user?.name ?? "User"}
          </p>

          <p className="truncate text-xs text-slate-500">
            {user?.email ?? ""}
          </p>
        </div>

        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white ring-1 ring-slate-700">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          title="Logout"
          aria-label="Logout"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut
            size={16}
            className={loggingOut ? "animate-pulse" : ""}
          />

          <span className="hidden sm:inline">
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}
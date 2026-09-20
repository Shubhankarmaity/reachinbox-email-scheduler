import {
  CalendarClock,
  LayoutDashboard,
  Mail,
  Search,
  Send,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Scheduled",
    to: "/scheduled",
    icon: CalendarClock,
  },
  {
    label: "Sent",
    to: "/sent",
    icon: Send,
  },
  {
    label: "Compose",
    to: "/compose",
    icon: Mail,
  },
  {
    label: "Senders",
    to: "/senders",
    icon: Users,
  },
  {
    label: "Search",
    to: "/search",
    icon: Search,
  },
  {
    label: "Integrations",
    to: "/integrations",
    icon: Settings,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950">
      <div className="flex h-16 items-center border-b border-slate-800 px-5">
        <div>
          <div className="text-lg font-semibold tracking-tight text-white">
            ReachInbox
          </div>

          <div className="text-xs text-slate-500">
            Email Campaigns
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="rounded-xl bg-slate-900/70 px-3 py-3">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white ring-1 ring-slate-700">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">
                {user?.name ?? "User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email ?? ""}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-3">
            <p className="text-xs text-slate-500">
              Workspace
            </p>

            <p className="mt-1 text-sm font-medium text-slate-200">
              ReachInbox
            </p>

            <p className="mt-0.5 text-xs text-slate-600">
              Email scheduling platform
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
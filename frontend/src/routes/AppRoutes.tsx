import { CalendarClock, Mail, Search, Send, Users } from "lucide-react";
import ComposePage from "../pages/ComposePage";
import ScheduledPage from "../pages/ScheduledPage";
import SentPage from "../pages/SentPage";
import SearchPage from "../pages/SearchPage";
import IntegrationsPage from "../pages/IntegrationsPage";
import NotFoundPage from "../pages/NotFoundPage";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import SendersPage from "../pages/SendersPage";
import { useAuth } from "../context/AuthContext";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

function LoginPage() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-slate-950">
            R
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome to ReachInbox
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Schedule email campaigns, monitor delivery, and
            manage your senders from one workspace.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M21.35 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h5.24a4.48 4.48 0 01-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.19 2.91-7.42z"
                fill="#4285F4"
              />
              <path
                d="M12 21.73c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.71-5.46-4.01H3.3v2.53A9.74 9.74 0 0012 21.73z"
                fill="#34A853"
              />
              <path
                d="M6.54 13.84A5.85 5.85 0 016.23 12c0-.64.11-1.26.31-1.84V7.63H3.3A9.73 9.73 0 002.27 12c0 1.57.38 3.05 1.03 4.37l3.24-2.53z"
                fill="#FBBC04"
              />
              <path
                d="M12 6.15c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.23 14.63 2.27 12 2.27a9.74 9.74 0 00-8.7 5.36l3.24 2.53C7.31 7.86 9.46 6.15 12 6.15z"
                fill="#EA4335"
              />
            </svg>

            Continue with Google
          </button>

          <p className="mt-5 text-center text-xs text-slate-500">
            Secure authentication powered by Google OAuth.
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const cards = [
    {
      title: "Scheduled",
      value: "—",
      icon: CalendarClock,
    },
    {
      title: "Sent",
      value: "—",
      icon: Send,
    },
    {
      title: "Senders",
      value: "—",
      icon: Users,
    },
    {
      title: "Search",
      value: "Ready",
      icon: Search,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Your email campaign workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  {card.title}
                </span>

                <Icon className="h-5 w-5 text-slate-500" />
              </div>

              <p className="text-2xl font-semibold">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-slate-600" />

        <h3 className="mt-4 text-base font-medium">
          Your workspace is ready
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          Compose your first campaign once sender configuration
          and email scheduling screens are connected.
        </p>
      </div>
    </div>
  );
}

function PlaceholderPage({
  title,
}: {
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">
        This section will be implemented in the next frontend
        batches.
      </p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/scheduled"
            element={<ScheduledPage />}
          />

          <Route
            path="/sent"
            element={<SentPage />}
          />

          <Route
            path="/compose"
            element={<ComposePage />}
          />

          <Route
            path="/senders"
            element={<SendersPage />}
          />

          <Route
            path="/search"
            element={<SearchPage />}
          />

          <Route
            path="/integrations"
            element={<IntegrationsPage />}
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}
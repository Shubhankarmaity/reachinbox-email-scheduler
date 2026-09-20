import {
  CheckCircle2,
  Plug,
  RefreshCw,
} from "lucide-react";
import { useEffect } from "react";

import { GoogleAccountCard } from "../components/integrations/GoogleAccountCard";
import { SlackCard } from "../components/integrations/SlackCard";
import { useAuth } from "../context/AuthContext";
import { useSlack } from "../hooks/useSlack";

export default function IntegrationsPage() {
  const { user, refreshUser } = useAuth();

  const {
    connected,
    teamName,
    loading,
    error,
    connect,
    disconnect,
    refresh,
  } = useSlack();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    if (params.get("slack") === "connected") {
      void refresh();
    }

    if (params.has("slack")) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
      );
    }
  }, [refresh]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <Plug className="h-5 w-5 text-slate-400" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Integrations
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Manage the services connected to your
                ReachInbox workspace.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void Promise.all([
              refresh(),
              refreshUser(),
            ]);
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              loading ? "animate-spin" : "",
            ].join(" ")}
          />

          Refresh
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-900/40 bg-emerald-950/10 px-4 py-3 text-sm text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />

        <span>
          Integrations are managed securely through OAuth.
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GoogleAccountCard user={user} />

        <SlackCard
          connected={connected}
          teamName={teamName}
          loading={loading}
          error={error}
          onConnect={connect}
          onDisconnect={disconnect}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
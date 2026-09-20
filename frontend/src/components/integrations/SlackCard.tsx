import {
  CheckCircle2,
  Link2,
  Loader2,
  MessageSquare,
  RefreshCw,
  Unplug,
} from "lucide-react";

interface SlackCardProps {
  connected: boolean;
  teamName: string | null;
  loading: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function SlackCard({
  connected,
  teamName,
  loading,
  error,
  onConnect,
  onDisconnect,
  onRefresh,
}: SlackCardProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Slack
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Receive rate-limit notifications in Slack.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <MessageSquare className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {connected ? (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Connected
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {teamName
                    ? `${teamName} workspace`
                    : "Slack workspace connected"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  void onRefresh();
                }}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  className={[
                    "h-4 w-4",
                    loading ? "animate-spin" : "",
                  ].join(" ")}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => {
                  void onDisconnect();
                }}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-900/50 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/30 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unplug className="h-4 w-4" />
                )}

                Disconnect
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-start gap-3">
                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Connect Slack
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Connect your Slack workspace to receive
                    notifications when sender rate limits
                    are reached.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onConnect}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}

                Connect Slack
              </button>

              <button
                type="button"
                onClick={() => {
                  void onRefresh();
                }}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
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
          </>
        )}
      </div>
    </section>
  );
}
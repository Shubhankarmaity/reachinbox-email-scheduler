import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ErrorState } from "../components/common/ErrorState";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { QueueStatus } from "../components/dashboard/QueueStatus";
import { RecentEmails } from "../components/dashboard/RecentEmails";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    scheduledCount,
    sentCount,
    failedCount,
    senderCount,
    recentEmails,
    activeSenders,
    loading,
    error,
    refresh,
  } = useDashboard();

  useEffect(() => {
    const slackStatus = searchParams.get("slack");

    if (slackStatus === "connected" || slackStatus === "error") {
      navigate(`/integrations?slack=${slackStatus}`, {
        replace: true,
      });
    }
  }, [navigate, searchParams]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load dashboard"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Monitor your campaigns, scheduled emails, senders, and queue
            activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <DashboardStats
        scheduled={scheduledCount}
        sent={sentCount}
        senders={senderCount}
        failed={failedCount}
        loading={loading}
      />

      <QueueStatus
        scheduled={scheduledCount}
        queued={0}
        processing={0}
        failed={failedCount}
      />

      <RecentEmails emails={recentEmails} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate("/compose")}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
        >
          <h3 className="font-semibold text-white">Compose Email</h3>

          <p className="mt-1 text-sm text-slate-400">
            Create a campaign and schedule emails for delivery.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/scheduled")}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
        >
          <h3 className="font-semibold text-white">
            Scheduled Emails
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            View emails waiting to be processed by BullMQ.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/search")}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
        >
          <h3 className="font-semibold text-white">Search Emails</h3>

          <p className="mt-1 text-sm text-slate-400">
            Search indexed email data using Elasticsearch.
          </p>
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-sm text-slate-400">
          Active senders:{" "}
          <span className="font-medium text-slate-200">
            {activeSenders.length}
          </span>
        </p>
      </div>
    </div>
  );
}
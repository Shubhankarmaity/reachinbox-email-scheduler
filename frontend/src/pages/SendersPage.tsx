import { Plus, RefreshCw, Users } from "lucide-react";
import { useState } from "react";

import { SenderForm } from "../components/sender/SenderForm";
import { SenderList } from "../components/sender/SenderList";
import { useSenders } from "../hooks/useSenders";
import { senderApi } from "../lib/api";
import { Sender } from "../types";

export default function SendersPage() {
  const {
    senders,
    loading,
    error,
    refresh,
  } = useSenders();

  const [showForm, setShowForm] = useState(false);
  const [updatingSenderId, setUpdatingSenderId] =
    useState<string | null>(null);

  const handleCreated = async () => {
    setShowForm(false);
    await refresh();
  };

  const handleToggleStatus = async (
    sender: Sender,
  ) => {
    setUpdatingSenderId(sender.id);

    try {
      const response =
        await senderApi.updateStatus(
          sender.id,
          !sender.isActive,
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.error?.message ||
            "Failed to update sender status.",
        );
      }

      await refresh();
    } catch (err) {
      console.error(
        err instanceof Error
          ? err.message
          : "Failed to update sender status.",
      );
    } finally {
      setUpdatingSenderId(null);
    }
  };

  const activeCount = senders.filter(
    (sender) => sender.isActive,
  ).length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <Users className="h-5 w-5 text-slate-400" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Senders
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Manage SMTP accounts used by your campaigns.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span>
              Total:{" "}
              <strong className="text-slate-300">
                {senders.length}
              </strong>
            </span>

            <span>
              Active:{" "}
              <strong className="text-emerald-400">
                {activeCount}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              void refresh();
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

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Add Sender
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <SenderForm
            onCreated={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <SenderList
        senders={senders}
        loading={loading}
        error={error}
        updatingSenderId={updatingSenderId}
        onRefresh={refresh}
        onToggleStatus={handleToggleStatus}
        onAdd={() => setShowForm(true)}
      />
    </div>
  );
}
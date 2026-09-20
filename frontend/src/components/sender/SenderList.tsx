import {
  AlertCircle,
  Mail,
  RefreshCw,
  Server,
  User,
} from "lucide-react";

import { Sender } from "../../types";
import { SenderStatusToggle } from "./SenderStatusToggle";

interface SenderListProps {
  senders: Sender[];
  loading: boolean;
  error: string | null;
  updatingSenderId: string | null;
  onRefresh: () => Promise<void>;
  onToggleStatus: (sender: Sender) => Promise<void>;
  onAdd: () => void;
}

export function SenderList({
  senders,
  loading,
  error,
  updatingSenderId,
  onRefresh,
  onToggleStatus,
  onAdd,
}: SenderListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-400" />

        <h3 className="mt-4 text-sm font-semibold text-red-300">
          Unable to load senders
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-red-400/80">
          {error}
        </p>

        <button
          type="button"
          onClick={() => {
            void onRefresh();
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-900/60 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-950/40"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  if (senders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
        <Mail className="mx-auto h-9 w-9 text-slate-700" />

        <h3 className="mt-4 text-base font-semibold text-white">
          No senders configured
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Add an SMTP sender to start scheduling email
          campaigns.
        </p>

        <button
          type="button"
          onClick={onAdd}
          className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Add your first sender
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {senders.map((sender) => {
        const updating =
          updatingSenderId === sender.id;

        return (
          <article
            key={sender.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {sender.displayName}
                  </h3>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {sender.email}
                  </p>
                </div>
              </div>

              <SenderStatusToggle
                isActive={sender.isActive}
                loading={updating}
                onToggle={() => {
                  void onToggleStatus(sender);
                }}
              />
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-500">
                  <Server className="h-3.5 w-3.5" />
                  SMTP
                </span>

                <span className="max-w-[65%] truncate text-slate-300">
                  {sender.smtpHost}:{sender.smtpPort}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-500">
                  <User className="h-3.5 w-3.5" />
                  Username
                </span>

                <span className="max-w-[65%] truncate text-slate-300">
                  {sender.smtpUsername}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Created
                </span>

                <span className="text-slate-500">
                  {new Date(
                    sender.createdAt,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
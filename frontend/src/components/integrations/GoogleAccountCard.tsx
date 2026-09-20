import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { User } from "../../types";

interface GoogleAccountCardProps {
  user: User | null;
}

export function GoogleAccountCard({
  user,
}: GoogleAccountCardProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Google Account
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Account used for authentication.
            </p>
          </div>

          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-700"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() ??
                "U"}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">
              {user?.name || "Google User"}
            </p>

            <p className="mt-1 truncate text-sm text-slate-400">
              {user?.email || "No email available"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-950/60 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

            <div>
              <p className="text-sm font-medium text-slate-300">
                Authentication connected
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Your Google account is being used to
                securely authenticate your ReachInbox
                workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Connected
        </div>

        <a
          href="https://myaccount.google.com/"
          target="_blank"
          rel="noreferrer"
          className="ml-4 inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-white"
        >
          Manage Google Account
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
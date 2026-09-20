import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  XCircle,
} from "lucide-react";

import { Email } from "../../types";

interface RecentEmailsProps {
  emails: Email[];
  loading?: boolean;
}

function statusConfig(status: Email["status"]) {
  switch (status) {
    case "SENT":
      return {
        label: "Sent",
        icon: CheckCircle2,
        className:
          "bg-emerald-500/10 text-emerald-400",
      };

    case "FAILED":
      return {
        label: "Failed",
        icon: XCircle,
        className: "bg-red-500/10 text-red-400",
      };

    case "SCHEDULED":
    case "QUEUED":
    case "RATE_LIMITED":
      return {
        label:
          status === "RATE_LIMITED"
            ? "Rate limited"
            : "Scheduled",
        icon: CalendarClock,
        className:
          "bg-amber-500/10 text-amber-400",
      };

    case "PROCESSING":
      return {
        label: "Processing",
        icon: Clock3,
        className: "bg-blue-500/10 text-blue-400",
      };

    default:
      return {
        label: status,
        icon: Clock3,
        className: "bg-slate-800 text-slate-400",
      };
  }
}

export function RecentEmails({
  emails,
  loading = false,
}: RecentEmailsProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Recent Emails
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Latest scheduled and sent activity
          </p>
        </div>

        <Mail className="h-5 w-5 text-slate-600" />
      </div>

      <div className="p-2">
        {loading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-slate-800/70"
              />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Mail className="mx-auto h-8 w-8 text-slate-700" />

            <p className="mt-3 text-sm text-slate-400">
              No email activity yet.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {emails.map((email) => {
              const config = statusConfig(email.status);
              const Icon = config.icon;

              return (
                <div
                  key={email.id}
                  className="flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-slate-800/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {email.subject}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {email.recipient}
                    </p>
                  </div>

                  <div
                    className={[
                      "hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:flex",
                      config.className,
                    ].join(" ")}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
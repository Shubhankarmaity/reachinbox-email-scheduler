import {
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";

import { Email } from "../../types";
import { EmailStatusBadge } from "./EmailStatusBadge";

interface EmailTableProps {
  emails: Email[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelect: (email: Email) => void;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

export function EmailTable({
  emails,
  loading,
  page,
  totalPages,
  onPageChange,
  onSelect,
}: EmailTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="space-y-3 p-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-slate-800/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
        <Mail className="mx-auto h-9 w-9 text-slate-700" />

        <h3 className="mt-4 text-base font-semibold text-white">
          No scheduled emails
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Scheduled campaigns will appear here once you
          create them from the compose page.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead className="border-b border-slate-800 bg-slate-950/50">
            <tr>
              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                Recipient
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                Subject
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                Scheduled
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {emails.map((email) => (
              <tr
                key={email.id}
                className="transition hover:bg-slate-800/30"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>

                    <span className="max-w-[220px] truncate text-sm text-slate-300">
                      {email.recipient}
                    </span>
                  </div>
                </td>

                <td className="max-w-[250px] px-5 py-4">
                  <span className="block truncate text-sm font-medium text-slate-200">
                    {email.subject}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-slate-400">
                  {formatDate(email.scheduledAt)}
                </td>

                <td className="px-5 py-4">
                  <EmailStatusBadge status={email.status} />
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect(email)}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                onPageChange(page - 1)
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                onPageChange(page + 1)
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
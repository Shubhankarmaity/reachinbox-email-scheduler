import {
  CalendarClock,
  Clock3,
  Mail,
  X,
} from "lucide-react";

import { Email } from "../../types";
import { EmailStatusBadge } from "./EmailStatusBadge";

interface EmailDetailsModalProps {
  email: Email | null;
  onClose: () => void;
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

export function EmailDetailsModal({
  email,
  onClose,
}: EmailDetailsModalProps) {
  if (!email) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />

              <h2 className="text-base font-semibold text-white">
                Email details
              </h2>
            </div>

            <p className="mt-1 max-w-lg truncate text-xs text-slate-500">
              {email.recipient}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close email details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
          <div className="flex flex-wrap items-center gap-3">
            <EmailStatusBadge status={email.status} />

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              Attempt {email.attemptCount}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Recipient
              </p>

              <p className="mt-1 break-all text-sm text-slate-200">
                {email.recipient}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Subject
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {email.subject}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Schedule
              </p>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                <CalendarClock className="h-4 w-4 text-slate-500" />

                {formatDate(email.scheduledAt)}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Sent
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {formatDate(email.sentAt)}
              </p>
            </div>

            {email.lastError && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
                <p className="text-xs uppercase tracking-wider text-red-500">
                  Error
                </p>

                <p className="mt-1 text-sm leading-6 text-red-300">
                  {email.lastError}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Body
              </p>

              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-300">
                  {email.body}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
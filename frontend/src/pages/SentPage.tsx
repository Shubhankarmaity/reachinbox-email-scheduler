import {
  RefreshCw,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EmailDetailsModal } from "../components/email/EmailDetailsModal";
import { EmailTable } from "../components/email/EmailTable";
import { emailApi } from "../lib/api";
import { Email } from "../types";

interface SentResponse {
  success: boolean;
  data?: {
    items?: Email[];
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  };
  error?: {
    message?: string;
  };
}

function normalizeResponse(
  payload: SentResponse,
) {
  const data = payload.data ?? {};
  const pagination = data.pagination ?? {};

  return {
    items: data.items ?? [],
    page: data.page ?? pagination.page ?? 1,
    total: data.total ?? pagination.total ?? 0,
    totalPages:
      data.totalPages ??
      pagination.totalPages ??
      1,
  };
}

export default function SentPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] =
    useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [selectedEmail, setSelectedEmail] =
    useState<Email | null>(null);

  const loadEmails = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await emailApi.sent(
          targetPage,
          20,
        );

        const payload =
          response.data as SentResponse;

        if (!payload?.success) {
          throw new Error(
            payload?.error?.message ||
              "Failed to load sent emails.",
          );
        }

        const normalized =
          normalizeResponse(payload);

        setEmails(normalized.items);
        setPage(normalized.page);
        setTotal(normalized.total);
        setTotalPages(
          Math.max(1, normalized.totalPages),
        );
      } catch (err) {
        setEmails([]);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load sent emails.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadEmails(page);
  }, [loadEmails, page]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <Send className="h-5 w-5 text-slate-400" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Sent Emails
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View emails that have been processed by your
                campaigns.
              </p>
            </div>
          </div>

          {!loading && (
            <p className="mt-4 text-xs text-slate-500">
              {total} sent email
              {total === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            void loadEmails(page);
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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

      {error && (
        <div className="mb-5 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <EmailTable
        emails={emails}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSelect={setSelectedEmail}
      />

      <EmailDetailsModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </div>
  );
}
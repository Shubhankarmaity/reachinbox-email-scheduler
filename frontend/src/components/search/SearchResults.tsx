import { Mail, SearchX } from "lucide-react";

import { Email } from "../../types";
import { EmailStatusBadge } from "../email/EmailStatusBadge";

interface SearchResultsProps {
  results: Email[];
  loading: boolean;
  onSelect: (email: Email) => void;
}

export function SearchResults({
  results,
  loading,
  onSelect,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-slate-800/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
        <SearchX className="mx-auto h-9 w-9 text-slate-700" />

        <h3 className="mt-4 text-base font-semibold text-white">
          No results found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Try a different search term or change the
          filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-sm font-semibold text-white">
          Search Results
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {results.length} matching email
          {results.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="divide-y divide-slate-800">
        {results.map((email) => (
          <button
            key={email.id}
            type="button"
            onClick={() => onSelect(email)}
            className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-800/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800">
              <Mail className="h-4 w-4 text-slate-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-200">
                {email.subject}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {email.recipient}
              </p>

              <p className="mt-1 truncate text-xs text-slate-600">
                {email.body.replace(/<[^>]*>/g, "").slice(
                  0,
                  140,
                )}
              </p>
            </div>

            <div className="hidden shrink-0 sm:block">
              <EmailStatusBadge
                status={email.status}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
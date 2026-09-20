import {
  AlertCircle,
  RefreshCw,
  Search as SearchIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EmailDetailsModal } from "../components/email/EmailDetailsModal";
import { SearchBar } from "../components/search/SearchBar";
import { SearchFilters } from "../components/search/SearchFilters";
import { SearchResults } from "../components/search/SearchResults";
import { useSenders } from "../hooks/useSenders";
import { searchApi } from "../lib/api";
import {
  Email,
  SearchFilters as SearchFilterValues,
} from "../types";

function extractResults(payload: any): Email[] {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }

  if (Array.isArray(payload?.data?.hits)) {
    return payload.data.hits;
  }

  return [];
}

export default function SearchPage() {
  const {
    senders,
    loading: sendersLoading,
  } = useSenders();

  const [query, setQuery] = useState("");
  const [filters, setFilters] =
    useState<SearchFilterValues>({});

  const [results, setResults] = useState<Email[]>(
    [],
  );

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const [selectedEmail, setSelectedEmail] =
    useState<Email | null>(null);

  const resetFilters = () => {
    setQuery("");
    setFilters({});
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const performSearch = useCallback(async () => {
    const trimmedQuery = query.trim();

    if (
      !trimmedQuery &&
      !filters.status &&
      !filters.senderId &&
      !filters.campaignId &&
      !filters.from &&
      !filters.to
    ) {
      setError(
        "Enter a search term or select at least one filter.",
      );
      setResults([]);
      setHasSearched(false);
      return;
    }

    if (
      filters.from &&
      filters.to &&
      new Date(filters.from).getTime() >
        new Date(filters.to).getTime()
    ) {
      setError(
        "The From date must be earlier than the To date.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchApi.emails({
        query: trimmedQuery || undefined,
        status: filters.status,
        senderId: filters.senderId,
        campaignId: filters.campaignId,
        from: filters.from
          ? new Date(filters.from).toISOString()
          : undefined,
        to: filters.to
          ? new Date(filters.to).toISOString()
          : undefined,
      });

      const payload = response.data;

      if (!payload?.success) {
        throw new Error(
          payload?.error?.message ||
            "Search request failed.",
        );
      }

      setResults(extractResults(payload));
    } catch (err) {
      setResults([]);
      setError(
        err instanceof Error
          ? err.message
          : "Search request failed.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query.trim()) {
        void performSearch();
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, performSearch]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Search Emails
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Search across recipients, subjects, message
              content, and email metadata.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => {
              void performSearch();
            }}
            loading={loading}
          />
        </section>

        <SearchFilters
          filters={filters}
          senders={senders}
          onChange={setFilters}
          onReset={resetFilters}
        />

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
            <SearchIcon className="mx-auto h-9 w-9 text-slate-700" />

            <h3 className="mt-4 text-base font-semibold text-white">
              Search your email history
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Enter a recipient, subject, or keyword and
              press Search.
            </p>
          </div>
        )}

        {hasSearched && (
          <SearchResults
            results={results}
            loading={loading || sendersLoading}
            onSelect={setSelectedEmail}
          />
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Searching Elasticsearch...
          </div>
        )}
      </div>

      <EmailDetailsModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </div>
  );
}
import { Filter, RotateCcw } from "lucide-react";

import {
  EmailStatus,
  SearchFilters as SearchFilterValues,
  Sender,
} from "../../types";

interface SearchFiltersProps {
  filters: SearchFilterValues;
  senders: Sender[];
  onChange: (filters: SearchFilterValues) => void;
  onReset: () => void;
}

const statuses: EmailStatus[] = [
  "SCHEDULED",
  "QUEUED",
  "PROCESSING",
  "SENT",
  "FAILED",
  "RATE_LIMITED",
];

export function SearchFilters({
  filters,
  senders,
  onChange,
  onReset,
}: SearchFiltersProps) {
  const update = (
    key: keyof SearchFilterValues,
    value: string,
  ) => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />

          <h3 className="text-sm font-semibold text-white">
            Filters
          </h3>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="search-status"
            className="mb-2 block text-xs font-medium text-slate-500"
          >
            Status
          </label>

          <select
            id="search-status"
            value={filters.status ?? ""}
            onChange={(event) =>
              update("status", event.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-slate-600"
          >
            <option value="">All statuses</option>

            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="search-sender"
            className="mb-2 block text-xs font-medium text-slate-500"
          >
            Sender
          </label>

          <select
            id="search-sender"
            value={filters.senderId ?? ""}
            onChange={(event) =>
              update(
                "senderId",
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-slate-600"
          >
            <option value="">All senders</option>

            {senders.map((sender) => (
              <option
                key={sender.id}
                value={sender.id}
              >
                {sender.displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="search-campaign"
            className="mb-2 block text-xs font-medium text-slate-500"
          >
            Campaign ID
          </label>

          <input
            id="search-campaign"
            type="text"
            value={filters.campaignId ?? ""}
            onChange={(event) =>
              update(
                "campaignId",
                event.target.value,
              )
            }
            placeholder="Campaign UUID"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-600"
          />
        </div>

        <div>
          <label
            htmlFor="search-from"
            className="mb-2 block text-xs font-medium text-slate-500"
          >
            From
          </label>

          <input
            id="search-from"
            type="datetime-local"
            value={filters.from ?? ""}
            onChange={(event) =>
              update("from", event.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-slate-600"
          />
        </div>

        <div>
          <label
            htmlFor="search-to"
            className="mb-2 block text-xs font-medium text-slate-500"
          >
            To
          </label>

          <input
            id="search-to"
            type="datetime-local"
            value={filters.to ?? ""}
            onChange={(event) =>
              update("to", event.target.value)
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-slate-600"
          />
        </div>
      </div>
    </section>
  );
}
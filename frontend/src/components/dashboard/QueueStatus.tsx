import { Activity, Clock3, ExternalLink, ListChecks } from "lucide-react";
import { BullBoardLink } from "./BullBoardLink";

interface QueueStatusProps {
  scheduled?: number;
  queued?: number;
  processing?: number;
  failed?: number;
}

function QueueCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Clock3;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>

        <div className="rounded-lg bg-slate-800 p-2.5 text-slate-300">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export function QueueStatus({
  scheduled = 0,
  queued = 0,
  processing = 0,
  failed = 0,
}: QueueStatusProps) {
  const totalActive = queued + processing;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={19} className="text-slate-300" />
            <h2 className="text-lg font-semibold text-white">
              Queue Status
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Current email processing state across the scheduler.
          </p>
        </div>

        <BullBoardLink />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QueueCard
          label="Scheduled"
          value={scheduled}
          icon={Clock3}
        />

        <QueueCard
          label="Queued"
          value={queued}
          icon={ListChecks}
        />

        <QueueCard
          label="Processing"
          value={processing}
          icon={Activity}
        />

        <QueueCard
          label="Failed"
          value={failed}
          icon={Activity}
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">
              Active queue jobs
            </p>
            <p className="text-xs text-slate-500">
              Jobs currently waiting or being processed by BullMQ.
            </p>
          </div>

          <div className="text-lg font-semibold text-white">
            {totalActive}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          BullMQ worker monitoring
        </div>

        <a
          href="/api/admin/queues"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
        >
          Open live queue
          <ExternalLink size={13} />
        </a>
      </div>
    </section>
  );
}
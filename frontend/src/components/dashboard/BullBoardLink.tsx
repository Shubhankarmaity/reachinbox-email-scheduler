import { ExternalLink } from "lucide-react";

export function BullBoardLink() {
  return (
    <a
      href="/api/admin/queues"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
    >
      <ExternalLink size={15} />
      Open BullMQ Dashboard
    </a>
  );
}
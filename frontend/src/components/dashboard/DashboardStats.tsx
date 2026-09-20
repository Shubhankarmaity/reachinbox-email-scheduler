import {
  AlertCircle,
  CalendarClock,
  Send,
  Users,
} from "lucide-react";

interface DashboardStatsProps {
  scheduled: number;
  sent: number;
  senders: number;
  failed: number;
  loading?: boolean;
}

const stats = [
  {
    key: "scheduled",
    label: "Scheduled",
    icon: CalendarClock,
  },
  {
    key: "sent",
    label: "Sent",
    icon: Send,
  },
  {
    key: "senders",
    label: "Senders",
    icon: Users,
  },
  {
    key: "failed",
    label: "Failed",
    icon: AlertCircle,
  },
] as const;

export function DashboardStats({
  scheduled,
  sent,
  senders,
  failed,
  loading = false,
}: DashboardStatsProps) {
  const values = {
    scheduled,
    sent,
    senders,
    failed,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.key}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {stat.label}
                </p>

                <div className="mt-3">
                  {loading ? (
                    <div className="h-8 w-16 animate-pulse rounded-md bg-slate-800" />
                  ) : (
                    <p className="text-2xl font-semibold text-white">
                      {values[stat.key]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                <Icon className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
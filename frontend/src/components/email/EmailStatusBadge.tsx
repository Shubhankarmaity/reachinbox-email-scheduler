import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  TimerReset,
  XCircle,
} from "lucide-react";

import { EmailStatus } from "../../types";

interface EmailStatusBadgeProps {
  status: EmailStatus;
}

const statusConfig: Record<
  EmailStatus,
  {
    label: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-amber-500/10 text-amber-400",
    icon: CalendarClock,
  },

  QUEUED: {
    label: "Queued",
    className: "bg-blue-500/10 text-blue-400",
    icon: Clock3,
  },

  PROCESSING: {
    label: "Processing",
    className: "bg-blue-500/10 text-blue-400",
    icon: Loader2,
  },

  SENT: {
    label: "Sent",
    className: "bg-emerald-500/10 text-emerald-400",
    icon: CheckCircle2,
  },

  FAILED: {
    label: "Failed",
    className: "bg-red-500/10 text-red-400",
    icon: XCircle,
  },

  RATE_LIMITED: {
    label: "Rate limited",
    className: "bg-orange-500/10 text-orange-400",
    icon: TimerReset,
  },
};

export function EmailStatusBadge({
  status,
}: EmailStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-slate-800 text-slate-400",
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
      ].join(" ")}
    >
      <Icon
        className={[
          "h-3.5 w-3.5",
          status === "PROCESSING"
            ? "animate-spin"
            : "",
        ].join(" ")}
      />

      {config.label}
    </span>
  );
}
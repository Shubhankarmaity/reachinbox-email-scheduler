import { CalendarClock, Gauge, Timer } from "lucide-react";

interface ScheduleSettingsProps {
  startTime: string;
  delayBetweenEmailsMs: number;
  hourlyLimit: number;
  onChange: (
    field:
      | "startTime"
      | "delayBetweenEmailsMs"
      | "hourlyLimit",
    value: string | number,
  ) => void;
}

export function ScheduleSettings({
  startTime,
  delayBetweenEmailsMs,
  hourlyLimit,
  onChange,
}: ScheduleSettingsProps) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">
          Scheduling
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Control when and how quickly your campaign is
          delivered.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="start-time"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <CalendarClock className="h-4 w-4 text-slate-500" />
            Start time
          </label>

          <input
            id="start-time"
            type="datetime-local"
            value={startTime}
            min={new Date()
              .toISOString()
              .slice(0, 16)}
            onChange={(event) =>
              onChange(
                "startTime",
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-slate-600"
          />
        </div>

        <div>
          <label
            htmlFor="delay-between-emails"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <Timer className="h-4 w-4 text-slate-500" />
            Delay between emails
          </label>

          <div className="relative">
            <input
              id="delay-between-emails"
              type="number"
              min="0"
              max="3600000"
              value={delayBetweenEmailsMs}
              onChange={(event) =>
                onChange(
                  "delayBetweenEmailsMs",
                  Number(event.target.value),
                )
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 pr-14 text-sm text-white outline-none transition focus:border-slate-600"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600">
              ms
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-600">
            2000 ms = 2 seconds
          </p>
        </div>

        <div>
          <label
            htmlFor="hourly-limit"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <Gauge className="h-4 w-4 text-slate-500" />
            Hourly limit
          </label>

          <input
            id="hourly-limit"
            type="number"
            min="1"
            max="100000"
            value={hourlyLimit}
            onChange={(event) =>
              onChange(
                "hourlyLimit",
                Number(event.target.value),
              )
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-slate-600"
          />

          <p className="mt-1 text-xs text-slate-600">
            Maximum emails per sender per hour
          </p>
        </div>
      </div>
    </div>
  );
}
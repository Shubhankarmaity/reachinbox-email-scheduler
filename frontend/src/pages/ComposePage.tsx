import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MailPlus,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";

import { LeadFileUpload } from "../components/email/LeadFileUpload";
import { RecipientInput } from "../components/email/RecipientInput";
import { ScheduleSettings } from "../components/email/ScheduleSettings";
import { useSenders } from "../hooks/useSenders";
import { emailApi } from "../lib/api";

function getDefaultStartTime(): string {
  const date = new Date(Date.now() + 5 * 60 * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ComposePage() {
  const navigate = useNavigate();

  const {
    senders,
    loading: sendersLoading,
    error: sendersError,
  } = useSenders();

  const [senderId, setSenderId] = useState("");
  const [recipients, setRecipients] = useState<string[]>(
    [],
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [campaignName, setCampaignName] = useState(
    "",
  );

  const [startTime, setStartTime] = useState(
    getDefaultStartTime(),
  );
  const [delayBetweenEmailsMs, setDelayBetweenEmailsMs] =
    useState(2000);
  const [hourlyLimit, setHourlyLimit] = useState(200);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(
    null,
  );

  const activeSenders = useMemo(
    () => senders.filter((sender) => sender.isActive),
    [senders],
  );

  const addRecipients = (emails: string[]) => {
    setRecipients((current) => {
      return Array.from(
        new Set([...current, ...emails]),
      );
    });
  };

  const handleSchedule = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!senderId) {
      setError("Select an active sender.");
      return;
    }

    if (recipients.length === 0) {
      setError(
        "Add at least one recipient before scheduling.",
      );
      return;
    }

    if (recipients.length > 10000) {
      setError(
        "A campaign can contain at most 10,000 recipients.",
      );
      return;
    }

    if (!subject.trim()) {
      setError("Enter an email subject.");
      return;
    }

    if (!body.trim()) {
      setError("Enter the email body.");
      return;
    }

    if (delayBetweenEmailsMs < 0) {
      setError("Delay cannot be negative.");
      return;
    }

    if (hourlyLimit < 1) {
      setError("Hourly limit must be at least 1.");
      return;
    }

    const startDate = new Date(startTime);

    if (Number.isNaN(startDate.getTime())) {
      setError("Enter a valid start time.");
      return;
    }

    if (startDate.getTime() <= Date.now()) {
      setError("Start time must be in the future.");
      return;
    }

    setSubmitting(true);

    try {
      const idempotencyKey = crypto.randomUUID();

      const response = await emailApi.schedule(
        {
          senderId,
          recipients,
          subject: subject.trim(),
          body,
          startTime: startDate.toISOString(),
          delayBetweenEmailsMs,
          hourlyLimit,
          campaignName:
            campaignName.trim() || undefined,
        },
        idempotencyKey,
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.error?.message ||
            "Failed to schedule campaign.",
        );
      }

      setSuccess(
        "Campaign scheduled successfully.",
      );

      setRecipients([]);
      setSubject("");
      setBody("");
      setCampaignName("");
      setStartTime(getDefaultStartTime());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to schedule campaign.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
            <MailPlus className="h-5 w-5 text-slate-400" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Compose Email
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create and schedule an email campaign.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-900/60 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>

          <button
            type="button"
            onClick={() => navigate("/scheduled")}
            className="ml-auto text-xs font-medium underline underline-offset-2"
          >
            View scheduled
          </button>
        </div>
      )}

      <form
        onSubmit={handleSchedule}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="border-b border-slate-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-white">
              Campaign details
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Configure the sender and message content.
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="sender"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Sender
                </label>

                {sendersLoading ? (
                  <div className="h-11 animate-pulse rounded-xl bg-slate-800" />
                ) : (
                  <select
                    id="sender"
                    value={senderId}
                    onChange={(event) =>
                      setSenderId(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-slate-600"
                  >
                    <option value="">
                      Select a sender
                    </option>

                    {activeSenders.map((sender) => (
                      <option
                        key={sender.id}
                        value={sender.id}
                      >
                        {sender.displayName} —{" "}
                        {sender.email}
                      </option>
                    ))}
                  </select>
                )}

                {sendersError && (
                  <p className="mt-2 text-xs text-red-400">
                    {sendersError}
                  </p>
                )}

                {!sendersLoading &&
                  !sendersError &&
                  activeSenders.length === 0 && (
                    <p className="mt-2 text-xs text-amber-400">
                      No active senders available. Add
                      an active sender first.
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="campaign-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Campaign name
                  <span className="ml-1 text-xs text-slate-600">
                    optional
                  </span>
                </label>

                <input
                  id="campaign-name"
                  type="text"
                  value={campaignName}
                  onChange={(event) =>
                    setCampaignName(
                      event.target.value,
                    )
                  }
                  maxLength={255}
                  placeholder="Product launch campaign"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
                />
              </div>
            </div>

            <RecipientInput
              recipients={recipients}
              onChange={setRecipients}
            />

            <LeadFileUpload
              onRecipientsParsed={addRecipients}
            />

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Subject
              </label>

              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                maxLength={255}
                placeholder="Enter your email subject"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
              />
            </div>

            <div>
              <label
                htmlFor="body"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email body
              </label>

              <textarea
                id="body"
                value={body}
                onChange={(event) =>
                  setBody(event.target.value)
                }
                rows={12}
                maxLength={100000}
                placeholder="Write your email content here..."
                className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
              />

              <div className="mt-2 text-right text-xs text-slate-600">
                {body.length.toLocaleString()} / 100,000
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <ScheduleSettings
            startTime={startTime}
            delayBetweenEmailsMs={
              delayBetweenEmailsMs
            }
            hourlyLimit={hourlyLimit}
            onChange={(field, value) => {
              if (field === "startTime") {
                setStartTime(String(value));
              }

              if (
                field === "delayBetweenEmailsMs"
              ) {
                setDelayBetweenEmailsMs(
                  Number(value),
                );
              }

              if (field === "hourlyLimit") {
                setHourlyLimit(Number(value));
              }
            }}
          />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              Ready to schedule?
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {recipients.length} recipient
              {recipients.length === 1 ? "" : "s"} ·{" "}
              {delayBetweenEmailsMs} ms delay ·{" "}
              {hourlyLimit}/hour
            </p>
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              sendersLoading ||
              activeSenders.length === 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}

            {submitting
              ? "Scheduling..."
              : "Schedule Campaign"}
          </button>
        </section>
      </form>
    </div>
  );
}
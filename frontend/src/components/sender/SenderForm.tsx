import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import { senderApi } from "../../lib/api";
import { Sender } from "../../types";

interface SenderFormProps {
  onCreated: (sender: Sender) => Promise<void> | void;
  onCancel: () => void;
}

interface FormState {
  email: string;
  displayName: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
}

const initialForm: FormState = {
  email: "",
  displayName: "",
  smtpHost: "smtp.ethereal.email",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",
};

export function SenderForm({
  onCreated,
  onCancel,
}: SenderFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const updateField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);

    const email = form.email.trim();
    const displayName = form.displayName.trim();
    const smtpHost = form.smtpHost.trim();
    const smtpUsername = form.smtpUsername.trim();
    const smtpPassword = form.smtpPassword;
    const smtpPort = Number(form.smtpPort);

    if (!email || !email.includes("@")) {
      setError("Enter a valid sender email address.");
      return;
    }

    if (!displayName) {
      setError("Enter a display name.");
      return;
    }

    if (!smtpHost) {
      setError("Enter the SMTP host.");
      return;
    }

    if (!Number.isInteger(smtpPort) || smtpPort < 1) {
      setError("Enter a valid SMTP port.");
      return;
    }

    if (!smtpUsername) {
      setError("Enter the SMTP username.");
      return;
    }

    if (!smtpPassword) {
      setError("Enter the SMTP password.");
      return;
    }

    setLoading(true);

    try {
      const response = await senderApi.create({
        email,
        displayName,
        smtpHost,
        smtpPort,
        smtpUsername,
        smtpPassword,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.error?.message ||
            "Failed to create sender.",
        );
      }

      await onCreated(response.data.data);

      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create sender.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Add Sender
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Configure an SMTP account for sending campaigns.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
          aria-label="Close sender form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-5"
      >
        {error && (
          <div className="rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="sender-email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Sender email
            </label>

            <input
              id="sender-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value,
                )
              }
              placeholder="sender@example.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
            />
          </div>

          <div>
            <label
              htmlFor="sender-display-name"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Display name
            </label>

            <input
              id="sender-display-name"
              type="text"
              value={form.displayName}
              onChange={(event) =>
                updateField(
                  "displayName",
                  event.target.value,
                )
              }
              placeholder="ReachInbox"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
            />
          </div>

          <div>
            <label
              htmlFor="smtp-host"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              SMTP host
            </label>

            <input
              id="smtp-host"
              type="text"
              value={form.smtpHost}
              onChange={(event) =>
                updateField(
                  "smtpHost",
                  event.target.value,
                )
              }
              placeholder="smtp.ethereal.email"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
            />
          </div>

          <div>
            <label
              htmlFor="smtp-port"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              SMTP port
            </label>

            <input
              id="smtp-port"
              type="number"
              min="1"
              max="65535"
              value={form.smtpPort}
              onChange={(event) =>
                updateField(
                  "smtpPort",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-slate-600"
            />
          </div>

          <div>
            <label
              htmlFor="smtp-username"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              SMTP username
            </label>

            <input
              id="smtp-username"
              type="text"
              value={form.smtpUsername}
              onChange={(event) =>
                updateField(
                  "smtpUsername",
                  event.target.value,
                )
              }
              placeholder="your SMTP username"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
            />
          </div>

          <div>
            <label
              htmlFor="smtp-password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              SMTP password
            </label>

            <div className="relative">
              <input
                id="smtp-password"
                type={showPassword ? "text" : "password"}
                value={form.smtpPassword}
                onChange={(event) =>
                  updateField(
                    "smtpPassword",
                    event.target.value,
                  )
                }
                placeholder="SMTP password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-600"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:text-white"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {loading ? "Creating..." : "Create Sender"}
          </button>
        </div>
      </form>
    </div>
  );
}
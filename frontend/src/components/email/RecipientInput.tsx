import { Mail, X } from "lucide-react";
import { useState } from "react";

interface RecipientInputProps {
  recipients: string[];
  onChange: (recipients: string[]) => void;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RecipientInput({
  recipients,
  onChange,
}: RecipientInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addRecipient = () => {
    const email = value.trim().toLowerCase();

    if (!email) {
      return;
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (recipients.includes(email)) {
      setError("This recipient has already been added.");
      return;
    }

    onChange([...recipients, email]);
    setValue("");
    setError(null);
  };

  const removeRecipient = (email: string) => {
    onChange(
      recipients.filter(
        (recipient) => recipient !== email,
      ),
    );
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Enter" ||
      event.key === "," ||
      event.key === "Tab"
    ) {
      if (event.key !== "Tab" || value.trim()) {
        event.preventDefault();
        addRecipient();
      }
    }

    if (
      event.key === "Backspace" &&
      !value &&
      recipients.length > 0
    ) {
      removeRecipient(
        recipients[recipients.length - 1],
      );
    }
  };

  return (
    <div>
      <label
        htmlFor="recipient-input"
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        Recipients
      </label>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 transition focus-within:border-slate-600">
        <div className="flex flex-wrap gap-2">
          {recipients.map((recipient) => (
            <span
              key={recipient}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
            >
              <Mail className="h-3 w-3 shrink-0 text-slate-500" />

              <span className="max-w-[240px] truncate">
                {recipient}
              </span>

              <button
                type="button"
                onClick={() =>
                  removeRecipient(recipient)
                }
                className="ml-1 text-slate-500 transition hover:text-white"
                aria-label={`Remove ${recipient}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <input
            id="recipient-input"
            type="email"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (value.trim()) {
                addRecipient();
              }
            }}
            placeholder={
              recipients.length === 0
                ? "recipient@example.com"
                : "Add another recipient..."
            }
            className="min-w-[220px] flex-1 bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Press Enter, comma, or Tab to add a recipient.
        </p>

        <p className="text-xs text-slate-500">
          {recipients.length} recipient
          {recipients.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
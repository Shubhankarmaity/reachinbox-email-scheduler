import {
  CheckCircle2,
  FileText,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";

interface LeadFileUploadProps {
  onRecipientsParsed: (emails: string[]) => void;
}

const EMAIL_REGEX =
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) ?? [];

  return Array.from(
    new Set(
      matches.map((email) => email.trim().toLowerCase()),
    ),
  );
}

function isSupportedFile(file: File): boolean {
  const fileName = file.name.toLowerCase();

  return (
    fileName.endsWith(".csv") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".xlsx")
  );
}

export function LeadFileUpload({
  onRecipientsParsed,
}: LeadFileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState<string | null>(
    null,
  );
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setFileName(file.name);
    setCount(0);

    try {
      if (!isSupportedFile(file)) {
        throw new Error(
          "Only CSV and TXT files are supported.",
        );
      }

      const text = await file.text();
      const emails = extractEmails(text);

      if (emails.length === 0) {
        throw new Error(
          "No valid email addresses were found in the file.",
        );
      }

      onRecipientsParsed(emails);
      setCount(emails.length);
    } catch (err) {
      setFileName(null);
      setCount(0);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to process the file.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      void processFile(file);
    }

    event.target.value = "";
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-4">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
            <FileText className="h-4 w-4 text-slate-400" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300">
              Import leads
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Upload a CSV or TXT file containing email
              addresses.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {loading ? "Reading..." : "Choose file"}
        </button>
      </div>

      {fileName && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-500/5 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />

            <span className="truncate text-xs text-slate-300">
              {fileName}
            </span>
          </div>

          <span className="shrink-0 text-xs font-medium text-emerald-400">
            {count} emails
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/5 px-3 py-2.5 text-xs text-red-400">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
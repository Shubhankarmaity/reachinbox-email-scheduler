import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type NoticeState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

interface SlackCallbackNoticeProps {
  onRefresh?: () => void | Promise<void>;
}

export function SlackCallbackNotice({
  onRefresh,
}: SlackCallbackNoticeProps) {
  const [notice, setNotice] = useState<NoticeState>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const slackStatus = url.searchParams.get("slack");

    if (!slackStatus) {
      return;
    }

    if (slackStatus === "connected") {
      setNotice({
        type: "success",
        message: "Slack connected successfully.",
      });

      void onRefresh?.();
    } else if (slackStatus === "error") {
      setNotice({
        type: "error",
        message:
          "Slack connection failed. Please check the OAuth configuration and try again.",
      });
    }

    url.searchParams.delete("slack");
    window.history.replaceState({}, document.title, url.pathname + url.search);
  }, [onRefresh]);

  if (!notice) {
    return null;
  }

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        notice.type === "success"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      {notice.type === "success" ? (
        <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
      ) : (
        <XCircle className="mt-0.5 shrink-0" size={18} />
      )}

      <span>{notice.message}</span>
    </div>
  );
}
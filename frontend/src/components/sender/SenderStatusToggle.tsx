import { Loader2, Power } from "lucide-react";

interface SenderStatusToggleProps {
  isActive: boolean;
  loading?: boolean;
  onToggle: () => void;
}

export function SenderStatusToggle({
  isActive,
  loading = false,
  onToggle,
}: SenderStatusToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={[
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition",
        isActive
          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
      ].join(" ")}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Power className="h-3.5 w-3.5" />
      )}

      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
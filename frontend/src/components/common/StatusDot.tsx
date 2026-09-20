interface StatusDotProps {
  status: "success" | "warning" | "error" | "neutral";
  label?: string;
}

const statusClasses = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  neutral: "bg-slate-500",
};

export function StatusDot({
  status,
  label,
}: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-slate-400">
      <span
        className={`h-2 w-2 rounded-full ${statusClasses[status]}`}
      />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
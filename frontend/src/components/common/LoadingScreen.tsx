interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Loading ReachInbox...",
}: LoadingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
        </div>

        <p className="mt-5 text-sm font-medium text-slate-300">
          {message}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Please wait a moment.
        </p>
      </div>
    </main>
  );
}
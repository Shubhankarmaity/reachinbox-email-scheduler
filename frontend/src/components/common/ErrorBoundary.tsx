import {
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(
    error: Error,
  ): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo,
  ) {
    console.error(
      "ReachInbox UI error:",
      error,
      errorInfo,
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
          <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              ReachInbox encountered an unexpected UI error.
              Reload the application to continue.
            </p>

            {import.meta.env.DEV &&
              this.state.error && (
                <pre className="mt-5 max-h-40 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-red-300">
                  {this.state.error.stack ||
                    this.state.error.message}
                </pre>
              )}

            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              Reload application
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
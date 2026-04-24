import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const details = this.state.error?.stack || String(this.state.error || "Unknown error");
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-aura-page px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold tracking-tight text-aura-ink">Something went wrong</p>
          <p className="max-w-md text-[15px] leading-relaxed text-slate-600">
            Try refreshing the page. If this keeps happening, clear site data for this origin and sign in again.
          </p>
          <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="btn-cta"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Retry
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(details);
                } catch {
                  // ignore
                }
              }}
            >
              Copy error details
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.assign("/");
              }}
            >
              Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

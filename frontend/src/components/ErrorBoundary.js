import React from "react";
import Button from "./ui/Button";

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
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-5 bg-aura-page px-6 py-16 text-center"
          role="alert"
          aria-live="assertive"
          aria-busy="false"
        >
          <p className="font-display text-2xl font-semibold tracking-tight text-aura-ink">Something went wrong</p>
          <p className="max-w-md text-[15px] leading-relaxed text-aura-muted dark:text-slate-400">
            Try refreshing the page. If this keeps happening, clear site data for this origin and sign in again.
          </p>
          <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="cta"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(details);
                } catch {
                  // ignore
                }
              }}
            >
              Copy error details
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.assign("/");
              }}
            >
              Back to home
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

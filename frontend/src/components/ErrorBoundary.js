import React from "react";
import Button from "./ui/Button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, copyHint: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, copyHint: null };
  }

  componentDidCatch(error, info) {
    console.error("App error:", error, info.componentStack);
  }

  componentWillUnmount() {
    window.clearTimeout(this._copyHintTimer);
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
          {this.state.copyHint ? (
            <p
              className={
                this.state.copyHint.startsWith("Copy blocked")
                  ? "max-w-md text-sm text-amber-800 dark:text-amber-200"
                  : "max-w-md text-sm text-emerald-700 dark:text-emerald-300"
              }
              role="status"
            >
              {this.state.copyHint}
            </p>
          ) : null}
          <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="cta"
              onClick={() => {
                this.setState({ hasError: false, error: null, copyHint: null });
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
                  this.setState({ copyHint: "Copied to clipboard." });
                  window.clearTimeout(this._copyHintTimer);
                  this._copyHintTimer = window.setTimeout(() => this.setState({ copyHint: null }), 3200);
                } catch {
                  this.setState({ copyHint: "Copy blocked — open DevTools and copy from the console." });
                }
              }}
            >
              Copy error details
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null, copyHint: null });
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

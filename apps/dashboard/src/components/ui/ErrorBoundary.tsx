import { Component, type ReactNode } from "react";
import Button from "@/components/ui/Button";

interface IErrorBoundary {
  children: ReactNode;
}

interface IErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<IErrorBoundary, IErrorBoundaryState> {
  state: IErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg bg-surface p-6 text-center">
          <p className="text-md font-semibold">r·drop stopped responding</p>
          <p className="mt-1.5 text-sm text-ink-2">
            Reloading usually clears it. If it comes back, send this message along.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-bg p-3 text-left font-mono text-xs text-ink-3">
            {this.state.error.message}
          </pre>
          <div className="mt-5">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reload r·drop
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

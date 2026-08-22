import { Component, type ReactNode } from "react";

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="font-display font-semibold">Something broke.</p>
        <p className="max-w-md text-center font-mono text-xs text-muted">
          {this.state.error.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className=" rounded-none border border-line bg-panel-2 px-3 py-1.5 font-display text-sm"
        >
          Reload
        </button>
      </div>
    );
  }
}

import { Component, type ErrorInfo, type ReactNode } from "react";

type ReactBridgeErrorBoundaryProps = {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ReactBridgeErrorBoundaryState = {
  error: Error | null;
};

export class ReactBridgeErrorBoundary extends Component<
  ReactBridgeErrorBoundaryProps,
  ReactBridgeErrorBoundaryState
> {
  state: ReactBridgeErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ReactBridgeErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          data-react-bridge-error
          role="alert"
          className="not-prose w-full border-2 border-border bg-secondary-background p-4 text-foreground"
        >
          <p className="font-heading">Preview could not be rendered.</p>
          <p className="mt-1 break-words text-sm opacity-70">{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type PreviewErrorBoundaryProps = {
  children: ReactNode;
};

type PreviewErrorBoundaryState = {
  error?: Error;
};

export function PreviewFailure({ error }: { error: Error }) {
  return (
    <div className="react-host__error" role="alert">
      <strong>Preview could not be loaded.</strong>
      <span>{error.message}</span>
      <Button
        className="w-fit"
        variant="neutral"
        size="sm"
        type="button"
        onClick={() => window.location.reload()}
      >
        Reload page
      </Button>
    </div>
  );
}

export class PreviewErrorBoundary extends Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  state: PreviewErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): PreviewErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Preview render failed", error, info);
  }

  render() {
    if (this.state.error) {
      return <PreviewFailure error={this.state.error} />;
    }

    return this.props.children;
  }
}

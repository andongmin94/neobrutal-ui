import { createElement, type ComponentType, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import { ReactBridgeErrorBoundary } from "./error-boundary";
import { BridgeToaster } from "./toaster";

export type ReactHostType = "component" | "special" | "star";

export type ReactMountRequest = {
  component: string;
  example?: string;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
  type?: ReactHostType;
};

export type ReactUnmount = () => void;

let toasterContainer: HTMLDivElement | null = null;
let toasterRoot: Root | null = null;
let toasterUsers = 0;

function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function acquireToaster(ownerDocument: Document): ReactUnmount {
  toasterUsers += 1;

  if (!toasterRoot) {
    toasterContainer = ownerDocument.createElement("div");
    toasterContainer.dataset.reactBridgePortal = "toaster";
    ownerDocument.body.append(toasterContainer);
    toasterRoot = createRoot(toasterContainer);
    toasterRoot.render(<BridgeToaster />);
  }

  let released = false;

  return () => {
    if (released) return;
    released = true;
    toasterUsers = Math.max(0, toasterUsers - 1);

    if (toasterUsers === 0) {
      toasterRoot?.unmount();
      toasterContainer?.remove();
      toasterRoot = null;
      toasterContainer = null;
    }
  };
}

async function resolveComponentPreview(component: string, example?: string): Promise<ReactElement> {
  const { default: components } = await import("../../../src/data/components");
  const componentData = components.find((candidate) => toSlug(candidate.name) === component);

  if (!componentData) {
    throw new Error(`Unknown component preview: ${component}`);
  }

  const Preview = example ? componentData.examples?.[example] : componentData.exampleComponent;

  if (!Preview) {
    const suffix = example ? ` example "${example}"` : "";
    throw new Error(`No preview is registered for ${component}${suffix}.`);
  }

  return createElement(Preview as ComponentType);
}

async function resolveStarPreview(component: string): Promise<ReactElement> {
  const { STARS_EXAMPLES } = await import("../../../src/data/stars");
  const Preview = STARS_EXAMPLES[component as keyof typeof STARS_EXAMPLES];

  if (!Preview) {
    throw new Error(`Unknown star preview: ${component}`);
  }

  return createElement(Preview as ComponentType);
}

async function resolveSpecialPage(component: string, example?: string): Promise<ReactElement> {
  const { SpecialPageRenderer } = await import("./special-pages");

  return <SpecialPageRenderer argument={example} page={component} />;
}

async function resolveRequest(request: ReactMountRequest): Promise<ReactElement> {
  const component = toSlug(request.component);

  if (!component) {
    throw new Error("A React bridge component name is required.");
  }

  switch (request.type ?? "component") {
    case "component":
      return resolveComponentPreview(component, request.example);
    case "star":
      return resolveStarPreview(component);
    case "special":
      return resolveSpecialPage(component, request.example);
    default:
      throw new Error(`Unsupported React bridge type: ${String(request.type)}`);
  }
}

export async function mountReactHost(
  container: HTMLElement,
  request: ReactMountRequest,
): Promise<ReactUnmount> {
  if (typeof window === "undefined") {
    throw new Error("The React preview bridge can only be mounted in a browser.");
  }

  const child = await resolveRequest(request);

  if (request.signal?.aborted) {
    const abortError = new Error("The React preview mount was cancelled.");
    abortError.name = "AbortError";
    throw abortError;
  }

  const ownerDocument = container.ownerDocument;
  const releaseToaster =
    (request.type ?? "component") === "component" && toSlug(request.component) === "sonner"
      ? acquireToaster(ownerDocument)
      : undefined;
  const root = createRoot(container);

  container.dataset.reactBridgeRoot = request.type ?? "component";

  root.render(
    <ReactBridgeErrorBoundary onError={(error) => request.onError?.(error)}>
      {child}
    </ReactBridgeErrorBoundary>,
  );

  let unmounted = false;

  return () => {
    if (unmounted) return;
    unmounted = true;
    root.unmount();
    releaseToaster?.();
    delete container.dataset.reactBridgeRoot;
  };
}

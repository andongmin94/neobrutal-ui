import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { PreviewErrorBoundary } from "./preview-error-boundary";

type PreviewType = "component" | "star";

function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

async function loadPreview(
  component: string,
  example: string | undefined,
  type: PreviewType,
): Promise<ComponentType> {
  if (type === "star") {
    const { STARS_EXAMPLES } = await import("@/data/stars");
    const Preview = STARS_EXAMPLES[component as keyof typeof STARS_EXAMPLES];

    if (!Preview) throw new Error(`Unknown star preview: ${component}`);
    return Preview as ComponentType;
  }

  const { default: components } = await import("@/data/components");
  const componentData = components.find((candidate) => toSlug(candidate.name) === component);

  if (!componentData) throw new Error(`Unknown component preview: ${component}`);

  const loader = example ? componentData.examples?.[example] : componentData.exampleComponent;
  if (!loader) {
    const suffix = example ? ` example "${example}"` : "";
    throw new Error(`No preview is registered for ${component}${suffix}.`);
  }

  return (await loader()).default;
}

function PreviewHost({
  component,
  eager,
  example,
  type,
}: {
  component: string;
  eager: boolean;
  example?: string;
  type: PreviewType;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(eager);
  const [Preview, setPreview] = useState<ComponentType>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (requested || eager || !host.current || typeof IntersectionObserver === "undefined") {
      setRequested(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRequested(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(host.current);
    return () => observer.disconnect();
  }, [eager, requested]);

  useEffect(() => {
    if (!requested) return;

    let cancelled = false;
    setPreview(undefined);
    setError(undefined);

    void loadPreview(component, example, type)
      .then((LoadedPreview) => {
        if (!cancelled) setPreview(() => LoadedPreview);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason : new Error(String(reason)));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [component, example, requested, type]);

  return (
    <div
      ref={host}
      className="react-host"
      data-react-host={type}
      data-react-component={component}
      aria-busy={!Preview && !error ? true : undefined}
    >
      <div className="react-host__mount">
        {error ? (
          <div className="react-host__error" role="alert">
            <strong>Preview could not be loaded.</strong>
            <span>{error.message}</span>
          </div>
        ) : Preview ? (
          <PreviewErrorBoundary key={`${type}:${component}:${example ?? ""}`}>
            <Preview />
          </PreviewErrorBoundary>
        ) : null}
      </div>

      {!Preview && !error && <output className="react-host__status">Loading preview...</output>}
    </div>
  );
}

export function ComponentPreview({
  children,
  component,
  example,
  type = "component",
  wrapperClassName = "",
}: {
  children?: ReactNode;
  component: string;
  example?: string;
  type?: PreviewType;
  wrapperClassName?: string;
}) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const instanceId = useId();
  const normalizedComponent = toSlug(component);
  const isPrimaryPreview = type === "component" && !example;
  const previewLabel = `${component} ${example?.replaceAll("-", " ") ?? "primary"} preview`;

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const nextTab = event.key === "Home" || event.key === "ArrowLeft" ? "preview" : "code";
    const tabList = event.currentTarget;
    setActiveTab(nextTab);

    requestAnimationFrame(() => {
      tabList.querySelector<HTMLButtonElement>(`[data-preview-tab="${nextTab}"]`)?.focus();
    });
  }

  return (
    <section
      className={
        isPrimaryPreview ? "component-preview component-preview--primary" : "component-preview"
      }
      data-component={normalizedComponent}
    >
      <header className="component-preview__header">
        {isPrimaryPreview && (
          <div className="component-preview__label">
            <span aria-hidden="true" />
            <strong>Live preview</strong>
          </div>
        )}

        <div
          className="component-preview__tabs"
          role="tablist"
          tabIndex={-1}
          aria-label={previewLabel}
          onKeyDown={handleTabKeyDown}
        >
          <button
            id={`${instanceId}-preview-tab`}
            type="button"
            role="tab"
            data-preview-tab="preview"
            aria-controls={`${instanceId}-preview-panel`}
            aria-selected={activeTab === "preview"}
            tabIndex={activeTab === "preview" ? 0 : -1}
            onClick={() => setActiveTab("preview")}
          >
            Preview
          </button>
          <button
            id={`${instanceId}-code-tab`}
            type="button"
            role="tab"
            data-preview-tab="code"
            aria-controls={`${instanceId}-code-panel`}
            aria-selected={activeTab === "code"}
            tabIndex={activeTab === "code" ? 0 : -1}
            onClick={() => setActiveTab("code")}
          >
            Code
          </button>
        </div>
      </header>

      <div
        id={`${instanceId}-preview-panel`}
        className={[
          "component-preview__panel",
          "component-preview__canvas",
          "vp-raw",
          wrapperClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        role="tabpanel"
        aria-labelledby={`${instanceId}-preview-tab`}
        hidden={activeTab !== "preview"}
      >
        <PreviewHost
          component={normalizedComponent}
          eager={isPrimaryPreview}
          example={example}
          type={type}
        />
      </div>

      <div
        id={`${instanceId}-code-panel`}
        className="component-preview__panel component-preview__code"
        role="tabpanel"
        aria-labelledby={`${instanceId}-code-tab`}
        hidden={activeTab !== "code"}
      >
        {children}
      </div>
    </section>
  );
}

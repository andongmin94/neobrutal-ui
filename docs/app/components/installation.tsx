import { Check, Copy, SquareTerminal } from "lucide-react";
import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";

import { copyText } from "~/lib/clipboard";

const registryBaseUrl =
  import.meta.env.VITE_REGISTRY_BASE_URL ?? "https://neobrutal-ui.andongmin.com";

export function Installation({ children, component }: { children?: ReactNode; component: string }) {
  const [activeTab, setActiveTab] = useState<"cli" | "manual">("cli");
  const [copyState, setCopyState] = useState<"copied" | "failed" | "idle">("idle");
  const instanceId = useId();
  const command = `npx shadcn@latest add ${registryBaseUrl}/r/${component}.json`;

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  async function copyCommand() {
    try {
      await copyText(command);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const tabs = ["cli", "manual"] as const;
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    const tabList = event.currentTarget;
    setActiveTab(nextTab);

    requestAnimationFrame(() => {
      tabList.querySelector<HTMLButtonElement>(`[data-installation-tab="${nextTab}"]`)?.focus();
    });
  }

  const copyLabel =
    copyState === "copied"
      ? "Command copied"
      : copyState === "failed"
        ? "Copy failed"
        : "Copy installation command";

  return (
    <section className="installation-tabs">
      <div
        className="installation-tabs__list"
        role="tablist"
        tabIndex={-1}
        aria-label="Installation method"
        onKeyDown={handleTabKeyDown}
      >
        <button
          id={`${instanceId}-cli-tab`}
          type="button"
          role="tab"
          data-installation-tab="cli"
          aria-selected={activeTab === "cli"}
          aria-controls={`${instanceId}-cli-panel`}
          tabIndex={activeTab === "cli" ? 0 : -1}
          onClick={() => setActiveTab("cli")}
        >
          Shadcn CLI
        </button>
        <button
          id={`${instanceId}-manual-tab`}
          type="button"
          role="tab"
          data-installation-tab="manual"
          aria-selected={activeTab === "manual"}
          aria-controls={`${instanceId}-manual-panel`}
          tabIndex={activeTab === "manual" ? 0 : -1}
          onClick={() => setActiveTab("manual")}
        >
          Manual
        </button>
      </div>

      <div
        id={`${instanceId}-cli-panel`}
        className="installation-tabs__panel installation-tabs__command"
        role="tabpanel"
        aria-labelledby={`${instanceId}-cli-tab`}
        tabIndex={0}
        hidden={activeTab !== "cli"}
      >
        <SquareTerminal aria-hidden="true" size={18} strokeWidth={2.3} />
        <code>{command}</code>
        <button
          className="icon-button"
          type="button"
          aria-label={copyLabel}
          title={copyState === "idle" ? "Copy command" : copyLabel}
          onClick={() => void copyCommand()}
        >
          {copyState === "copied" ? (
            <Check aria-hidden="true" size={17} strokeWidth={2.5} />
          ) : (
            <Copy aria-hidden="true" size={17} strokeWidth={2.3} />
          )}
        </button>
        <span className="sr-only" aria-live="polite">
          {copyState === "idle" ? "" : copyLabel}
        </span>
      </div>

      <div
        id={`${instanceId}-manual-panel`}
        className="installation-tabs__panel installation-tabs__manual"
        role="tabpanel"
        aria-labelledby={`${instanceId}-manual-tab`}
        tabIndex={0}
        hidden={activeTab !== "manual"}
      >
        {children}
      </div>
    </section>
  );
}

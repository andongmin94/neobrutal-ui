import { Info, SquareTerminal } from "lucide-react";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

import { CopyButton } from "@/components/docs/copy-button";

const registryBaseUrl =
  import.meta.env.VITE_REGISTRY_BASE_URL ?? "https://neobrutal-ui.andongmin.com";

export function Installation({ children, component }: { children?: ReactNode; component: string }) {
  const [activeTab, setActiveTab] = useState<"cli" | "manual">("cli");
  const instanceId = useId();
  const command = `npx shadcn@latest add ${registryBaseUrl}/r/${component}.json`;

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

  return (
    <section className="installation-tabs" aria-label={`Install ${component}`}>
      <div className="installation-tabs__notice">
        <Info aria-hidden="true" size={18} />
        <div>
          <p>
            First installation? <a href="/docs/installation">Install the base theme</a> first.
          </p>
          <p>
            The base updates global theme variables. Review these changes in an existing project.
          </p>
        </div>
      </div>
      <div className="installation-tabs__frame">
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
          <code tabIndex={0}>{command}</code>
          <CopyButton text={command} label="Copy installation command" />
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
      </div>
    </section>
  );
}

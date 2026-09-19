import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const files = ["app/page.tsx", "components/hero.tsx", "styles/theme.css"];

export default function ResizableDemo() {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="min-h-[260px] w-full max-w-2xl overflow-hidden rounded-base border-2 border-border bg-background text-foreground shadow-shadow"
    >
      <ResizablePanel defaultSize="32%" minSize="22%">
        <div className="flex h-full min-w-0 flex-col bg-secondary-background">
          <div className="border-b-2 border-border px-3 py-2 text-xs font-heading uppercase tracking-wide">
            Files
          </div>
          <ul className="grid gap-1 p-2 text-xs sm:text-sm">
            {files.map((file, index) => (
              <li
                key={file}
                className={`min-w-0 truncate rounded-base border-2 border-transparent px-2 py-2 ${
                  index === 1 ? "border-border bg-main text-main-foreground" : ""
                }`}
              >
                {file}
              </li>
            ))}
          </ul>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize file explorer" />
      <ResizablePanel defaultSize="68%" minSize="35%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="64%" minSize="35%">
            <div className="flex h-full flex-col">
              <div className="border-b-2 border-border px-3 py-2 text-xs font-heading uppercase tracking-wide">
                components/hero.tsx
              </div>
              <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-5 sm:text-xs">
                {`export function Hero() {\n  return <section>Build boldly.</section>\n}`}
              </pre>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="Resize preview panel" />
          <ResizablePanel defaultSize="36%" minSize="24%">
            <div className="flex h-full items-center justify-between gap-3 bg-main p-3 text-main-foreground">
              <div className="min-w-0">
                <p className="text-xs font-heading uppercase tracking-wide">Preview</p>
                <p className="truncate text-sm">Build boldly.</p>
              </div>
              <span className="rounded-base border-2 border-current px-2 py-1 text-xs font-heading">
                Ready
              </span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

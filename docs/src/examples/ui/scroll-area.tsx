import { ScrollArea } from "@/components/ui/scroll-area";

const updates = [
  ["Button reference", "Variants and navigation guidance reviewed"],
  ["Sidebar", "Mobile hook and manual install files verified"],
  ["Theme export", "Customizer output matches registry tokens"],
  ["Dialog", "Focus return and local submission tested"],
  ["Calendar", "Range selection consumer build passed"],
  ["Templates", "Next.js App Router pages generated"],
] as const;

export default function ScrollAreaDemo() {
  return (
    <ScrollArea
      className="h-64 w-full max-w-sm rounded-base border-2 border-border bg-secondary-background shadow-shadow"
      aria-label="Recent registry activity"
    >
      <div className="p-4">
        <div className="mb-3 border-b-2 border-border pb-3">
          <p className="text-xs font-heading uppercase tracking-wide text-foreground/70">
            Workspace
          </p>
          <h3 className="text-lg font-heading">Recent activity</h3>
        </div>
        <ul className="divide-y-2 divide-border">
          {updates.map(([title, detail]) => (
            <li key={title} className="py-3 first:pt-0 last:pb-0">
              <p className="font-heading">{title}</p>
              <p className="mt-1 text-sm leading-5 text-foreground/75">{detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  );
}

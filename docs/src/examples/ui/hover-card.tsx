import { ArrowUpRight } from "lucide-react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger
        href="/docs"
        className="inline-flex items-center gap-2 font-heading underline decoration-2 underline-offset-4"
      >
        Explore the component registry
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-heading uppercase tracking-wide text-foreground/70">
              neobrutal-ui
            </p>
            <h3 className="mt-1 text-lg font-heading">Source-owned React components</h3>
          </div>
          <span className="rounded-base border-2 border-border bg-main px-2 py-1 text-xs font-heading text-main-foreground">
            Ready
          </span>
        </div>
        <p className="mt-3 text-sm leading-6">
          Install accessible Base UI components, themes, and templates through a shadcn-compatible registry.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t-2 border-border pt-3 text-center text-xs">
          <div><strong className="block text-base font-heading">49</strong>components</div>
          <div><strong className="block text-base font-heading">17</strong>themes</div>
          <div><strong className="block text-base font-heading">4</strong>templates</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

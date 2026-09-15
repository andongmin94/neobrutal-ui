"use client";

import { Check, ChevronsUpDown, Circle } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const hiddenTasks = ["Production registry responds", "Release notes reviewed"];

export default function CollapsibleDemo() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full max-w-md space-y-2"
    >
      <div className="flex items-center justify-between gap-4 rounded-base border-2 border-border bg-main px-4 py-3 text-main-foreground shadow-shadow">
        <div className="min-w-0">
          <h3 className="font-heading">Release checklist</h3>
          <p className="mt-1 text-sm">1 complete · 2 {isOpen ? "shown" : "hidden"}</p>
        </div>
        <CollapsibleTrigger asChild>
          <Button
            variant="neutral"
            size="icon-sm"
            aria-label={isOpen ? "Hide remaining release tasks" : "Show remaining release tasks"}
          >
            <ChevronsUpDown aria-hidden="true" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="flex items-center gap-3 rounded-base border-2 border-border bg-secondary-background px-4 py-3 text-sm">
        <Check className="size-4 shrink-0" aria-hidden="true" />
        <span>Fresh consumer builds pass</span>
      </div>
      <CollapsibleContent className="space-y-2">
        {hiddenTasks.map((task) => (
          <div
            key={task}
            className="flex items-center gap-3 rounded-base border-2 border-border bg-secondary-background px-4 py-3 text-sm"
          >
            <Circle className="size-4 shrink-0" aria-hidden="true" />
            <span>{task}</span>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

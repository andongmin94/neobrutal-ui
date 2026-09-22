"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@/lib/utils";

function Collapsible({ className, ...props }: CollapsiblePrimitive.Root.Props) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      {...props}
      className={(state) =>
        cn(typeof className === "function" ? className(state) : className)
      }
    />
  );
}

function CollapsibleTrigger(props: CollapsiblePrimitive.Trigger.Props) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      {...props}
      className={(state) =>
        cn(
          "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

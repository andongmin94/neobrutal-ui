"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props<string>) {
  return (
    <AccordionPrimitive.Root<string>
      data-slot="accordion"
      {...props}
      className={(state) =>
        cn(
          "flex w-full flex-col",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      {...props}
      className={(state) =>
        cn(
          "overflow-hidden rounded-base border-2 border-b border-border shadow-shadow",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        {...props}
        className={(state) =>
          cn(
            "group/accordion-trigger flex flex-1 items-center justify-between border-border bg-main p-4 text-left text-base font-heading text-main-foreground transition-all focus-visible:ring-[3px] aria-disabled:pointer-events-none aria-disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 data-panel-open:rounded-b-none data-panel-open:border-b-2 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-5",
            typeof className === "function" ? className(state) : className,
          )
        }
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 transition-transform duration-200 group-data-panel-open/accordion-trigger:rotate-180"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      {...props}
      className="h-(--accordion-panel-height) overflow-hidden rounded-b-base bg-secondary-background text-sm font-base transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0"
    >
      <div
        className={cn(
          "p-4 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          typeof className === "function" ? undefined : className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

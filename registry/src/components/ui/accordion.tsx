"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type AccordionProps = Omit<
  AccordionPrimitive.Root.Props,
  "defaultValue" | "multiple" | "onValueChange" | "value"
> & {
  collapsible?: boolean;
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[], eventDetails: unknown) => void;
  type?: "single" | "multiple";
  value?: string | string[];
};

function toAccordionValue(value?: string | string[]) {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

function fromAccordionValue(value: string[], multiple: boolean) {
  return multiple ? value : (value[0] ?? "");
}

function Accordion({
  className,
  collapsible: _collapsible,
  defaultValue,
  onValueChange,
  type = "single",
  value,
  ...props
}: AccordionProps) {
  const multiple = type === "multiple";

  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      defaultValue={toAccordionValue(defaultValue)}
      multiple={multiple}
      onValueChange={(nextValue, eventDetails) => {
        onValueChange?.(fromAccordionValue(nextValue, multiple), eventDetails);
      }}
      value={toAccordionValue(value)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "overflow-hidden rounded-base border-2 border-b border-border shadow-shadow",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-center justify-between border-border bg-main p-4 text-left text-base font-heading text-main-foreground transition-all focus-visible:ring-[3px] aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:rounded-b-none data-open:border-b-2 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-5",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 transition-transform duration-200 group-data-open/accordion-trigger:rotate-180 group-aria-expanded/accordion-trigger:rotate-180"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden rounded-b-base bg-secondary-background text-sm font-base transition-all data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) p-4 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

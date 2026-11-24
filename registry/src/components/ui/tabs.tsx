"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  dir,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & { dir?: "ltr" | "rtl" }) {
  const root = (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      dir={dir}
      orientation={orientation}
      className={(state) =>
        cn(
          "w-full min-w-0 data-[orientation=vertical]:flex data-[orientation=vertical]:gap-2",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
  return dir ? <DirectionProvider direction={dir}>{root}</DirectionProvider> : root;
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit min-w-0 max-w-full items-center justify-start rounded-base border-2 border-border bg-background p-1 text-foreground data-[orientation=horizontal]:min-h-12 data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:scroll-px-1 data-[orientation=vertical]:h-fit data-[orientation=vertical]:max-w-[50%] data-[orientation=vertical]:flex-col data-[variant=line]:rounded-none data-[variant=line]:border-0 data-[variant=line]:bg-transparent",
  {
    variants: { variant: { default: "", line: "gap-1" } },
    defaultVariants: { variant: "default" },
  },
);

function TabsList({
  className,
  variant = "default",
  activateOnFocus = true,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      activateOnFocus={activateOnFocus}
      className={(state) =>
        cn(
          tabsListVariants({ variant }),
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Tab>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={(state) =>
        cn(
          "relative inline-flex items-center justify-center gap-1.5 rounded-base border-2 border-transparent px-2 py-1 text-sm font-heading whitespace-nowrap transition-all motion-reduce:transition-none data-[orientation=horizontal]:h-full data-[orientation=horizontal]:min-h-9 data-[orientation=horizontal]:shrink-0 data-[orientation=vertical]:w-full data-[orientation=vertical]:min-w-0 data-[orientation=vertical]:justify-start data-[orientation=vertical]:whitespace-normal data-[orientation=vertical]:wrap-anywhere data-[orientation=vertical]:text-start focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:border-border data-active:bg-main data-active:text-main-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          "group-data-[variant=line]/tabs-list:data-active:border-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-foreground",
          "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity motion-reduce:after:transition-none data-[orientation=horizontal]:after:inset-x-0 data-[orientation=horizontal]:after:bottom-0 data-[orientation=horizontal]:after:h-0.5 data-[orientation=vertical]:after:inset-y-0 data-[orientation=vertical]:after:-inset-e-1 data-[orientation=vertical]:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Panel>) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={(state) =>
        cn(
          "mt-2 min-w-0 flex-1 outline-none focus-visible:ring-1 focus-visible:ring-ring",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };

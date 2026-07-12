"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { DirectionProvider, useDirection } from "@base-ui/react/direction-provider";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

type TabsActivationMode = "automatic" | "manual";

type TabsProps = Omit<TabsPrimitive.Root.Props, "defaultValue" | "onValueChange" | "value"> & {
  activationMode?: TabsActivationMode;
  defaultValue?: string;
  dir?: "ltr" | "rtl";
  onValueChange?: (value: string, eventDetails: TabsPrimitive.Root.ChangeEventDetails) => void;
  value?: string;
};

type TabsContract = {
  activationMode: TabsActivationMode;
  direction: "ltr" | "rtl";
  orientation: "horizontal" | "vertical";
};

const TabsContractContext = React.createContext<TabsContract>({
  activationMode: "automatic",
  direction: "ltr",
  orientation: "horizontal",
});

function Tabs({
  activationMode = "automatic",
  className,
  defaultValue,
  dir,
  onValueChange,
  orientation = "horizontal",
  value,
  ...props
}: TabsProps) {
  const inheritedDirection = useDirection();
  const direction = dir ?? inheritedDirection;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const currentValue = value === undefined ? uncontrolledValue : value;

  const tabs = (
    <TabsContractContext.Provider value={{ activationMode, direction, orientation }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        dir={direction}
        orientation={orientation}
        value={currentValue ?? null}
        onValueChange={(nextValue, eventDetails) => {
          if (typeof nextValue !== "string") {
            return;
          }

          onValueChange?.(nextValue, eventDetails);
          if (!eventDetails.isCanceled && value === undefined) {
            setUncontrolledValue(nextValue);
          }
        }}
        className={cn(
          "group/tabs w-full data-[orientation=vertical]:flex data-[orientation=vertical]:gap-2",
          className,
        )}
        {...props}
      />
    </TabsContractContext.Provider>
  );

  return <DirectionProvider direction={direction}>{tabs}</DirectionProvider>;
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-base border-2 border-border bg-background p-1 text-foreground group-data-[orientation=horizontal]/tabs:h-12 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none data-[variant=line]:border-0 data-[variant=line]:bg-transparent",
  {
    variants: {
      variant: {
        default: "",
        line: "gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  activateOnFocus,
  className,
  loop = true,
  loopFocus,
  onKeyDown,
  variant = "default",
  ...props
}: Omit<TabsPrimitive.List.Props, "activateOnFocus" | "loopFocus"> &
  VariantProps<typeof tabsListVariants> & {
    activateOnFocus?: boolean;
    loop?: boolean;
    loopFocus?: boolean;
  }) {
  const { activationMode, direction, orientation } = React.useContext(TabsContractContext);

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      activateOnFocus={activateOnFocus ?? activationMode === "automatic"}
      loopFocus={loopFocus ?? loop}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.baseUIHandlerPrevented) {
          event.preventBaseUIHandler();
          return;
        }

        const target = (event.target as Element).closest<HTMLElement>('[role="tab"]');
        const list = event.currentTarget;
        if (target?.closest<HTMLElement>('[role="tablist"]') !== list) {
          return;
        }

        const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).filter(
          (tab) =>
            tab.closest<HTMLElement>('[role="tablist"]') === list &&
            !(tab instanceof HTMLButtonElement && tab.disabled) &&
            tab.getAttribute("aria-disabled") !== "true" &&
            !tab.hasAttribute("data-disabled"),
        );
        const currentIndex = tabs.indexOf(target);
        if (currentIndex === -1 || tabs.length === 0) {
          return;
        }

        const lastIndex = tabs.length - 1;
        const forwardKey =
          orientation === "vertical"
            ? "ArrowDown"
            : direction === "rtl"
              ? "ArrowLeft"
              : "ArrowRight";
        const backwardKey =
          orientation === "vertical" ? "ArrowUp" : direction === "rtl" ? "ArrowRight" : "ArrowLeft";
        let nextIndex = currentIndex;

        if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = lastIndex;
        } else if (event.key === forwardKey) {
          nextIndex =
            currentIndex === lastIndex ? ((loopFocus ?? loop) ? 0 : lastIndex) : currentIndex + 1;
        } else if (event.key === backwardKey) {
          nextIndex = currentIndex === 0 ? ((loopFocus ?? loop) ? lastIndex : 0) : currentIndex - 1;
        } else {
          return;
        }

        event.preventDefault();
        event.preventBaseUIHandler();
        tabs[nextIndex]?.focus();
      }}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, "value"> & {
  asChild?: boolean;
  children?: React.ReactNode;
  value: string;
};

const TabsTrigger = React.forwardRef<HTMLElement, TabsTriggerProps>(function TabsTrigger(
  { asChild = false, children, className, disabled, render, tabIndex, ...props },
  forwardedRef,
) {
  const child = React.Children.toArray(children).find(React.isValidElement);
  if (asChild && child === undefined) {
    throw new Error("TabsTrigger with asChild requires a valid React element child.");
  }

  return (
    <TabsPrimitive.Tab
      ref={forwardedRef}
      data-slot="tabs-trigger"
      disabled={disabled}
      render={asChild ? child : render}
      tabIndex={disabled ? -1 : tabIndex}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 rounded-base border-2 border-transparent px-2 py-1 text-sm font-heading whitespace-nowrap ring-offset-white transition-all group-data-[orientation=horizontal]/tabs:h-full group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:border-border data-active:bg-main data-active:text-main-foreground data-[state=active]:border-border data-[state=active]:bg-main data-[state=active]:text-main-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:data-active:border-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-foreground group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className,
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </TabsPrimitive.Tab>
  );
});

function TabsContent({
  className,
  forceMount,
  keepMounted,
  ...props
}: Omit<TabsPrimitive.Panel.Props, "keepMounted"> & {
  forceMount?: true;
  keepMounted?: boolean;
}) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      keepMounted={keepMounted ?? forceMount}
      className={cn(
        "mt-2 ring-offset-white outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };

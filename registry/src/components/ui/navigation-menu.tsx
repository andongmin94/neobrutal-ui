"use client";

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { ChevronDownIcon } from "lucide-react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

function NavigationMenu({
  children,
  className,
  ...props
}: NavigationMenuPrimitive.Root.Props<string>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      {...props}
      className={(state) =>
        cn(
          "group/navigation-menu relative z-10 flex max-w-max flex-1 items-center justify-center rounded-base border-2 border-border bg-main p-1 font-heading",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      {...props}
      className={(state) =>
        cn(
          "group flex flex-1 list-none items-center justify-center gap-1 font-heading",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

function NavigationMenuItem({ className, ...props }: NavigationMenuPrimitive.Item.Props) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      {...props}
      className={(state) =>
        cn("relative", typeof className === "function" ? className(state) : className)
      }
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-10 w-max items-center justify-center rounded-base bg-main px-4 py-2 text-sm font-heading text-main-foreground transition-colors outline-none focus:outline-none disabled:pointer-events-none disabled:opacity-50",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      {...props}
      className={(state) =>
        cn(
          navigationMenuTriggerStyle(),
          "group",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
      <NavigationMenuPrimitive.Icon
        data-slot="navigation-menu-icon"
        className="relative top-px ml-2 transition duration-200 group-data-popup-open/navigation-menu-trigger:rotate-180"
      >
        <ChevronDownIcon className="size-4" aria-hidden="true" />
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      {...props}
      className={(state) =>
        cn(
          "h-full w-auto p-2 pr-2.5 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction=down]:data-ending-style:-translate-y-1/2 data-[activation-direction=down]:data-starting-style:translate-y-1/2 data-[activation-direction=left]:data-ending-style:translate-x-1/2 data-[activation-direction=left]:data-starting-style:-translate-x-1/2 data-[activation-direction=right]:data-ending-style:-translate-x-1/2 data-[activation-direction=right]:data-starting-style:translate-x-1/2 data-[activation-direction=up]:data-ending-style:translate-y-1/2 data-[activation-direction=up]:data-starting-style:-translate-y-1/2 data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

function NavigationMenuViewport({ className, ...props }: NavigationMenuPrimitive.Viewport.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side="bottom"
        sideOffset={8}
        align="start"
        className="isolate z-50 max-w-(--available-width)"
      >
        <NavigationMenuPrimitive.Popup
          data-slot="navigation-menu-popup"
          className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden rounded-base bg-main text-main-foreground shadow-[inset_0_0_0_2px_var(--border)] transition-[opacity,transform,width,height,scale,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-90 data-starting-style:opacity-0"
        >
          <NavigationMenuPrimitive.Viewport
            data-slot="navigation-menu-viewport"
            {...props}
            className={(state) =>
              cn(
                "relative h-(--popup-height) w-(--popup-width)",
                typeof className === "function" ? className(state) : className,
              )
            }
          />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

function NavigationMenuLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      {...props}
      className={(state) =>
        cn(
          "block space-y-1 rounded-base p-2 leading-none no-underline transition-colors outline-none select-none focus-visible:ring-1 focus-visible:outline-none [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
};

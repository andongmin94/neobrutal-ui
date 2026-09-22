"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type DropdownMenuRootProps = MenuPrimitive.Root.Props & {
  dir?: "ltr" | "rtl";
};

type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    | "align"
    | "alignOffset"
    | "arrowPadding"
    | "collisionAvoidance"
    | "collisionBoundary"
    | "collisionPadding"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
    | "sticky"
  >;

function DropdownMenu({ dir, ...props }: DropdownMenuRootProps) {
  const menu = <MenuPrimitive.Root {...props} />;
  return dir ? <DirectionProvider direction={dir}>{menu}</DirectionProvider> : menu;
}

function DropdownMenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  align = "center",
  alignOffset = 0,
  arrowPadding = 0,
  children,
  className,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 0,
  disableAnchorTracking,
  positionMethod,
  side = "bottom",
  sideOffset = 4,
  sticky,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPortal>
      <MenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        arrowPadding={arrowPadding}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
        className="isolate z-50 outline-none"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          {...props}
          className={(state) =>
            cn(
              "z-50 min-w-[8rem] origin-(--transform-origin) overflow-hidden rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              typeof className === "function" ? className(state) : className,
            )
          }
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean;
}) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      role="presentation"
      className={cn("px-2 py-1.5 text-sm font-heading data-inset:pl-8", className)}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      {...props}
      className={(state) =>
        cn(
          "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden transition-colors select-none data-highlighted:border-border data-inset:pl-8 data-[variant=destructive]:bg-destructive data-[variant=destructive]:text-destructive-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      {...props}
      className={(state) =>
        cn(
          "flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden select-none data-highlighted:border-border data-inset:pl-8 data-popup-open:border-border [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      className={(state) =>
        cn(
          "w-auto min-w-[8rem] rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  closeOnClick = true,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      closeOnClick={closeOnClick}
      {...props}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-2 pl-8 text-sm font-base outline-hidden transition-colors select-none data-highlighted:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  closeOnClick = true,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      closeOnClick={closeOnClick}
      {...props}
      className={(state) =>
        cn(
          "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-2 pl-8 text-sm font-base outline-hidden transition-colors select-none data-highlighted:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      {...props}
      className={(state) =>
        cn("-mx-1 my-1 h-0.5 bg-border", typeof className === "function" ? className(state) : className)
      }
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ml-auto text-xs font-base tracking-widest", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

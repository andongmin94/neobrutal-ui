"use client";

import * as React from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MenubarValueContextValue = {
  setValue: (value: string) => void;
  value: string;
  valueRef: React.MutableRefObject<string>;
};

const MenubarValueContext = React.createContext<MenubarValueContextValue | null>(null);

type MenubarMenuContextValue = {
  defaultTriggerId: string;
  setTriggerId: React.Dispatch<React.SetStateAction<string>>;
};

const MenubarMenuContext = React.createContext<MenubarMenuContextValue | null>(null);

type CSSPropertiesWithVariables = React.CSSProperties & {
  [name: `--${string}`]: string | number | undefined;
};
type MenubarContentStyle = React.ComponentProps<typeof DropdownMenuContent>["style"];

const menubarCssVariables: CSSPropertiesWithVariables = {
  "--radix-menubar-content-available-height": "var(--available-height)",
  "--radix-menubar-content-available-width": "var(--available-width)",
  "--radix-menubar-content-transform-origin": "var(--transform-origin)",
  "--radix-menubar-trigger-height": "var(--anchor-height)",
  "--radix-menubar-trigger-width": "var(--anchor-width)",
};

function mergeContentStyle(style: MenubarContentStyle): MenubarContentStyle {
  if (typeof style === "function") {
    return (state) => ({ ...menubarCssVariables, ...style(state) });
  }

  return { ...menubarCssVariables, ...style };
}

function getAsChildElement(children: React.ReactNode, componentName: string) {
  const child = React.Children.toArray(children).find(React.isValidElement);

  if (!child) {
    throw new Error(`${componentName} with asChild requires a valid React element child.`);
  }

  return child as React.ReactElement<{
    [key: string]: unknown;
    children?: React.ReactNode;
  }>;
}

function useMenubarValueContext() {
  const context = React.useContext(MenubarValueContext);

  if (!context) {
    throw new Error("MenubarMenu must be used within Menubar");
  }
  return context;
}

type MenubarProps = Omit<MenubarPrimitive.Props, "dir" | "loopFocus" | "orientation"> & {
  asChild?: boolean;
  defaultValue?: string;
  dir?: "ltr" | "rtl";
  loop?: boolean;
  onValueChange?: (value: string) => void;
  value?: string;
};

function Menubar({
  asChild = false,
  children,
  className,
  defaultValue = "",
  dir,
  loop = true,
  onValueChange,
  render,
  value: valueProp,
  ...props
}: MenubarProps) {
  const controlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolledValue;
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (!controlled) {
        if (valueRef.current === nextValue) return;
        valueRef.current = nextValue;
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [controlled, onValueChange],
  );

  const context = React.useMemo<MenubarValueContextValue>(
    () => ({ setValue, value, valueRef }),
    [setValue, value],
  );
  const renderElement = asChild ? getAsChildElement(children, "Menubar") : render;

  const menubar = (
    <MenubarPrimitive
      data-slot="menubar"
      data-value={value || undefined}
      dir={dir}
      loopFocus={loop}
      render={renderElement}
      className={cn(
        "flex h-11 items-center gap-1 rounded-base border-2 border-border bg-main p-1 font-base",
        className,
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </MenubarPrimitive>
  );

  return (
    <MenubarValueContext.Provider value={context}>
      {dir ? <DirectionProvider direction={dir}>{menubar}</DirectionProvider> : menubar}
    </MenubarValueContext.Provider>
  );
}

type MenubarMenuProps = Omit<
  React.ComponentProps<typeof DropdownMenu>,
  "defaultOpen" | "onOpenChange" | "open"
> & {
  value?: string;
};

function MenubarMenu({ children, value: valueProp, ...props }: MenubarMenuProps) {
  const context = useMenubarValueContext();
  const generatedValue = React.useId();
  const value = valueProp ?? generatedValue;
  const defaultTriggerId = `${generatedValue}-trigger`;
  const [triggerId, setTriggerId] = React.useState(defaultTriggerId);
  const menuContext = React.useMemo<MenubarMenuContextValue>(
    () => ({ defaultTriggerId, setTriggerId }),
    [defaultTriggerId],
  );

  return (
    <MenubarMenuContext.Provider value={menuContext}>
      <DropdownMenu
        data-slot="menubar-menu"
        {...props}
        onOpenChange={(open) => {
          if (open) {
            context.setValue(value);
          } else if (context.valueRef.current === value) {
            context.setValue("");
          }
        }}
        open={context.value === value}
        triggerId={triggerId}
      >
        {children}
      </DropdownMenu>
    </MenubarMenuContext.Provider>
  );
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />;
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />;
}

function MenubarTrigger({
  className,
  id,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  const menuContext = React.useContext(MenubarMenuContext);
  const triggerId = id ?? menuContext?.defaultTriggerId;

  React.useLayoutEffect(() => {
    if (!menuContext || !triggerId) return undefined;

    menuContext.setTriggerId(triggerId);
    return () => {
      menuContext.setTriggerId((currentId) =>
        currentId === triggerId ? menuContext.defaultTriggerId : currentId,
      );
    };
  }, [menuContext, triggerId]);

  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      id={triggerId}
      className={cn(
        "flex cursor-default items-center rounded-base border-2 border-transparent px-3 py-1.5 text-sm font-heading text-main-foreground outline-hidden select-none hover:border-border aria-expanded:border-border data-open:border-border data-popup-open:border-border",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      style={mergeContentStyle(style)}
      className={cn(
        "min-w-[12rem] rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
        className,
      )}
      {...props}
    />
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/menubar-item gap-2 rounded-base border-2 border-transparent px-2 py-1.5 text-sm font-base focus:border-border data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuCheckboxItem>) {
  return (
    <DropdownMenuCheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-2 pl-8 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenuCheckboxItem>
  );
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />;
}

function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioItem>) {
  return (
    <DropdownMenuRadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-2 pl-8 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenuRadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-heading data-inset:pl-8", className)}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-0.5 bg-border", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      className={cn("ml-auto text-xs font-base tracking-widest", className)}
      {...props}
    />
  );
}

function MenubarSub({ ...props }: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuSubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "gap-2 rounded-base border-2 border-transparent px-2 py-1.5 text-sm font-base focus:border-border data-inset:pl-8 data-open:border-border data-popup-open:border-border [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSubContent({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      style={mergeContentStyle(style)}
      className={cn(
        "min-w-[8rem] rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};

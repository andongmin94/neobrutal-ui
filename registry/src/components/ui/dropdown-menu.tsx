"use client";

import * as React from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { ChevronRightIcon, CheckIcon } from "lucide-react";

type MenuLifecycleHandler<EventType extends Event = Event> = {
  bivarianceHack(event: EventType): void;
}["bivarianceHack"];

type MenuOutsideEvent = CustomEvent<{ originalEvent: Event }>;

type MenuContentLifecycleProps = {
  onCloseAutoFocus?: MenuLifecycleHandler;
  onEscapeKeyDown?: MenuLifecycleHandler<KeyboardEvent>;
  onFocusOutside?: MenuLifecycleHandler<MenuOutsideEvent>;
  onInteractOutside?: MenuLifecycleHandler<MenuOutsideEvent>;
  onOpenAutoFocus?: MenuLifecycleHandler;
  onPointerDownOutside?: MenuLifecycleHandler<MenuOutsideEvent>;
};

type MenuLifecycleHandlers = Pick<
  MenuContentLifecycleProps,
  "onEscapeKeyDown" | "onFocusOutside" | "onInteractOutside" | "onPointerDownOutside"
>;

type DropdownMenuAdapterContextValue = {
  lifecycleHandlersRef: React.MutableRefObject<MenuLifecycleHandlers>;
  open: boolean;
};

const DropdownMenuAdapterContext = React.createContext<DropdownMenuAdapterContextValue | null>(
  null,
);

type DropdownMenuRadioGroupContextValue = {
  setValue: (value: string) => void;
};

const DropdownMenuRadioGroupContext =
  React.createContext<DropdownMenuRadioGroupContextValue | null>(null);

type DropdownMenuRootProps = Omit<MenuPrimitive.Root.Props, "onOpenChange"> & {
  dir?: "ltr" | "rtl";
  onOpenChange?: (open: boolean) => void;
};

type DropdownMenuSubProps = Omit<MenuPrimitive.SubmenuRoot.Props, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

function useDropdownMenuAdapter(
  openProp: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const open = openProp ?? uncontrolledOpen;
  const lifecycleHandlersRef = React.useRef<MenuLifecycleHandlers>({});

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, eventDetails: MenuPrimitive.Root.ChangeEventDetails) => {
      const event = eventDetails.event;

      if (!nextOpen) {
        const handlers = lifecycleHandlersRef.current;
        let closeEvent: Event | undefined;

        if (eventDetails.reason === "escape-key") {
          handlers.onEscapeKeyDown?.(eventDetails.event);
          closeEvent = eventDetails.event;
        } else if (eventDetails.reason === "outside-press") {
          const outsideEvent = new CustomEvent<{ originalEvent: Event }>("pointerDownOutside", {
            cancelable: true,
            detail: { originalEvent: event },
          });
          handlers.onPointerDownOutside?.(outsideEvent);
          handlers.onInteractOutside?.(outsideEvent);
          closeEvent = outsideEvent;
        } else if (eventDetails.reason === "focus-out") {
          const outsideEvent = new CustomEvent<{ originalEvent: Event }>("focusOutside", {
            cancelable: true,
            detail: { originalEvent: event },
          });
          handlers.onFocusOutside?.(outsideEvent);
          handlers.onInteractOutside?.(outsideEvent);
          closeEvent = outsideEvent;
        }

        if (closeEvent?.defaultPrevented) {
          eventDetails.cancel();
          return;
        }
      }

      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, openProp],
  );

  const context = React.useMemo<DropdownMenuAdapterContextValue>(
    () => ({ lifecycleHandlersRef, open }),
    [open],
  );

  return { context, handleOpenChange };
}

function useMenuOpenAutoFocus(onOpenAutoFocus: MenuLifecycleHandler | undefined) {
  const adapter = React.useContext(DropdownMenuAdapterContext);
  const previouslyOpenRef = React.useRef(false);
  const [blockInitialFocus, setBlockInitialFocus] = React.useState(false);

  React.useLayoutEffect(() => {
    const open = adapter?.open ?? false;
    let firstFrame = 0;
    let secondFrame = 0;

    if (open && !previouslyOpenRef.current && onOpenAutoFocus) {
      const event = new Event("openAutoFocus", { cancelable: true });
      onOpenAutoFocus(event);

      if (event.defaultPrevented) {
        setBlockInitialFocus(true);
        if (typeof window.requestAnimationFrame === "function") {
          firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(() => setBlockInitialFocus(false));
          });
        } else {
          setBlockInitialFocus(false);
        }
      }
    } else if (!open) {
      setBlockInitialFocus(false);
    }

    previouslyOpenRef.current = open;
    return () => {
      if (typeof window.cancelAnimationFrame === "function") {
        if (firstFrame) window.cancelAnimationFrame(firstFrame);
        if (secondFrame) window.cancelAnimationFrame(secondFrame);
      }
    };
  }, [adapter, onOpenAutoFocus]);

  return blockInitialFocus;
}

type MenuItemOnClick = MenuPrimitive.Item.Props["onClick"];
type MenuItemClickEvent = Parameters<NonNullable<MenuItemOnClick>>[0];

function handleMenuItemSelect(
  event: MenuItemClickEvent,
  onClick: MenuItemOnClick,
  onSelect: MenuLifecycleHandler | undefined,
) {
  onClick?.(event);

  const selectEvent = new CustomEvent("menu.itemSelect", {
    bubbles: true,
    cancelable: true,
  });
  const item = event.currentTarget;
  const handleSelect = (customEvent: Event) => onSelect?.(customEvent);
  item.addEventListener(selectEvent.type, handleSelect, { once: true });
  item.dispatchEvent(selectEvent);

  if (selectEvent.defaultPrevented) {
    event.preventBaseUIHandler();
  }

  return selectEvent;
}

function DropdownMenu({
  children,
  defaultOpen,
  dir,
  onOpenChange,
  open,
  ...props
}: DropdownMenuRootProps) {
  const adapter = useDropdownMenuAdapter(open, defaultOpen, onOpenChange);
  const root = (
    <MenuPrimitive.Root
      data-slot="dropdown-menu"
      defaultOpen={defaultOpen}
      onOpenChange={adapter.handleOpenChange}
      open={open}
      {...props}
    >
      {children}
    </MenuPrimitive.Root>
  );

  return (
    <DropdownMenuAdapterContext.Provider value={adapter.context}>
      {dir ? <DirectionProvider direction={dir}>{root}</DirectionProvider> : root}
    </DropdownMenuAdapterContext.Provider>
  );
}

function DropdownMenuPortal({
  forceMount,
  keepMounted,
  ...props
}: MenuPrimitive.Portal.Props & { forceMount?: boolean }) {
  return (
    <MenuPrimitive.Portal
      data-slot="dropdown-menu-portal"
      keepMounted={forceMount ?? keepMounted}
      {...props}
    />
  );
}

function DropdownMenuTrigger({
  asChild = false,
  children,
  render,
  ...props
}: MenuPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" render={renderElement} {...props}>
      {asChild ? undefined : children}
    </MenuPrimitive.Trigger>
  );
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  finalFocus,
  forceMount,
  inert,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  MenuContentLifecycleProps & { forceMount?: boolean }) {
  const adapter = React.useContext(DropdownMenuAdapterContext);

  if (adapter) {
    adapter.lifecycleHandlersRef.current = {
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    };
  }

  const blockInitialFocus = useMenuOpenAutoFocus(onOpenAutoFocus);

  const adaptedFinalFocus: MenuPrimitive.Popup.Props["finalFocus"] = onCloseAutoFocus
    ? (closeType) => {
        const event = new Event("closeAutoFocus", { cancelable: true });
        onCloseAutoFocus(event);

        if (event.defaultPrevented) {
          return false;
        }
        if (typeof finalFocus === "function") {
          return finalFocus(closeType);
        }
        if (typeof finalFocus === "object" && finalFocus !== null) {
          return finalFocus.current;
        }
        return finalFocus ?? true;
      }
    : finalFocus;

  return (
    <MenuPrimitive.Portal keepMounted={forceMount}>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          finalFocus={adaptedFinalFocus}
          inert={inert || blockInitialFocus}
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
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
  onClick,
  onSelect,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  onSelect?: MenuLifecycleHandler;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      onClick={(event) => handleMenuItemSelect(event, onClick, onSelect)}
      {...props}
    />
  );
}

function DropdownMenuSub({
  children,
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: DropdownMenuSubProps) {
  const adapter = useDropdownMenuAdapter(open, defaultOpen, onOpenChange);

  return (
    <DropdownMenuAdapterContext.Provider value={adapter.context}>
      <MenuPrimitive.SubmenuRoot
        data-slot="dropdown-menu-sub"
        defaultOpen={defaultOpen}
        onOpenChange={adapter.handleOpenChange}
        open={open}
        {...props}
      >
        {children}
      </MenuPrimitive.SubmenuRoot>
    </DropdownMenuAdapterContext.Provider>
  );
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden select-none focus:border-border data-inset:pl-8 data-open:border-border data-popup-open:border-border [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
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
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "w-auto min-w-[8rem] rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

type DropdownMenuCheckboxItemProps = Omit<
  MenuPrimitive.CheckboxItem.Props,
  "checked" | "defaultChecked" | "onCheckedChange"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  inset?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: MenuLifecycleHandler;
};

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  defaultChecked = false,
  closeOnClick = true,
  inset,
  onCheckedChange,
  onClick,
  onSelect,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const controlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const currentChecked = checked ?? uncontrolledChecked;

  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-8 pl-8 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={currentChecked}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        handleMenuItemSelect(event, onClick, onSelect);
        const nextChecked = !currentChecked;
        if (!controlled) setUncontrolledChecked(nextChecked);
        onCheckedChange?.(nextChecked);
      }}
      {...props}
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

type DropdownMenuRadioGroupProps = Omit<
  MenuPrimitive.RadioGroup.Props,
  "defaultValue" | "onValueChange" | "value"
> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

function DropdownMenuRadioGroup({
  defaultValue,
  onValueChange,
  value: valueProp,
  ...props
}: DropdownMenuRadioGroupProps) {
  const controlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolledValue;
  const context = React.useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({
      setValue(nextValue) {
        if (!controlled) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
      },
    }),
    [controlled, onValueChange],
  );

  return (
    <DropdownMenuRadioGroupContext.Provider value={context}>
      <MenuPrimitive.RadioGroup
        data-slot="dropdown-menu-radio-group"
        value={value ?? null}
        {...props}
      />
    </DropdownMenuRadioGroupContext.Provider>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  closeOnClick = true,
  inset,
  onClick,
  onSelect,
  ...props
}: Omit<MenuPrimitive.RadioItem.Props, "value"> & {
  inset?: boolean;
  onSelect?: MenuLifecycleHandler;
  value: string;
}) {
  const radioGroup = React.useContext(DropdownMenuRadioGroupContext);
  if (!radioGroup) {
    throw new Error("DropdownMenuRadioItem must be used within DropdownMenuRadioGroup");
  }

  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-8 pl-8 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        handleMenuItemSelect(event, onClick, onSelect);
        radioGroup.setValue(props.value);
      }}
      {...props}
    >
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
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
      className={cn("-mx-1 my-1 h-0.5 bg-border", className)}
      {...props}
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

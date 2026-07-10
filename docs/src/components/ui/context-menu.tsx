"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { DirectionProvider } from "@base-ui/react/direction-provider";

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

type ContextMenuAdapterContextValue = {
  lifecycleHandlersRef: React.MutableRefObject<MenuLifecycleHandlers>;
  open: boolean;
};

const ContextMenuAdapterContext = React.createContext<ContextMenuAdapterContextValue | null>(null);

type ContextMenuRadioGroupContextValue = {
  setValue: (value: string) => void;
};

const ContextMenuRadioGroupContext = React.createContext<ContextMenuRadioGroupContextValue | null>(
  null,
);

type ContextMenuRootProps = Omit<ContextMenuPrimitive.Root.Props, "onOpenChange"> & {
  dir?: "ltr" | "rtl";
  onOpenChange?: (open: boolean) => void;
};

type ContextMenuSubProps = Omit<ContextMenuPrimitive.SubmenuRoot.Props, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

function useContextMenuAdapter(
  openProp: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const open = openProp ?? uncontrolledOpen;
  const lifecycleHandlersRef = React.useRef<MenuLifecycleHandlers>({});

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, eventDetails: ContextMenuPrimitive.Root.ChangeEventDetails) => {
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

  const context = React.useMemo<ContextMenuAdapterContextValue>(
    () => ({ lifecycleHandlersRef, open }),
    [open],
  );

  return { context, handleOpenChange };
}

function useMenuOpenAutoFocus(onOpenAutoFocus: MenuLifecycleHandler | undefined) {
  const adapter = React.useContext(ContextMenuAdapterContext);
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

type MenuItemOnClick = ContextMenuPrimitive.Item.Props["onClick"];
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

function ContextMenu({
  children,
  defaultOpen,
  dir,
  onOpenChange,
  open,
  ...props
}: ContextMenuRootProps) {
  const adapter = useContextMenuAdapter(open, defaultOpen, onOpenChange);
  const root = (
    <ContextMenuPrimitive.Root
      data-slot="context-menu"
      defaultOpen={defaultOpen}
      onOpenChange={adapter.handleOpenChange}
      open={open}
      {...props}
    >
      {children}
    </ContextMenuPrimitive.Root>
  );

  return (
    <ContextMenuAdapterContext.Provider value={adapter.context}>
      {dir ? <DirectionProvider direction={dir}>{root}</DirectionProvider> : root}
    </ContextMenuAdapterContext.Provider>
  );
}

function ContextMenuPortal({
  forceMount,
  keepMounted,
  ...props
}: ContextMenuPrimitive.Portal.Props & { forceMount?: boolean }) {
  return (
    <ContextMenuPrimitive.Portal
      data-slot="context-menu-portal"
      keepMounted={forceMount ?? keepMounted}
      {...props}
    />
  );
}

function ContextMenuTrigger({
  asChild = false,
  children,
  className,
  render,
  ...props
}: ContextMenuPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      render={renderElement}
      {...props}
    >
      {asChild ? undefined : children}
    </ContextMenuPrimitive.Trigger>
  );
}

function ContextMenuContent({
  className,
  align = "start",
  alignOffset = 4,
  side = "right",
  sideOffset = 0,
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
}: ContextMenuPrimitive.Popup.Props &
  Pick<ContextMenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  MenuContentLifecycleProps & { forceMount?: boolean }) {
  const adapter = React.useContext(ContextMenuAdapterContext);

  if (adapter) {
    adapter.lifecycleHandlersRef.current = {
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    };
  }

  const blockInitialFocus = useMenuOpenAutoFocus(onOpenAutoFocus);

  const adaptedFinalFocus: ContextMenuPrimitive.Popup.Props["finalFocus"] = onCloseAutoFocus
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
    <ContextMenuPrimitive.Portal keepMounted={forceMount}>
      <ContextMenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          finalFocus={adaptedFinalFocus}
          inert={inert || blockInitialFocus}
          className={cn(
            "z-50 max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuGroup({ ...props }: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean;
}) {
  return (
    <div
      data-slot="context-menu-label"
      data-inset={inset}
      role="presentation"
      className={cn("px-2 py-1.5 text-sm font-heading data-inset:pl-8", className)}
      {...props}
    />
  );
}

function ContextMenuItem({
  className,
  inset,
  onClick,
  onSelect,
  variant = "default",
  ...props
}: ContextMenuPrimitive.Item.Props & {
  inset?: boolean;
  onSelect?: MenuLifecycleHandler;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/context-menu-item relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      onClick={(event) => handleMenuItemSelect(event, onClick, onSelect)}
      {...props}
    />
  );
}

function ContextMenuSub({
  children,
  defaultOpen,
  onOpenChange,
  open,
  ...props
}: ContextMenuSubProps) {
  const adapter = useContextMenuAdapter(open, defaultOpen, onOpenChange);

  return (
    <ContextMenuAdapterContext.Provider value={adapter.context}>
      <ContextMenuPrimitive.SubmenuRoot
        data-slot="context-menu-sub"
        defaultOpen={defaultOpen}
        onOpenChange={adapter.handleOpenChange}
        open={open}
        {...props}
      >
        {children}
      </ContextMenuPrimitive.SubmenuRoot>
    </ContextMenuAdapterContext.Provider>
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden select-none focus:border-border data-inset:pl-8 data-open:border-border data-popup-open:border-border [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent({ ...props }: React.ComponentProps<typeof ContextMenuContent>) {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      className="shadow-none"
      side="right"
      {...props}
    />
  );
}

type ContextMenuCheckboxItemProps = Omit<
  ContextMenuPrimitive.CheckboxItem.Props,
  "checked" | "defaultChecked" | "onCheckedChange"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  inset?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: MenuLifecycleHandler;
};

function ContextMenuCheckboxItem({
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
}: ContextMenuCheckboxItemProps) {
  const controlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const currentChecked = checked ?? uncontrolledChecked;

  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
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
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

type ContextMenuRadioGroupProps = Omit<
  ContextMenuPrimitive.RadioGroup.Props,
  "defaultValue" | "onValueChange" | "value"
> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

function ContextMenuRadioGroup({
  defaultValue,
  onValueChange,
  value: valueProp,
  ...props
}: ContextMenuRadioGroupProps) {
  const controlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolledValue;
  const context = React.useMemo<ContextMenuRadioGroupContextValue>(
    () => ({
      setValue(nextValue) {
        if (!controlled) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
      },
    }),
    [controlled, onValueChange],
  );

  return (
    <ContextMenuRadioGroupContext.Provider value={context}>
      <ContextMenuPrimitive.RadioGroup
        data-slot="context-menu-radio-group"
        value={value ?? null}
        {...props}
      />
    </ContextMenuRadioGroupContext.Provider>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  closeOnClick = true,
  inset,
  onClick,
  onSelect,
  ...props
}: Omit<ContextMenuPrimitive.RadioItem.Props, "value"> & {
  inset?: boolean;
  onSelect?: MenuLifecycleHandler;
  value: string;
}) {
  const radioGroup = React.useContext(ContextMenuRadioGroupContext);
  if (!radioGroup) {
    throw new Error("ContextMenuRadioItem must be used within ContextMenuRadioGroup");
  }

  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
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
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuSeparator({ className, ...props }: ContextMenuPrimitive.Separator.Props) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-0.5 bg-border", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn("ml-auto text-xs font-base tracking-widest", className)}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

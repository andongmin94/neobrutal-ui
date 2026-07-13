"use client";

import * as React from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { ChevronRightIcon, CheckIcon, CircleIcon } from "lucide-react";

type MenuLifecycleHandler<EventType extends Event = Event> = {
  bivarianceHack(event: EventType): void;
}["bivarianceHack"];

type MenuOutsideEvent = CustomEvent<{ originalEvent: Event }>;

function setMenuOutsideEventTarget(event: Event, originalEvent: Event) {
  for (const property of ["target", "currentTarget"] as const) {
    Object.defineProperty(event, property, {
      configurable: true,
      value: originalEvent.target,
    });
  }
}

type MenuContentLifecycleProps = {
  onCloseAutoFocus?: MenuLifecycleHandler;
  onEscapeKeyDown?: MenuLifecycleHandler<KeyboardEvent>;
  onFocusOutside?: MenuLifecycleHandler<MenuOutsideEvent>;
  onInteractOutside?: MenuLifecycleHandler<MenuOutsideEvent>;
  onOpenAutoFocus?: MenuLifecycleHandler;
  onPointerDownOutside?: MenuLifecycleHandler<MenuOutsideEvent>;
};

type CheckedState = boolean | "indeterminate";
type CollisionBoundary =
  | MenuPrimitive.Positioner.Props["collisionBoundary"]
  | null
  | Array<Element | null>;
type CSSPropertiesWithVariables = React.CSSProperties & {
  [name: `--${string}`]: string | number | undefined;
};
type MenuPositioningProps = Pick<
  MenuPrimitive.Positioner.Props,
  | "align"
  | "alignOffset"
  | "arrowPadding"
  | "collisionAvoidance"
  | "collisionPadding"
  | "disableAnchorTracking"
  | "positionMethod"
  | "side"
  | "sideOffset"
> & {
  avoidCollisions?: boolean;
  collisionBoundary?: CollisionBoundary;
  hideWhenDetached?: boolean;
  sticky?: "partial" | "always";
  updatePositionStrategy?: "optimized" | "always";
};

const dropdownMenuCssVariables: CSSPropertiesWithVariables = {
  "--radix-dropdown-menu-content-available-height": "var(--available-height)",
  "--radix-dropdown-menu-content-available-width": "var(--available-width)",
  "--radix-dropdown-menu-content-transform-origin": "var(--transform-origin)",
  "--radix-dropdown-menu-trigger-height": "var(--anchor-height)",
  "--radix-dropdown-menu-trigger-width": "var(--anchor-width)",
};

function mergePopupStyle(
  style: MenuPrimitive.Popup.Props["style"],
): MenuPrimitive.Popup.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...dropdownMenuCssVariables, ...style(state) });
  }

  return { ...dropdownMenuCssVariables, ...style };
}

function normalizeCollisionBoundary(
  collisionBoundary: CollisionBoundary | undefined,
): MenuPrimitive.Positioner.Props["collisionBoundary"] {
  if (Array.isArray(collisionBoundary)) {
    const boundaries: Element[] = [];
    for (const boundary of collisionBoundary) {
      if (boundary) boundaries.push(boundary);
    }
    return boundaries;
  }

  return collisionBoundary ?? undefined;
}

function preserveRadixEventCancellation<
  Props extends { [key: string]: unknown; children?: React.ReactNode },
>(child: React.ReactElement<Props>): React.ReactElement<Props> {
  const eventProps: Record<string, unknown> = {};

  for (const [name, handler] of Object.entries(child.props)) {
    if (/^on[A-Z]/.test(name) && typeof handler === "function") {
      eventProps[name] = (...args: unknown[]) => {
        (handler as (...handlerArgs: unknown[]) => void)(...args);
        const event = args[0] as
          | { defaultPrevented?: boolean; preventBaseUIHandler?: () => void }
          | undefined;
        if (event?.defaultPrevented) event.preventBaseUIHandler?.();
      };
    }
  }

  return React.cloneElement(child, eventProps as Partial<Props>);
}

function getAsChildElement(children: React.ReactNode, componentName: string) {
  const child = React.Children.toArray(children).find(React.isValidElement);

  if (!child) {
    throw new Error(`${componentName} with asChild requires a valid React element child.`);
  }

  return preserveRadixEventCancellation(
    child as React.ReactElement<{
      [key: string]: unknown;
      children?: React.ReactNode;
      className?: string;
    }>,
  );
}

type MenuLifecycleHandlers = Pick<
  MenuContentLifecycleProps,
  "onEscapeKeyDown" | "onFocusOutside" | "onInteractOutside" | "onPointerDownOutside"
>;

type DropdownMenuAdapterContextValue = {
  lifecycleHandlersRef: React.MutableRefObject<MenuLifecycleHandlers>;
  open: boolean;
  setLoopFocus: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownMenuAdapterContext = React.createContext<DropdownMenuAdapterContextValue | null>(
  null,
);

type DropdownMenuRadioGroupContextValue = {
  setValue: (value: string) => void;
  value: string | undefined;
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
  const [loopFocus, setLoopFocus] = React.useState(false);
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
          setMenuOutsideEventTarget(outsideEvent, event);
          handlers.onPointerDownOutside?.(outsideEvent);
          handlers.onInteractOutside?.(outsideEvent);
          closeEvent = outsideEvent;
        } else if (eventDetails.reason === "focus-out") {
          const outsideEvent = new CustomEvent<{ originalEvent: Event }>("focusOutside", {
            cancelable: true,
            detail: { originalEvent: event },
          });
          setMenuOutsideEventTarget(outsideEvent, event);
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
    () => ({ lifecycleHandlersRef, open, setLoopFocus }),
    [open],
  );

  return { context, handleOpenChange, loopFocus };
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
  loopFocus,
  onOpenChange,
  open,
  ...props
}: DropdownMenuRootProps) {
  const adapter = useDropdownMenuAdapter(open, defaultOpen, onOpenChange);
  const root = (
    <MenuPrimitive.Root
      data-slot="dropdown-menu"
      defaultOpen={defaultOpen}
      loopFocus={loopFocus ?? adapter.loopFocus}
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
  const adapter = React.useContext(DropdownMenuAdapterContext);
  const renderElement = asChild ? getAsChildElement(children, "DropdownMenuTrigger") : render;

  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      data-state={adapter ? (adapter.open ? "open" : "closed") : undefined}
      render={renderElement}
      {...props}
    >
      {asChild ? undefined : children}
    </MenuPrimitive.Trigger>
  );
}

function DropdownMenuContent({
  align = "center",
  alignOffset = 0,
  arrowPadding = 0,
  asChild = false,
  avoidCollisions = true,
  children,
  side = "bottom",
  sideOffset = 4,
  className,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 0,
  disableAnchorTracking,
  finalFocus,
  forceMount,
  hideWhenDetached = false,
  inert,
  loop = false,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  positionMethod,
  render,
  sticky,
  style,
  updatePositionStrategy,
  ...props
}: MenuPrimitive.Popup.Props &
  MenuPositioningProps &
  MenuContentLifecycleProps & { asChild?: boolean; forceMount?: boolean; loop?: boolean }) {
  const adapter = React.useContext(DropdownMenuAdapterContext);
  const renderElement = asChild ? getAsChildElement(children, "DropdownMenuContent") : render;

  if (adapter) {
    adapter.lifecycleHandlersRef.current = {
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    };
  }

  const blockInitialFocus = useMenuOpenAutoFocus(onOpenAutoFocus);

  React.useLayoutEffect(() => {
    adapter?.setLoopFocus(loop);
  }, [adapter, loop]);

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
        align={align}
        alignOffset={alignOffset}
        arrowPadding={arrowPadding}
        collisionAvoidance={
          avoidCollisions
            ? collisionAvoidance
            : { align: "none", fallbackAxisSide: "none", side: "none" }
        }
        collisionBoundary={normalizeCollisionBoundary(collisionBoundary)}
        collisionPadding={collisionPadding}
        disableAnchorTracking={updatePositionStrategy === "always" ? false : disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky === undefined ? undefined : sticky === "always"}
        className={cn(
          "isolate z-50 outline-none",
          hideWhenDetached && "data-anchor-hidden:pointer-events-none data-anchor-hidden:invisible",
        )}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          data-state={adapter ? (adapter.open ? "open" : "closed") : undefined}
          finalFocus={adaptedFinalFocus}
          inert={inert || blockInitialFocus}
          render={renderElement}
          style={mergePopupStyle(style)}
          className={cn(
            "z-50 min-w-[8rem] origin-(--transform-origin) overflow-hidden rounded-base border-2 border-border bg-main p-1 font-base text-main-foreground duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {asChild ? undefined : children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  asChild = false,
  children,
  render,
  ...props
}: MenuPrimitive.Group.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "DropdownMenuGroup") : render;

  return (
    <MenuPrimitive.Group data-slot="dropdown-menu-group" render={renderElement} {...props}>
      {asChild ? undefined : children}
    </MenuPrimitive.Group>
  );
}

function DropdownMenuLabel({
  asChild = false,
  children,
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
  inset?: boolean;
}) {
  if (asChild) {
    const child = getAsChildElement(children, "DropdownMenuLabel");
    return React.cloneElement(child, {
      ...props,
      "data-inset": inset,
      "data-slot": "dropdown-menu-label",
      className: cn(
        "px-2 py-1.5 text-sm font-heading data-inset:pl-8",
        child.props.className,
        className,
      ),
      role: "presentation",
    });
  }

  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      role="presentation"
      className={cn("px-2 py-1.5 text-sm font-heading data-inset:pl-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  asChild = false,
  children,
  className,
  inset,
  label,
  onClick,
  onSelect,
  render,
  textValue,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  asChild?: boolean;
  inset?: boolean;
  onSelect?: MenuLifecycleHandler;
  textValue?: string;
  variant?: "default" | "destructive";
}) {
  const renderElement = asChild ? getAsChildElement(children, "DropdownMenuItem") : render;

  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      label={label ?? textValue}
      render={renderElement}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      onClick={(event) => handleMenuItemSelect(event, onClick, onSelect)}
      {...props}
    >
      {asChild ? undefined : children}
    </MenuPrimitive.Item>
  );
}

function DropdownMenuSub({
  children,
  defaultOpen,
  loopFocus,
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
        loopFocus={loopFocus ?? adapter.loopFocus}
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
  asChild = false,
  className,
  inset,
  children,
  label,
  render,
  textValue,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  asChild?: boolean;
  inset?: boolean;
  textValue?: string;
}) {
  const adapter = React.useContext(DropdownMenuAdapterContext);
  const child = asChild ? getAsChildElement(children, "DropdownMenuSubTrigger") : null;
  const triggerChildren = (
    <>
      {child ? child.props.children : children}
      <ChevronRightIcon className="ml-auto" />
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, triggerChildren) : render;

  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      data-state={adapter ? (adapter.open ? "open" : "closed") : undefined}
      label={label ?? textValue}
      render={renderElement}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden select-none focus:border-border data-inset:pl-8 data-open:border-border data-popup-open:border-border [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {child ? undefined : triggerChildren}
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
  asChild?: boolean;
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  inset?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: MenuLifecycleHandler;
  textValue?: string;
};

function DropdownMenuCheckboxItem({
  asChild = false,
  className,
  children,
  checked,
  defaultChecked = false,
  closeOnClick = true,
  inset,
  label,
  onCheckedChange,
  onClick,
  onSelect,
  render,
  textValue,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const controlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const currentChecked = checked ?? uncontrolledChecked;
  const child = asChild ? getAsChildElement(children, "DropdownMenuCheckboxItem") : null;
  const state =
    currentChecked === "indeterminate" ? "indeterminate" : currentChecked ? "checked" : "unchecked";
  const itemChildren = (
    <>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator
          data-state={state}
          keepMounted={currentChecked === "indeterminate"}
        >
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {child ? child.props.children : children}
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, itemChildren) : render;

  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      data-state={state}
      aria-checked={currentChecked === "indeterminate" ? "mixed" : currentChecked}
      label={label ?? textValue}
      render={renderElement}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-2 pl-8 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={currentChecked === true}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        handleMenuItemSelect(event, onClick, onSelect);
        const nextChecked = currentChecked === "indeterminate" ? true : !currentChecked;
        if (!controlled) setUncontrolledChecked(nextChecked);
        onCheckedChange?.(nextChecked);
      }}
      {...props}
    >
      {child ? undefined : itemChildren}
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
  asChild = false,
  children,
  defaultValue,
  onValueChange,
  render,
  value: valueProp,
  ...props
}: DropdownMenuRadioGroupProps & { asChild?: boolean }) {
  const controlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolledValue;
  const context = React.useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({
      setValue(nextValue) {
        if (!controlled) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
      },
      value,
    }),
    [controlled, onValueChange, value],
  );
  const renderElement = asChild ? getAsChildElement(children, "DropdownMenuRadioGroup") : render;

  return (
    <DropdownMenuRadioGroupContext.Provider value={context}>
      <MenuPrimitive.RadioGroup
        data-slot="dropdown-menu-radio-group"
        render={renderElement}
        value={value ?? null}
        {...props}
      >
        {asChild ? undefined : children}
      </MenuPrimitive.RadioGroup>
    </DropdownMenuRadioGroupContext.Provider>
  );
}

function DropdownMenuRadioItem({
  asChild = false,
  className,
  children,
  closeOnClick = true,
  inset,
  label,
  onClick,
  onSelect,
  render,
  textValue,
  ...props
}: Omit<MenuPrimitive.RadioItem.Props, "value"> & {
  asChild?: boolean;
  inset?: boolean;
  onSelect?: MenuLifecycleHandler;
  textValue?: string;
  value: string;
}) {
  const radioGroup = React.useContext(DropdownMenuRadioGroupContext);
  if (!radioGroup) {
    throw new Error("DropdownMenuRadioItem must be used within DropdownMenuRadioGroup");
  }
  const child = asChild ? getAsChildElement(children, "DropdownMenuRadioItem") : null;
  const state = radioGroup.value === props.value ? "checked" : "unchecked";
  const itemChildren = (
    <>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator data-state={state}>
          <CircleIcon className="size-2 fill-current" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {child ? child.props.children : children}
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, itemChildren) : render;

  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      data-state={state}
      label={label ?? textValue}
      render={renderElement}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-2 pl-8 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      closeOnClick={closeOnClick}
      onClick={(event) => {
        handleMenuItemSelect(event, onClick, onSelect);
        radioGroup.setValue(props.value);
      }}
      {...props}
    >
      {child ? undefined : itemChildren}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({
  asChild = false,
  children,
  className,
  render,
  ...props
}: MenuPrimitive.Separator.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "DropdownMenuSeparator") : render;

  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      render={renderElement}
      className={cn("-mx-1 my-1 h-0.5 bg-border", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </MenuPrimitive.Separator>
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

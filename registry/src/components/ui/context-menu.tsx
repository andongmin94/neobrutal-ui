"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { DirectionProvider } from "@base-ui/react/direction-provider";

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
  | ContextMenuPrimitive.Positioner.Props["collisionBoundary"]
  | null
  | Array<Element | null>;
type CSSPropertiesWithVariables = React.CSSProperties & {
  [name: `--${string}`]: string | number | undefined;
};
type MenuPositioningProps = Pick<
  ContextMenuPrimitive.Positioner.Props,
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

const contextMenuCssVariables: CSSPropertiesWithVariables = {
  "--radix-context-menu-content-available-height": "var(--available-height)",
  "--radix-context-menu-content-available-width": "var(--available-width)",
  "--radix-context-menu-content-transform-origin": "var(--transform-origin)",
  "--radix-context-menu-trigger-height": "var(--anchor-height)",
  "--radix-context-menu-trigger-width": "var(--anchor-width)",
};

function mergePopupStyle(
  style: ContextMenuPrimitive.Popup.Props["style"],
): ContextMenuPrimitive.Popup.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...contextMenuCssVariables, ...style(state) });
  }

  return { ...contextMenuCssVariables, ...style };
}

function normalizeCollisionBoundary(
  collisionBoundary: CollisionBoundary | undefined,
): ContextMenuPrimitive.Positioner.Props["collisionBoundary"] {
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

type ContextMenuAdapterContextValue = {
  lifecycleHandlersRef: React.MutableRefObject<MenuLifecycleHandlers>;
  open: boolean;
  setLoopFocus: React.Dispatch<React.SetStateAction<boolean>>;
  setTriggerDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const ContextMenuAdapterContext = React.createContext<ContextMenuAdapterContextValue | null>(null);

type ContextMenuRadioGroupContextValue = {
  setValue: (value: string) => void;
  value: string | undefined;
};

const ContextMenuRadioGroupContext = React.createContext<ContextMenuRadioGroupContextValue | null>(
  null,
);

type ContextMenuRootProps = Omit<ContextMenuPrimitive.Root.Props, "onOpenChange"> & {
  dir?: "ltr" | "rtl";
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const ContextMenuRootPrimitive = ContextMenuPrimitive.Root as React.ComponentType<
  ContextMenuPrimitive.Root.Props & { modal?: boolean }
>;

type ContextMenuSubProps = Omit<ContextMenuPrimitive.SubmenuRoot.Props, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

function useContextMenuAdapter(
  openProp: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const [loopFocus, setLoopFocus] = React.useState(false);
  const [triggerDisabled, setTriggerDisabled] = React.useState(false);
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

  const context = React.useMemo<ContextMenuAdapterContextValue>(
    () => ({ lifecycleHandlersRef, open, setLoopFocus, setTriggerDisabled }),
    [open],
  );

  return { context, handleOpenChange, loopFocus, triggerDisabled };
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
  disabled,
  loopFocus,
  modal = true,
  onOpenChange,
  open,
  ...props
}: ContextMenuRootProps) {
  const adapter = useContextMenuAdapter(open, defaultOpen, onOpenChange);
  const root = (
    <ContextMenuRootPrimitive
      data-slot="context-menu"
      defaultOpen={defaultOpen}
      disabled={disabled ?? adapter.triggerDisabled}
      loopFocus={loopFocus ?? adapter.loopFocus}
      modal={modal}
      onOpenChange={adapter.handleOpenChange}
      open={open}
      {...props}
    >
      {children}
    </ContextMenuRootPrimitive>
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
  disabled = false,
  onContextMenu,
  onTouchStart,
  render,
  ...props
}: ContextMenuPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const adapter = React.useContext(ContextMenuAdapterContext);
  const renderElement = asChild ? getAsChildElement(children, "ContextMenuTrigger") : render;
  const setTriggerDisabled = adapter?.setTriggerDisabled;

  React.useLayoutEffect(() => {
    setTriggerDisabled?.(disabled);
    return () => setTriggerDisabled?.(false);
  }, [disabled, setTriggerDisabled]);

  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      data-disabled={disabled ? "" : undefined}
      data-state={adapter ? (adapter.open ? "open" : "closed") : undefined}
      aria-disabled={disabled || undefined}
      className={cn("select-none", className)}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (disabled) event.preventBaseUIHandler();
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        if (disabled) event.preventBaseUIHandler();
      }}
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
  arrowPadding = 0,
  asChild = false,
  avoidCollisions = true,
  children,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 0,
  disableAnchorTracking,
  side = "right",
  sideOffset = 0,
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
}: ContextMenuPrimitive.Popup.Props &
  MenuPositioningProps &
  MenuContentLifecycleProps & { asChild?: boolean; forceMount?: boolean; loop?: boolean }) {
  const adapter = React.useContext(ContextMenuAdapterContext);
  const renderElement = asChild ? getAsChildElement(children, "ContextMenuContent") : render;

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
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
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
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuGroup({
  asChild = false,
  children,
  render,
  ...props
}: ContextMenuPrimitive.Group.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "ContextMenuGroup") : render;

  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" render={renderElement} {...props}>
      {asChild ? undefined : children}
    </ContextMenuPrimitive.Group>
  );
}

function ContextMenuLabel({
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
    const child = getAsChildElement(children, "ContextMenuLabel");
    return React.cloneElement(child, {
      ...props,
      "data-inset": inset,
      "data-slot": "context-menu-label",
      className: cn(
        "border-2 border-transparent px-2 py-1.5 text-sm font-base text-main-foreground data-inset:pl-8",
        child.props.className,
        className,
      ),
      role: "presentation",
    });
  }

  return (
    <div
      data-slot="context-menu-label"
      data-inset={inset}
      role="presentation"
      className={cn(
        "border-2 border-transparent px-2 py-1.5 text-sm font-base text-main-foreground data-inset:pl-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ContextMenuItem({
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
}: ContextMenuPrimitive.Item.Props & {
  asChild?: boolean;
  inset?: boolean;
  onSelect?: MenuLifecycleHandler;
  textValue?: string;
  variant?: "default" | "destructive";
}) {
  const renderElement = asChild ? getAsChildElement(children, "ContextMenuItem") : render;

  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      label={label ?? textValue}
      render={renderElement}
      className={cn(
        "group/context-menu-item relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent bg-main px-2 py-1.5 text-sm font-base outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      onClick={(event) => handleMenuItemSelect(event, onClick, onSelect)}
      {...props}
    >
      {asChild ? undefined : children}
    </ContextMenuPrimitive.Item>
  );
}

function ContextMenuSub({
  children,
  defaultOpen,
  loopFocus,
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
        loopFocus={loopFocus ?? adapter.loopFocus}
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
  asChild = false,
  className,
  inset,
  children,
  label,
  render,
  textValue,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
  asChild?: boolean;
  inset?: boolean;
  textValue?: string;
}) {
  const adapter = React.useContext(ContextMenuAdapterContext);
  const child = asChild ? getAsChildElement(children, "ContextMenuSubTrigger") : null;
  const triggerChildren = (
    <>
      {child ? child.props.children : children}
      <ChevronRightIcon className="ml-auto" />
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, triggerChildren) : render;

  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
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
  asChild?: boolean;
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  inset?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: MenuLifecycleHandler;
  textValue?: string;
};

function ContextMenuCheckboxItem({
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
}: ContextMenuCheckboxItemProps) {
  const controlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const currentChecked = checked ?? uncontrolledChecked;
  const child = asChild ? getAsChildElement(children, "ContextMenuCheckboxItem") : null;
  const state =
    currentChecked === "indeterminate" ? "indeterminate" : currentChecked ? "checked" : "unchecked";
  const itemChildren = (
    <>
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator
          data-state={state}
          keepMounted={currentChecked === "indeterminate"}
        >
          <CheckIcon />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {child ? child.props.children : children}
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, itemChildren) : render;

  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      data-state={state}
      aria-checked={currentChecked === "indeterminate" ? "mixed" : currentChecked}
      label={label ?? textValue}
      render={renderElement}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-2 pl-8 text-sm font-base text-main-foreground outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
  asChild = false,
  children,
  defaultValue,
  onValueChange,
  render,
  value: valueProp,
  ...props
}: ContextMenuRadioGroupProps & { asChild?: boolean }) {
  const controlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolledValue;
  const context = React.useMemo<ContextMenuRadioGroupContextValue>(
    () => ({
      setValue(nextValue) {
        if (!controlled) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
      },
      value,
    }),
    [controlled, onValueChange, value],
  );
  const renderElement = asChild ? getAsChildElement(children, "ContextMenuRadioGroup") : render;

  return (
    <ContextMenuRadioGroupContext.Provider value={context}>
      <ContextMenuPrimitive.RadioGroup
        data-slot="context-menu-radio-group"
        render={renderElement}
        value={value ?? null}
        {...props}
      >
        {asChild ? undefined : children}
      </ContextMenuPrimitive.RadioGroup>
    </ContextMenuRadioGroupContext.Provider>
  );
}

function ContextMenuRadioItem({
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
}: Omit<ContextMenuPrimitive.RadioItem.Props, "value"> & {
  asChild?: boolean;
  inset?: boolean;
  onSelect?: MenuLifecycleHandler;
  textValue?: string;
  value: string;
}) {
  const radioGroup = React.useContext(ContextMenuRadioGroupContext);
  if (!radioGroup) {
    throw new Error("ContextMenuRadioItem must be used within ContextMenuRadioGroup");
  }
  const child = asChild ? getAsChildElement(children, "ContextMenuRadioItem") : null;
  const state = radioGroup.value === props.value ? "checked" : "unchecked";
  const itemChildren = (
    <>
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator data-state={state}>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {child ? child.props.children : children}
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, itemChildren) : render;

  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      data-state={state}
      label={label ?? textValue}
      render={renderElement}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-2 pl-8 text-sm font-base text-main-foreground outline-hidden transition-colors select-none focus:border-border data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuSeparator({
  asChild = false,
  children,
  className,
  render,
  ...props
}: ContextMenuPrimitive.Separator.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "ContextMenuSeparator") : render;

  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      render={renderElement}
      className={cn("-mx-1 my-1 h-0.5 bg-border", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </ContextMenuPrimitive.Separator>
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

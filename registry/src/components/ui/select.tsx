"use client";

import * as React from "react";
// @ts-expect-error This registry intentionally omits the react-dom type package.
import { createPortal } from "react-dom";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { DirectionProvider } from "@base-ui/react/direction-provider";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";

type SelectProps = Omit<
  SelectPrimitive.Root.Props<string>,
  "defaultValue" | "onValueChange" | "value"
> & {
  defaultValue?: string;
  dir?: "ltr" | "rtl";
  onValueChange?: (value: string, eventDetails: SelectPrimitive.Root.ChangeEventDetails) => void;
  value?: string;
};

type SelectItemDefinition = {
  label: React.ReactNode;
  value: string;
};

type CollisionBoundary =
  | SelectPrimitive.Positioner.Props["collisionBoundary"]
  | null
  | Array<Element | null>;
type CSSPropertiesWithVariables = React.CSSProperties & {
  [name: `--${string}`]: string | number | undefined;
};
type SelectPositioningProps = Pick<
  SelectPrimitive.Positioner.Props,
  | "align"
  | "alignItemWithTrigger"
  | "alignOffset"
  | "anchor"
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

const selectCssVariables: CSSPropertiesWithVariables = {
  "--radix-select-content-available-height": "var(--available-height)",
  "--radix-select-content-available-width": "var(--available-width)",
  "--radix-select-content-transform-origin": "var(--transform-origin)",
  "--radix-select-trigger-height": "var(--anchor-height)",
  "--radix-select-trigger-width": "var(--anchor-width)",
};

type SelectPointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;

type SelectDismissHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: SelectPointerDownOutsideEvent) => void;
};

type SelectDismissContextValue = {
  currentValue: string | undefined;
  handlersRef: React.RefObject<SelectDismissHandlers>;
  open: boolean;
};

const SelectDismissContext = React.createContext<SelectDismissContextValue | null>(null);

function hasChildren(props: unknown): props is { children?: React.ReactNode } {
  return typeof props === "object" && props !== null && "children" in props;
}

function hasSelectItemProps(props: unknown): props is {
  children?: React.ReactNode;
  label?: React.ReactNode;
  textValue?: string;
  value: string;
} {
  return hasChildren(props) && "value" in props && typeof props.value === "string";
}

function collectSelectItems(children: React.ReactNode, items: SelectItemDefinition[] = []) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (hasSelectItemProps(child.props)) {
      items.push({
        label: child.props.label ?? child.props.textValue ?? child.props.children,
        value: child.props.value,
      });
      return;
    }

    if (hasChildren(child.props)) {
      collectSelectItems(child.props.children, items);
    }
  });

  return items;
}

function mergePopupStyle(
  style: SelectPrimitive.Popup.Props["style"],
): SelectPrimitive.Popup.Props["style"] {
  if (typeof style === "function") {
    return (state) => ({ ...selectCssVariables, ...style(state) });
  }

  return { ...selectCssVariables, ...style };
}

function normalizeCollisionBoundary(
  collisionBoundary: CollisionBoundary | undefined,
): SelectPrimitive.Positioner.Props["collisionBoundary"] {
  if (Array.isArray(collisionBoundary)) {
    const boundaries: Element[] = [];
    for (const boundary of collisionBoundary) {
      if (boundary) boundaries.push(boundary);
    }
    return boundaries;
  }

  return collisionBoundary ?? undefined;
}

function preserveRadixEventCancellation(
  child: React.ReactElement<{ [key: string]: unknown; children?: React.ReactNode }>,
) {
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

  return React.cloneElement(child, eventProps);
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
    }>,
  );
}

function setRefValue<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function toPointerEvent(originalEvent: Event) {
  if (originalEvent instanceof PointerEvent) {
    return originalEvent;
  }

  const mouseEvent = originalEvent instanceof MouseEvent ? originalEvent : undefined;
  return new PointerEvent(originalEvent.type, {
    altKey: mouseEvent?.altKey,
    bubbles: originalEvent.bubbles,
    button: mouseEvent?.button,
    buttons: mouseEvent?.buttons,
    cancelable: originalEvent.cancelable,
    clientX: mouseEvent?.clientX,
    clientY: mouseEvent?.clientY,
    composed: originalEvent.composed,
    ctrlKey: mouseEvent?.ctrlKey,
    metaKey: mouseEvent?.metaKey,
    pointerType:
      typeof TouchEvent !== "undefined" && originalEvent instanceof TouchEvent ? "touch" : "mouse",
    shiftKey: mouseEvent?.shiftKey,
  });
}

function createPointerDownOutsideEvent(name: string, originalEvent: Event) {
  const event = new CustomEvent<{ originalEvent: PointerEvent }>(name, {
    cancelable: true,
    detail: { originalEvent: toPointerEvent(originalEvent) },
  });

  Object.defineProperty(event, "target", {
    configurable: true,
    value: originalEvent.target,
  });

  return event;
}

function Select({
  children,
  defaultOpen = false,
  defaultValue,
  dir,
  form,
  inputRef,
  items,
  onOpenChange,
  onValueChange,
  open: openProp,
  value,
  ...props
}: SelectProps) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;
  const initialValueRef = React.useRef(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const dismissHandlersRef = React.useRef<SelectDismissHandlers>({});
  const [associatedForm, setAssociatedForm] = React.useState<HTMLFormElement | null>(null);
  const mergedInputRef = React.useCallback(
    (input: HTMLInputElement | null) => {
      setRefValue(inputRef, input);
      setAssociatedForm(input?.form ?? null);
    },
    [inputRef],
  );
  const resolvedItems = React.useMemo(
    () => items ?? collectSelectItems(children),
    [children, items],
  );

  React.useEffect(() => {
    if (isControlled || associatedForm === null) {
      return undefined;
    }

    const reset = () => setUncontrolledValue(initialValueRef.current);
    associatedForm.addEventListener("reset", reset);
    return () => associatedForm.removeEventListener("reset", reset);
  }, [associatedForm, isControlled]);

  const select = (
    <SelectDismissContext.Provider
      value={{ currentValue: currentValue ?? undefined, handlersRef: dismissHandlersRef, open }}
    >
      <SelectPrimitive.Root
        data-slot="select"
        defaultOpen={defaultOpen}
        form={form}
        inputRef={mergedInputRef}
        items={resolvedItems}
        open={openProp}
        value={currentValue ?? null}
        onOpenChange={(nextOpen, eventDetails) => {
          if (!nextOpen && eventDetails.reason === "escape-key") {
            const keyboardEvent = eventDetails.event;
            if (keyboardEvent instanceof KeyboardEvent) {
              dismissHandlersRef.current.onEscapeKeyDown?.(keyboardEvent);
              if (keyboardEvent.defaultPrevented) {
                eventDetails.cancel();
              }
            }
          } else if (!nextOpen && eventDetails.reason === "outside-press") {
            const outsideEvent = createPointerDownOutsideEvent(
              "select.pointerDownOutside",
              eventDetails.event,
            );
            dismissHandlersRef.current.onPointerDownOutside?.(outsideEvent);
            if (outsideEvent.defaultPrevented) {
              eventDetails.cancel();
            }
          }

          if (!eventDetails.isCanceled) {
            onOpenChange?.(nextOpen, eventDetails);
          }
          if (!eventDetails.isCanceled && openProp === undefined) {
            setUncontrolledOpen(nextOpen);
          }
        }}
        onValueChange={(nextValue, eventDetails) => {
          if (nextValue === null) {
            eventDetails.cancel();
            return;
          }

          onValueChange?.(nextValue, eventDetails);
          if (!eventDetails.isCanceled && !isControlled) {
            setUncontrolledValue(nextValue);
          }
        }}
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
    </SelectDismissContext.Provider>
  );

  return dir === undefined ? (
    select
  ) : (
    <DirectionProvider direction={dir}>{select}</DirectionProvider>
  );
}

function SelectGroup({
  asChild = false,
  children,
  className,
  render,
  ...props
}: SelectPrimitive.Group.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "SelectGroup") : render;

  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      render={renderElement}
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </SelectPrimitive.Group>
  );
}

function SelectValue({
  asChild = false,
  children,
  className,
  render,
  ...props
}: SelectPrimitive.Value.Props & { asChild?: boolean }) {
  const renderElement = asChild
    ? getAsChildElement(children as React.ReactNode, "SelectValue")
    : render;

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      render={renderElement}
      className={cn("flex flex-1 text-left", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </SelectPrimitive.Value>
  );
}

function SelectTrigger({
  asChild = false,
  className,
  size = "default",
  children,
  render,
  ...props
}: SelectPrimitive.Trigger.Props & {
  asChild?: boolean;
  size?: "sm" | "default";
}) {
  const selectContext = React.useContext(SelectDismissContext);
  const child = asChild ? getAsChildElement(children, "SelectTrigger") : null;
  const triggerChildren = (
    <>
      {child ? child.props.children : children}
      <SelectPrimitive.Icon
        render={<ChevronDownIcon className="pointer-events-none size-4 opacity-70" />}
      />
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, triggerChildren) : render;

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-state={selectContext ? (selectContext.open ? "open" : "closed") : undefined}
      render={renderElement}
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-base border-2 border-border bg-main px-3 py-2 text-sm font-base text-main-foreground ring-offset-white whitespace-nowrap outline-hidden transition-colors select-none placeholder:text-foreground/50 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-main-foreground/70 data-[size=sm]:h-9 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {child ? undefined : triggerChildren}
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  anchor,
  arrowPadding = 0,
  asChild = false,
  avoidCollisions = true,
  className,
  children,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding = 0,
  disableAnchorTracking,
  finalFocus,
  forceMount,
  hideWhenDetached = false,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  positionMethod,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger: alignItemWithTriggerProp,
  position,
  ref,
  render,
  sticky,
  style,
  updatePositionStrategy,
  ...props
}: SelectPrimitive.Popup.Props &
  SelectPositioningProps & {
    asChild?: boolean;
    forceMount?: true;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: SelectPointerDownOutsideEvent) => void;
    position?: "item-aligned" | "popper";
  }) {
  const dismissContext = React.useContext(SelectDismissContext);
  const [popupElement, setPopupElement] = React.useState<HTMLDivElement | null>(null);
  const mergedPopupRef = React.useCallback(
    (popup: HTMLDivElement | null) => {
      setPopupElement(popup);
      setRefValue(ref, popup);
    },
    [ref],
  );
  const resolvedPosition = position ?? "popper";
  const alignItemWithTrigger = alignItemWithTriggerProp ?? resolvedPosition !== "popper";
  const child = asChild ? getAsChildElement(children, "SelectContent") : null;
  const popupChildren = (
    <>
      <SelectScrollUpButton />
      <SelectPrimitive.List>{child ? child.props.children : children}</SelectPrimitive.List>
      <SelectScrollDownButton />
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, popupChildren) : render;
  const resolvedFinalFocus: SelectPrimitive.Popup.Props["finalFocus"] = onCloseAutoFocus
    ? (closeType) => {
        const event = new Event("select.closeAutoFocus", { cancelable: true });
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

  React.useLayoutEffect(() => {
    if (dismissContext === null) {
      return undefined;
    }

    const handlers = { onEscapeKeyDown, onPointerDownOutside };
    const handlersRef = dismissContext.handlersRef;
    handlersRef.current = handlers;
    return () => {
      if (handlersRef.current === handlers) {
        handlersRef.current = {};
      }
    };
  }, [dismissContext, onEscapeKeyDown, onPointerDownOutside]);

  React.useLayoutEffect(() => {
    if (!dismissContext?.open || dismissContext.currentValue !== undefined || !popupElement) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      popupElement
        .querySelector<HTMLElement>('[data-slot="select-item"]:not([data-disabled])')
        ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [dismissContext?.currentValue, dismissContext?.open, popupElement]);

  const positionedContent = (
    <SelectPrimitive.Positioner
      anchor={anchor}
      arrowPadding={arrowPadding}
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      collisionAvoidance={
        avoidCollisions
          ? collisionAvoidance
          : { align: "none", fallbackAxisSide: "none", side: "none" }
      }
      collisionBoundary={normalizeCollisionBoundary(collisionBoundary)}
      collisionPadding={collisionPadding}
      disableAnchorTracking={updatePositionStrategy === "always" ? false : disableAnchorTracking}
      positionMethod={positionMethod}
      sticky={sticky === undefined ? undefined : sticky === "always"}
      className={cn(
        "isolate z-50",
        hideWhenDetached && "data-anchor-hidden:pointer-events-none data-anchor-hidden:invisible",
      )}
    >
      <SelectPrimitive.Popup
        ref={mergedPopupRef}
        data-slot="select-content"
        data-align-trigger={alignItemWithTrigger}
        data-state={dismissContext ? (dismissContext.open ? "open" : "closed") : undefined}
        finalFocus={resolvedFinalFocus}
        render={renderElement}
        style={mergePopupStyle(style)}
        className={cn(
          "relative isolate z-50 max-h-96 w-[calc(var(--anchor-width)+4px)] min-w-[8rem] origin-(--transform-origin) overflow-hidden rounded-base border-2 border-border bg-main font-base text-main-foreground duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {child ? undefined : popupChildren}
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  );

  if (forceMount) {
    return typeof document === "undefined" ? null : createPortal(positionedContent, document.body);
  }

  return <SelectPrimitive.Portal>{positionedContent}</SelectPrimitive.Portal>;
}

function SelectLabel({
  asChild = false,
  children,
  className,
  render,
  ...props
}: SelectPrimitive.GroupLabel.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "SelectLabel") : render;

  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      render={renderElement}
      className={cn(
        "border-2 border-transparent py-1.5 pr-8 pl-2 text-sm font-base text-main-foreground/80",
        className,
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </SelectPrimitive.GroupLabel>
  );
}

function SelectItem({
  asChild = false,
  className,
  children,
  label,
  render,
  textValue,
  value,
  ...props
}: SelectPrimitive.Item.Props & { asChild?: boolean; textValue?: string; value: string }) {
  const selectContext = React.useContext(SelectDismissContext);
  const child = asChild ? getAsChildElement(children, "SelectItem") : null;
  const state = selectContext?.currentValue === value ? "checked" : "unchecked";
  const itemChildren = (
    <>
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {child ? child.props.children : children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        data-state={state}
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </>
  );
  const renderElement = child ? React.cloneElement(child, undefined, itemChildren) : render;

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      data-state={state}
      label={label ?? textValue}
      render={renderElement}
      value={value}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-8 pl-2 text-sm font-base outline-hidden select-none focus:border-border data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      {child ? undefined : itemChildren}
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  asChild = false,
  children,
  className,
  render,
  ...props
}: SelectPrimitive.Separator.Props & { asChild?: boolean }) {
  const renderElement = asChild ? getAsChildElement(children, "SelectSeparator") : render;

  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      render={renderElement}
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </SelectPrimitive.Separator>
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-main py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-main py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

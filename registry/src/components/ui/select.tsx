"use client";

import * as React from "react";
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

type SelectPointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;

type SelectDismissHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: SelectPointerDownOutsideEvent) => void;
};

type SelectDismissContextValue = {
  handlersRef: React.RefObject<SelectDismissHandlers>;
};

const SelectDismissContext = React.createContext<SelectDismissContextValue | null>(null);

function hasChildren(props: unknown): props is { children?: React.ReactNode } {
  return typeof props === "object" && props !== null && "children" in props;
}

function hasSelectItemProps(
  props: unknown,
): props is { children?: React.ReactNode; label?: React.ReactNode; value: string } {
  return hasChildren(props) && "value" in props && typeof props.value === "string";
}

function collectSelectItems(children: React.ReactNode, items: SelectItemDefinition[] = []) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (hasSelectItemProps(child.props)) {
      items.push({ label: child.props.label ?? child.props.children, value: child.props.value });
      return;
    }

    if (hasChildren(child.props)) {
      collectSelectItems(child.props.children, items);
    }
  });

  return items;
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
  defaultValue,
  dir,
  form,
  inputRef,
  items,
  onOpenChange,
  onValueChange,
  value,
  ...props
}: SelectProps) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;
  const initialValueRef = React.useRef(defaultValue);
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
    <SelectDismissContext.Provider value={{ handlersRef: dismissHandlersRef }}>
      <SelectPrimitive.Root
        form={form}
        inputRef={mergedInputRef}
        items={resolvedItems}
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

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-base border-2 border-border bg-main px-3 py-2 text-sm font-base text-main-foreground ring-offset-white whitespace-nowrap outline-hidden transition-colors select-none placeholder:text-foreground/50 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-main-foreground/70 data-[size=sm]:h-9 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={<ChevronDownIcon className="pointer-events-none size-4 opacity-70" />}
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  anchor,
  arrowPadding,
  className,
  children,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking,
  finalFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  positionMethod,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger: alignItemWithTriggerProp,
  position,
  sticky,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    | "align"
    | "alignItemWithTrigger"
    | "alignOffset"
    | "anchor"
    | "arrowPadding"
    | "collisionAvoidance"
    | "collisionBoundary"
    | "collisionPadding"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
    | "sticky"
  > & {
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: SelectPointerDownOutsideEvent) => void;
    position?: "item-aligned" | "popper";
  }) {
  const dismissContext = React.useContext(SelectDismissContext);
  const resolvedPosition = position ?? "popper";
  const alignItemWithTrigger = alignItemWithTriggerProp ?? resolvedPosition !== "popper";
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

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        anchor={anchor}
        arrowPadding={arrowPadding}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        sticky={sticky}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          finalFocus={resolvedFinalFocus}
          className={cn(
            "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-[8rem] origin-(--transform-origin) overflow-hidden rounded-base border-2 border-border bg-main font-base text-main-foreground duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-sm font-heading", className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-base border-2 border-transparent py-1.5 pr-8 pl-2 text-sm font-base outline-hidden select-none focus:border-border data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-0.5 bg-border", className)}
      {...props}
    />
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

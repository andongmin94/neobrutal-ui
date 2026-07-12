"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AutoFocusEventHandler = (event: Event) => void;
type FocusTarget = AlertDialogPrimitive.Popup.Props["initialFocus"];
type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
type DismissableLayerHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: FocusOutsideEvent | PointerDownOutsideEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
};
type AlertDialogPortalProps = AlertDialogPrimitive.Portal.Props & {
  forceMount?: boolean;
};
type AlertDialogOverlayProps = AlertDialogPrimitive.Backdrop.Props & {
  forceMount?: boolean;
};
type AlertDialogContentProps = AlertDialogPrimitive.Popup.Props & {
  forceMount?: boolean;
  onCloseAutoFocus?: AutoFocusEventHandler;
  onOpenAutoFocus?: AutoFocusEventHandler;
  size?: "default" | "sm";
} & DismissableLayerHandlers;
type AlertDialogButtonProps = React.ComponentProps<typeof AlertDialogPrimitive.Close> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size"> & {
    asChild?: boolean;
    children?: React.ReactNode;
  };
type AlertDialogContextProps = {
  cancelRef: React.RefObject<HTMLButtonElement | null>;
  dismissableLayerHandlersRef: React.RefObject<DismissableLayerHandlers>;
};

const AlertDialogContext = React.createContext<AlertDialogContextProps | null>(null);

function useAlertDialogContext() {
  const context = React.useContext(AlertDialogContext);

  if (!context) {
    throw new Error("AlertDialog components must be used within AlertDialog.");
  }

  return context;
}

function createPointerEvent(event: MouseEvent | PointerEvent | TouchEvent): PointerEvent {
  if ("pointerId" in event) {
    return event;
  }

  const touch = "changedTouches" in event ? event.changedTouches[0] : undefined;
  const ownerDocument = event.target instanceof Node ? event.target.ownerDocument : null;
  const view = ownerDocument?.defaultView ?? window;
  const PointerEventConstructor = view?.PointerEvent;

  if (!PointerEventConstructor) {
    return event as PointerEvent;
  }

  return new PointerEventConstructor("pointerdown", {
    bubbles: event.bubbles,
    button: "button" in event ? event.button : 0,
    buttons: "buttons" in event ? event.buttons : 1,
    cancelable: event.cancelable,
    clientX: touch?.clientX ?? ("clientX" in event ? event.clientX : 0),
    clientY: touch?.clientY ?? ("clientY" in event ? event.clientY : 0),
    composed: event.composed,
    ctrlKey: "ctrlKey" in event && event.ctrlKey,
    metaKey: "metaKey" in event && event.metaKey,
    pointerType: "changedTouches" in event ? "touch" : "mouse",
    shiftKey: "shiftKey" in event && event.shiftKey,
  });
}

function createPointerDownOutsideEvent(
  originalEvent: MouseEvent | PointerEvent | TouchEvent,
): PointerDownOutsideEvent {
  const event = new CustomEvent<{ originalEvent: PointerEvent }>(
    "dismissableLayer.pointerDownOutside",
    {
      cancelable: true,
      detail: { originalEvent: createPointerEvent(originalEvent) },
    },
  );
  Object.defineProperty(event, "target", { configurable: true, value: originalEvent.target });
  return event;
}

function createFocusOutsideEvent(originalEvent: FocusEvent | KeyboardEvent): FocusOutsideEvent {
  const focusEvent =
    "relatedTarget" in originalEvent
      ? originalEvent
      : new FocusEvent("focusin", { bubbles: true, cancelable: true });
  const event = new CustomEvent<{ originalEvent: FocusEvent }>("dismissableLayer.focusOutside", {
    cancelable: true,
    detail: { originalEvent: focusEvent },
  });
  Object.defineProperty(event, "target", { configurable: true, value: originalEvent.target });
  return event;
}

function adaptDismissableLayerEvent(
  eventDetails: AlertDialogPrimitive.Root.ChangeEventDetails,
  handlers: DismissableLayerHandlers,
) {
  if (eventDetails.reason === "escape-key") {
    handlers.onEscapeKeyDown?.(eventDetails.event);
    if (eventDetails.event.defaultPrevented) {
      eventDetails.cancel();
    }
    return;
  }

  if (eventDetails.reason === "outside-press") {
    const event = createPointerDownOutsideEvent(eventDetails.event);
    handlers.onPointerDownOutside?.(event);
    handlers.onInteractOutside?.(event);
    if (event.defaultPrevented) {
      eventDetails.cancel();
    }
    return;
  }

  if (eventDetails.reason === "focus-out") {
    const event = createFocusOutsideEvent(eventDetails.event);
    handlers.onFocusOutside?.(event);
    handlers.onInteractOutside?.(event);
    if (event.defaultPrevented) {
      eventDetails.cancel();
    }
  }
}

function adaptCloseClick(
  handler: AlertDialogPrimitive.Close.Props["onClick"],
): AlertDialogPrimitive.Close.Props["onClick"] {
  if (!handler) {
    return undefined;
  }

  return (event) => {
    handler(event);
    if (event.defaultPrevented) {
      event.preventBaseUIHandler();
    }
  };
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function hasForceMountedChild(children: React.ReactNode) {
  return React.Children.toArray(children).some(
    (child) => React.isValidElement<{ forceMount?: boolean }>(child) && child.props.forceMount,
  );
}

function adaptAutoFocus(
  handler: AutoFocusEventHandler | undefined,
  focus: FocusTarget,
  eventName: string,
): FocusTarget {
  if (!handler) {
    return focus;
  }

  return (interactionType) => {
    const event = new Event(eventName, { cancelable: true });
    handler(event);

    if (event.defaultPrevented) {
      return false;
    }

    if (typeof focus === "function") {
      return focus(interactionType);
    }

    if (typeof focus === "object" && focus !== null) {
      return focus.current;
    }

    return focus ?? true;
  };
}

function AlertDialog({ onOpenChange, ...props }: AlertDialogPrimitive.Root.Props) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const dismissableLayerHandlersRef = React.useRef<DismissableLayerHandlers>({});
  const contextValue = React.useMemo(() => ({ cancelRef, dismissableLayerHandlersRef }), []);

  const handleOpenChange: NonNullable<AlertDialogPrimitive.Root.Props["onOpenChange"]> = (
    open,
    eventDetails,
  ) => {
    if (!open) {
      adaptDismissableLayerEvent(eventDetails, dismissableLayerHandlersRef.current);
    }
    if (eventDetails.isCanceled) {
      return;
    }
    onOpenChange?.(open, eventDetails);
  };

  return (
    <AlertDialogContext.Provider value={contextValue}>
      <AlertDialogPrimitive.Root
        data-slot="alert-dialog"
        {...props}
        onOpenChange={handleOpenChange}
      />
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({
  asChild = false,
  children,
  render,
  ...props
}: AlertDialogPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      render={renderElement}
      {...props}
    >
      {asChild ? undefined : children}
    </AlertDialogPrimitive.Trigger>
  );
}

function AlertDialogPortal({ forceMount, keepMounted, ...props }: AlertDialogPortalProps) {
  const keepPortalMounted = forceMount ?? (hasForceMountedChild(props.children) || keepMounted);

  return (
    <AlertDialogPrimitive.Portal
      data-slot="alert-dialog-portal"
      keepMounted={keepPortalMounted}
      {...props}
    />
  );
}

function AlertDialogOverlay({
  className,
  forceMount: _forceMount,
  ...props
}: AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-overlay duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  finalFocus,
  forceMount,
  initialFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  size = "default",
  ...props
}: AlertDialogContentProps) {
  const { cancelRef, dismissableLayerHandlersRef } = useAlertDialogContext();
  const dismissableLayerHandlers = React.useMemo(
    () => ({ onEscapeKeyDown, onFocusOutside, onInteractOutside, onPointerDownOutside }),
    [onEscapeKeyDown, onFocusOutside, onInteractOutside, onPointerDownOutside],
  );
  const defaultInitialFocus = React.useCallback(() => cancelRef.current ?? false, [cancelRef]);
  dismissableLayerHandlersRef.current = dismissableLayerHandlers;

  React.useEffect(
    () => () => {
      if (dismissableLayerHandlersRef.current === dismissableLayerHandlers) {
        dismissableLayerHandlersRef.current = {};
      }
    },
    [dismissableLayerHandlers, dismissableLayerHandlersRef],
  );

  return (
    <AlertDialogPortal forceMount={forceMount}>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        initialFocus={adaptAutoFocus(
          onOpenAutoFocus,
          initialFocus === undefined ? defaultInitialFocus : initialFocus,
          "focusScope.autoFocusOnMount",
        )}
        finalFocus={adaptAutoFocus(onCloseAutoFocus, finalFocus, "focusScope.autoFocusOnUnmount")}
        className={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-base border-2 border-border bg-background p-6 text-foreground shadow-shadow duration-200 outline-none data-[size=default]:sm:max-w-lg data-[size=sm]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-base border-2 border-border bg-main text-main-foreground shadow-shadow *:[svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("font-heading text-lg", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm font-base text-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  asChild = false,
  children,
  className,
  onClick,
  render,
  size = "default",
  variant = "default",
  ...props
}: AlertDialogButtonProps) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : (render ?? <Button variant={variant} size={size} />);

  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-action"
      className={cn(className)}
      onClick={adaptCloseClick(onClick)}
      render={renderElement}
      {...props}
    >
      {asChild ? undefined : children}
    </AlertDialogPrimitive.Close>
  );
}

function AlertDialogCancel({
  className,
  variant = "neutral",
  size = "default",
  asChild = false,
  children,
  onClick,
  ref: forwardedRef,
  render,
  ...props
}: AlertDialogButtonProps) {
  const { cancelRef } = useAlertDialogContext();
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : (render ?? <Button variant={variant} size={size} />);
  const composedRef = React.useCallback(
    (element: HTMLButtonElement | null) => {
      cancelRef.current = element;
      setRef(forwardedRef, element);
    },
    [cancelRef, forwardedRef],
  );

  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      onClick={adaptCloseClick(onClick)}
      ref={composedRef}
      render={renderElement}
      {...props}
    >
      {asChild ? undefined : children}
    </AlertDialogPrimitive.Close>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};

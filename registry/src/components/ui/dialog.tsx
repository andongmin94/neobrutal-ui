"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

type AutoFocusEventHandler = (event: Event) => void;
type FocusTarget = DialogPrimitive.Popup.Props["initialFocus"];
type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
type DismissableLayerHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  onInteractOutside?: (event: FocusOutsideEvent | PointerDownOutsideEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
};
type DialogPortalProps = DialogPrimitive.Portal.Props & {
  forceMount?: boolean;
};
type DialogOverlayProps = DialogPrimitive.Backdrop.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: boolean;
};
type DialogContentProps = DialogPrimitive.Popup.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
  forceMount?: boolean;
  onCloseAutoFocus?: AutoFocusEventHandler;
  onOpenAutoFocus?: AutoFocusEventHandler;
  showCloseButton?: boolean;
} & DismissableLayerHandlers;
type DialogContextProps = {
  dismissableLayerHandlersRef: React.RefObject<DismissableLayerHandlers>;
  open: boolean;
};

type PreventableBaseUIEvent = {
  readonly baseUIHandlerPrevented?: boolean;
  readonly defaultPrevented?: boolean;
  preventBaseUIHandler?: () => void;
};
type EventHandler = (...args: unknown[]) => unknown;
type RenderFunction = (props: Record<string, unknown>, state: unknown) => React.ReactElement;

function adaptEventHandlers(props: Record<string, unknown>, beforeBaseUIHandler: boolean) {
  const eventHandlers: Record<string, EventHandler> = {};

  for (const [name, handler] of Object.entries(props)) {
    if (!/^on[A-Z]/.test(name) || typeof handler !== "function") {
      continue;
    }

    eventHandlers[name] = (...args) => {
      const event = args[0] as PreventableBaseUIEvent | undefined;
      if (beforeBaseUIHandler && event?.defaultPrevented) {
        event.preventBaseUIHandler?.();
      }
      if (beforeBaseUIHandler && event?.baseUIHandlerPrevented) {
        return undefined;
      }

      const result = handler(...args);
      if (!beforeBaseUIHandler && event?.defaultPrevented) {
        event.preventBaseUIHandler?.();
      }
      return result;
    };
  }

  return eventHandlers;
}

function adaptRenderEventHandlers<Render>(render: Render): Render {
  if (React.isValidElement(render)) {
    const element = render as React.ReactElement<Record<string, unknown>>;
    const eventHandlers = adaptEventHandlers(element.props, false);
    return (Object.keys(eventHandlers).length === 0
      ? render
      : React.cloneElement(element, eventHandlers)) as unknown as Render;
  }
  if (typeof render === "function") {
    const renderFunction = render as RenderFunction;
    return ((props: Record<string, unknown>, state: unknown) =>
      renderFunction({ ...props, ...adaptEventHandlers(props, true) }, state)) as unknown as Render;
  }
  return render;
}

const DialogContext = React.createContext<DialogContextProps | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must be used within Dialog.");
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
  eventDetails: DialogPrimitive.Root.ChangeEventDetails,
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
  handler: DialogPrimitive.Close.Props["onClick"],
): DialogPrimitive.Close.Props["onClick"] {
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

function Dialog({ defaultOpen = false, onOpenChange, open, ...props }: DialogPrimitive.Root.Props) {
  const dismissableLayerHandlersRef = React.useRef<DismissableLayerHandlers>({});
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const resolvedOpen = open ?? uncontrolledOpen;
  const contextValue = React.useMemo(
    () => ({ dismissableLayerHandlersRef, open: resolvedOpen }),
    [resolvedOpen],
  );

  const handleOpenChange: NonNullable<DialogPrimitive.Root.Props["onOpenChange"]> = (
    nextOpen,
    eventDetails,
  ) => {
    if (!nextOpen) {
      adaptDismissableLayerEvent(eventDetails, dismissableLayerHandlersRef.current);
    }
    if (eventDetails.isCanceled) {
      return;
    }
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen, eventDetails);
  };

  return (
    <DialogContext.Provider value={contextValue}>
      <DialogPrimitive.Root
        data-slot="dialog"
        defaultOpen={defaultOpen}
        open={open}
        {...props}
        onOpenChange={handleOpenChange}
      />
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  asChild = false,
  children,
  render,
  ...props
}: DialogPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const { open } = useDialogContext();
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      data-state={open ? "open" : "closed"}
      render={adaptRenderEventHandlers(renderElement)}
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Trigger>
  );
}

function DialogPortal({ forceMount, keepMounted, ...props }: DialogPortalProps) {
  const keepPortalMounted = forceMount ?? (hasForceMountedChild(props.children) || keepMounted);

  return (
    <DialogPrimitive.Portal data-slot="dialog-portal" keepMounted={keepPortalMounted} {...props} />
  );
}

function DialogClose({
  asChild = false,
  children,
  onClick,
  render,
  ...props
}: DialogPrimitive.Close.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      onClick={adaptCloseClick(onClick)}
      render={adaptRenderEventHandlers(renderElement)}
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Close>
  );
}

function DialogOverlay({
  asChild = false,
  children,
  className,
  forceMount: _forceMount,
  render,
  ...props
}: DialogOverlayProps) {
  const { open } = useDialogContext();
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      data-state={open ? "open" : "closed"}
      render={adaptRenderEventHandlers(renderElement)}
      className={cn(
        "fixed inset-0 isolate z-50 bg-overlay duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Backdrop>
  );
}

function DialogContent({
  asChild = false,
  className,
  children,
  finalFocus,
  forceMount,
  initialFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onPointerDownOutside,
  render,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  const { dismissableLayerHandlersRef, open } = useDialogContext();
  const dismissableLayerHandlers = React.useMemo(
    () => ({ onEscapeKeyDown, onFocusOutside, onInteractOutside, onPointerDownOutside }),
    [onEscapeKeyDown, onFocusOutside, onInteractOutside, onPointerDownOutside],
  );
  dismissableLayerHandlersRef.current = dismissableLayerHandlers;

  const closeButton = showCloseButton ? (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      render={<Button variant="ghost" className="absolute top-4 right-4" size="icon-sm" />}
    >
      <XIcon />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  ) : null;
  const contentChild = React.Children.toArray(children).find(
    React.isValidElement,
  ) as React.ReactElement<{ children?: React.ReactNode }>;
  const renderElement = asChild
    ? React.cloneElement(contentChild, undefined, contentChild.props.children, closeButton)
    : render;

  React.useEffect(
    () => () => {
      if (dismissableLayerHandlersRef.current === dismissableLayerHandlers) {
        dismissableLayerHandlersRef.current = {};
      }
    },
    [dismissableLayerHandlers, dismissableLayerHandlersRef],
  );

  return (
    <DialogPortal forceMount={forceMount}>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-state={open ? "open" : "closed"}
        render={adaptRenderEventHandlers(renderElement)}
        initialFocus={adaptAutoFocus(onOpenAutoFocus, initialFocus, "focusScope.autoFocusOnMount")}
        finalFocus={adaptAutoFocus(onCloseAutoFocus, finalFocus, "focusScope.autoFocusOnUnmount")}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-base border-2 border-border bg-background p-6 text-foreground shadow-shadow duration-200 outline-none sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {asChild ? undefined : children}
        {asChild ? undefined : closeButton}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>Close</DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({
  asChild = false,
  children,
  className,
  render,
  ...props
}: DialogPrimitive.Title.Props & { asChild?: boolean; children?: React.ReactNode }) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      render={adaptRenderEventHandlers(renderElement)}
      className={cn("font-heading text-lg leading-none tracking-tight", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Title>
  );
}

function DialogDescription({
  asChild = false,
  children,
  className,
  render,
  ...props
}: DialogPrimitive.Description.Props & { asChild?: boolean; children?: React.ReactNode }) {
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      render={adaptRenderEventHandlers(renderElement)}
      className={cn("text-sm font-base text-foreground", className)}
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Description>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

type TooltipProviderContract = {
  delayDuration?: number;
  disableHoverableContent: boolean;
};

type TooltipRootContract = {
  contentId: string;
  delayDuration?: number;
  dismissHandlersRef: React.RefObject<TooltipDismissHandlers>;
  open: boolean;
  setContentId: React.Dispatch<React.SetStateAction<string>>;
};

type TooltipPointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;

type TooltipDismissHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: TooltipPointerDownOutsideEvent) => void;
};

const TooltipProviderContractContext = React.createContext<TooltipProviderContract | undefined>(
  undefined,
);
const TooltipRootContractContext = React.createContext<TooltipRootContract | null>(null);

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

function createPointerDownOutsideEvent(originalEvent: Event) {
  const event = new CustomEvent<{ originalEvent: PointerEvent }>("tooltip.pointerDownOutside", {
    cancelable: true,
    detail: { originalEvent: toPointerEvent(originalEvent) },
  });

  Object.defineProperty(event, "target", {
    configurable: true,
    value: originalEvent.target,
  });

  return event;
}

function TooltipProvider({
  delay,
  delayDuration = 0,
  disableHoverableContent = false,
  skipDelayDuration = 300,
  timeout,
  ...props
}: TooltipPrimitive.Provider.Props & {
  delayDuration?: TooltipPrimitive.Provider.Props["delay"];
  disableHoverableContent?: boolean;
  skipDelayDuration?: number;
}) {
  const resolvedDelay = delay ?? delayDuration;

  return (
    <TooltipProviderContractContext.Provider
      value={{ delayDuration: resolvedDelay, disableHoverableContent }}
    >
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delay={resolvedDelay}
        timeout={timeout ?? skipDelayDuration}
        {...props}
      />
    </TooltipProviderContractContext.Provider>
  );
}

function Tooltip({
  defaultOpen = false,
  delayDuration,
  disableHoverableContent,
  disableHoverablePopup,
  onOpenChange,
  open: openProp,
  ...props
}: TooltipPrimitive.Root.Props & {
  delayDuration?: number;
  disableHoverableContent?: boolean;
}) {
  const providerContract = React.useContext(TooltipProviderContractContext);
  const resolvedDelay = delayDuration ?? providerContract?.delayDuration;
  const resolvedDisableHoverablePopup =
    disableHoverablePopup ??
    disableHoverableContent ??
    providerContract?.disableHoverableContent ??
    false;
  const generatedContentId = React.useId();
  const [contentId, setContentId] = React.useState(generatedContentId);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const dismissHandlersRef = React.useRef<TooltipDismissHandlers>({});

  return (
    <TooltipRootContractContext.Provider
      value={{
        contentId,
        delayDuration: resolvedDelay,
        dismissHandlersRef,
        open,
        setContentId,
      }}
    >
      <TooltipPrimitive.Root
        data-slot="tooltip"
        defaultOpen={defaultOpen}
        disableHoverablePopup={resolvedDisableHoverablePopup}
        open={open}
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
            const outsideEvent = createPointerDownOutsideEvent(eventDetails.event);
            dismissHandlersRef.current.onPointerDownOutside?.(outsideEvent);
            if (outsideEvent.defaultPrevented) {
              eventDetails.cancel();
            }
          }

          if (eventDetails.isCanceled) {
            return;
          }

          onOpenChange?.(nextOpen, eventDetails);
          if (!eventDetails.isCanceled && openProp === undefined) {
            setUncontrolledOpen(nextOpen);
          }
        }}
        {...props}
      />
    </TooltipRootContractContext.Provider>
  );
}

type TooltipTriggerProps = TooltipPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
};

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  function TooltipTrigger(
    { "aria-describedby": ariaDescribedBy, asChild = false, children, delay, render, ...props },
    forwardedRef,
  ) {
    const rootContract = React.useContext(TooltipRootContractContext);
    const child = React.Children.toArray(children).find(React.isValidElement);
    if (asChild && child === undefined) {
      throw new Error("TooltipTrigger with asChild requires a valid React element child.");
    }

    const renderElement = asChild ? child : render;
    const describedBy =
      rootContract?.open === true
        ? [ariaDescribedBy, rootContract.contentId].filter(Boolean).join(" ")
        : ariaDescribedBy;

    return (
      <TooltipPrimitive.Trigger
        ref={forwardedRef}
        data-slot="tooltip-trigger"
        aria-describedby={describedBy || undefined}
        delay={delay ?? rootContract?.delayDuration}
        render={renderElement}
        {...props}
      >
        {asChild ? undefined : children}
      </TooltipPrimitive.Trigger>
    );
  },
);

function TooltipContent({
  className,
  id,
  forceMount,
  keepMounted,
  onEscapeKeyDown,
  onPointerDownOutside,
  role,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    forceMount?: true;
    keepMounted?: boolean;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: TooltipPointerDownOutsideEvent) => void;
  }) {
  const rootContract = React.useContext(TooltipRootContractContext);
  const resolvedId = id ?? rootContract?.contentId;

  React.useLayoutEffect(() => {
    if (rootContract === null) {
      return undefined;
    }

    if (resolvedId !== undefined) {
      rootContract.setContentId(resolvedId);
    }
    const handlers = { onEscapeKeyDown, onPointerDownOutside };
    const handlersRef = rootContract.dismissHandlersRef;
    handlersRef.current = handlers;
    return () => {
      if (handlersRef.current === handlers) {
        handlersRef.current = {};
      }
    };
  }, [onEscapeKeyDown, onPointerDownOutside, resolvedId, rootContract]);

  return (
    <TooltipPrimitive.Portal keepMounted={keepMounted ?? forceMount}>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          id={resolvedId}
          role={role ?? "tooltip"}
          className={cn(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 overflow-hidden rounded-base border-2 border-border bg-main px-3 py-1.5 text-sm font-base text-main-foreground has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] border-r-2 border-b-2 border-border bg-main fill-main data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

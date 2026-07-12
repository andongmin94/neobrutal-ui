"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import * as React from "react";

import { cn } from "@/lib/utils";

type HoverCardDelayContract = {
  closeDelay: number;
  openDelay: number;
};

const HoverCardDelayContext = React.createContext<HoverCardDelayContract>({
  closeDelay: 300,
  openDelay: 700,
});

type HoverCardPointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type HoverCardFocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;
type HoverCardInteractOutsideEvent = HoverCardPointerDownOutsideEvent | HoverCardFocusOutsideEvent;

type HoverCardDismissHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: HoverCardFocusOutsideEvent) => void;
  onInteractOutside?: (event: HoverCardInteractOutsideEvent) => void;
  onPointerDownOutside?: (event: HoverCardPointerDownOutsideEvent) => void;
};

const HoverCardDismissContext =
  React.createContext<React.RefObject<HoverCardDismissHandlers> | null>(null);

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

function HoverCard({
  closeDelay = 300,
  onOpenChange,
  openDelay = 700,
  ...props
}: PreviewCardPrimitive.Root.Props & {
  closeDelay?: number;
  openDelay?: number;
}) {
  const dismissHandlersRef = React.useRef<HoverCardDismissHandlers>({});

  return (
    <HoverCardDelayContext.Provider value={{ closeDelay, openDelay }}>
      <HoverCardDismissContext.Provider value={dismissHandlersRef}>
        <PreviewCardPrimitive.Root
          data-slot="hover-card"
          onOpenChange={(open, eventDetails) => {
            if (!open && eventDetails.reason === "escape-key") {
              const keyboardEvent = eventDetails.event;
              if (keyboardEvent instanceof KeyboardEvent) {
                dismissHandlersRef.current.onEscapeKeyDown?.(keyboardEvent);
                if (keyboardEvent.defaultPrevented) {
                  eventDetails.cancel();
                }
              }
            } else if (!open && eventDetails.reason === "outside-press") {
              const pointerEvent = createPointerDownOutsideEvent(
                "hoverCard.pointerDownOutside",
                eventDetails.event,
              );
              dismissHandlersRef.current.onPointerDownOutside?.(pointerEvent);
              dismissHandlersRef.current.onInteractOutside?.(pointerEvent);
              if (pointerEvent.defaultPrevented) {
                eventDetails.cancel();
              }
            }

            if (!eventDetails.isCanceled) {
              onOpenChange?.(open, eventDetails);
            }
          }}
          {...props}
        />
      </HoverCardDismissContext.Provider>
    </HoverCardDelayContext.Provider>
  );
}

function HoverCardTrigger({
  asChild = false,
  children,
  closeDelay,
  delay,
  render,
  ...props
}: PreviewCardPrimitive.Trigger.Props & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const rootDelay = React.useContext(HoverCardDelayContext);
  const renderElement = asChild
    ? (React.Children.toArray(children).find(React.isValidElement) as React.ReactElement)
    : render;

  return (
    <PreviewCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      closeDelay={closeDelay ?? rootDelay.closeDelay}
      delay={delay ?? rootDelay.openDelay}
      render={renderElement}
      {...props}
    >
      {asChild ? undefined : children}
    </PreviewCardPrimitive.Trigger>
  );
}

type HoverCardContentProps = PreviewCardPrimitive.Popup.Props &
  Pick<PreviewCardPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    forceMount?: true;
    keepMounted?: boolean;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onFocusOutside?: (event: HoverCardFocusOutsideEvent) => void;
    onInteractOutside?: (event: HoverCardInteractOutsideEvent) => void;
    onPointerDownOutside?: (event: HoverCardPointerDownOutsideEvent) => void;
  };

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    {
      className,
      forceMount,
      keepMounted,
      side = "bottom",
      sideOffset = 4,
      align = "center",
      alignOffset = 0,
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
      ...props
    },
    forwardedRef,
  ) {
    const dismissHandlersRef = React.useContext(HoverCardDismissContext);
    const [popupElement, setPopupElement] = React.useState<HTMLDivElement | null>(null);
    const mergedRef = React.useCallback(
      (popup: HTMLDivElement | null) => {
        setPopupElement(popup);
        setRefValue(forwardedRef, popup);
      },
      [forwardedRef],
    );

    React.useLayoutEffect(() => {
      if (dismissHandlersRef === null) {
        return undefined;
      }

      const handlers = {
        onEscapeKeyDown,
        onFocusOutside,
        onInteractOutside,
        onPointerDownOutside,
      };
      dismissHandlersRef.current = handlers;
      return () => {
        if (dismissHandlersRef.current === handlers) {
          dismissHandlersRef.current = {};
        }
      };
    }, [
      dismissHandlersRef,
      onEscapeKeyDown,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
    ]);

    React.useEffect(() => {
      if (popupElement === null) {
        return undefined;
      }

      const disableTabStops = () => {
        const candidates = popupElement.querySelectorAll<HTMLElement>(
          "a[href], button, input, select, textarea, [tabindex]",
        );

        candidates.forEach((candidate) => {
          candidate.tabIndex = -1;
        });
      };

      disableTabStops();
      const observer = new MutationObserver(disableTabStops);
      observer.observe(popupElement, { childList: true, subtree: true });

      return () => observer.disconnect();
    }, [popupElement]);

    return (
      <PreviewCardPrimitive.Portal
        data-slot="hover-card-portal"
        keepMounted={keepMounted ?? forceMount}
      >
        <PreviewCardPrimitive.Positioner
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
          className="isolate z-50"
        >
          <PreviewCardPrimitive.Popup
            ref={mergedRef}
            data-slot="hover-card-content"
            className={cn(
              "z-50 w-64 origin-(--transform-origin) rounded-base border-2 border-border bg-main p-4 font-base text-main-foreground outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className,
            )}
            {...props}
          />
        </PreviewCardPrimitive.Positioner>
      </PreviewCardPrimitive.Portal>
    );
  },
);

export { HoverCard, HoverCardTrigger, HoverCardContent };

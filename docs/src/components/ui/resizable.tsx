"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

type LegacyTagName = keyof HTMLElementTagNameMap;
type PointerHitAreaMargins = {
  coarse: number;
  fine: number;
};

type ResizablePanelGroupProps = Omit<ResizablePrimitive.GroupProps, "id" | "orientation"> & {
  autoSaveId?: string | null;
  direction?: ResizablePrimitive.Orientation;
  id?: string | number | null;
  keyboardResizeBy?: number | null;
  onLayout?: ((layout: number[]) => void) | null;
  orientation?: ResizablePrimitive.Orientation;
  storage?: ResizablePrimitive.LayoutStorage;
  tagName?: LegacyTagName;
};

type ResizablePanelProps = Omit<
  ResizablePrimitive.PanelProps,
  "collapsedSize" | "defaultSize" | "id" | "maxSize" | "minSize" | "onResize"
> & {
  collapsedSize?: string | number;
  defaultSize?: string | number;
  id?: string | number | null;
  maxSize?: string | number;
  minSize?: string | number;
  onCollapse?: () => void;
  onExpand?: () => void;
  onResize?: (size: number, prevSize: number | undefined) => void;
  order?: number;
  tagName?: LegacyTagName;
};

type ResizableHandleProps = Omit<ResizablePrimitive.SeparatorProps, "id"> & {
  hitAreaMargins?: PointerHitAreaMargins;
  id?: string | number | null;
  onDragging?: (isDragging: boolean) => void;
  tagName?: LegacyTagName;
  withHandle?: boolean;
};

export type ResizablePanelHandle = {
  collapse: () => void;
  expand: (minSize?: number) => void;
  getId: () => string;
  getSize: () => number;
  isCollapsed: () => boolean;
  isExpanded: () => boolean;
  resize: (size: number) => void;
};

const LEGACY_HIT_AREA_MARGINS = { coarse: 15, fine: 5 } as const;
const HANDLE_THICKNESS = 2;
const LEGACY_KEYBOARD_RESIZE_BY = 10;

const defaultStorage: ResizablePrimitive.LayoutStorage = {
  getItem(name) {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Match the legacy adapter's no-op behavior when storage is unavailable.
    }
  },
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function toPercentSize(value: string | number | undefined) {
  return typeof value === "number" ? `${value}%` : value;
}

function isSamePercentage(left: number, right: number) {
  return Math.abs(left - right) < 0.0001;
}

const ResizablePanel = React.forwardRef<ResizablePanelHandle, ResizablePanelProps>(
  function ResizablePanel(
    {
      collapsedSize,
      defaultSize,
      id,
      maxSize,
      minSize,
      onCollapse,
      onExpand,
      onResize,
      order,
      tagName,
      elementRef,
      panelRef,
      collapsible,
      ...props
    },
    forwardedRef,
  ) {
    const panelElementRef = React.useRef<HTMLDivElement | null>(null);
    const primitivePanelRef = React.useRef<ResizablePrimitive.PanelImperativeHandle | null>(null);
    const previousCollapsedRef = React.useRef<boolean | undefined>(undefined);
    const legacyCallbacksRef = React.useRef({
      collapsedSize,
      collapsible,
      onCollapse,
      onExpand,
      onResize,
    });
    legacyCallbacksRef.current = {
      collapsedSize,
      collapsible,
      onCollapse,
      onExpand,
      onResize,
    };

    const setElementRef = React.useCallback(
      (element: HTMLDivElement | null) => {
        panelElementRef.current = element;
        if (element) {
          if (order === undefined) {
            element.style.removeProperty("order");
          } else {
            element.style.order = String(order);
          }
        }
        assignRef(elementRef, element);
      },
      [elementRef, order],
    );

    const setPanelRef = React.useCallback(
      (handle: ResizablePrimitive.PanelImperativeHandle | null) => {
        primitivePanelRef.current = handle;
        assignRef(panelRef, handle);
      },
      [panelRef],
    );

    const handleResize = React.useCallback(
      (
        panelSize: ResizablePrimitive.PanelSize,
        _id: string | number | undefined,
        prevPanelSize: ResizablePrimitive.PanelSize | undefined,
      ) => {
        const callbacks = legacyCallbacksRef.current;
        callbacks.onResize?.(panelSize.asPercentage, prevPanelSize?.asPercentage);

        if (!callbacks.collapsible) return;

        const collapsedPercentage =
          typeof callbacks.collapsedSize === "number"
            ? callbacks.collapsedSize
            : callbacks.collapsedSize?.endsWith("%")
              ? Number.parseFloat(callbacks.collapsedSize)
              : 0;
        const isCollapsed =
          primitivePanelRef.current?.isCollapsed() ??
          isSamePercentage(panelSize.asPercentage, collapsedPercentage);
        const wasCollapsed =
          previousCollapsedRef.current ??
          (prevPanelSize
            ? isSamePercentage(prevPanelSize.asPercentage, collapsedPercentage)
            : undefined);

        if ((wasCollapsed === undefined || wasCollapsed) && !isCollapsed) {
          callbacks.onExpand?.();
        }
        if ((wasCollapsed === undefined || !wasCollapsed) && isCollapsed) {
          callbacks.onCollapse?.();
        }
        previousCollapsedRef.current = isCollapsed;
      },
      [],
    );

    React.useImperativeHandle(
      forwardedRef,
      () => ({
        collapse: () => primitivePanelRef.current?.collapse(),
        expand: (size) => {
          const handle = primitivePanelRef.current;
          if (!handle?.isCollapsed()) return;

          handle.expand();
          if (size !== undefined && handle.getSize().asPercentage < size) {
            handle.resize(`${size}%`);
          }
        },
        getId: () => panelElementRef.current?.id ?? String(id ?? ""),
        getSize: () => primitivePanelRef.current?.getSize().asPercentage ?? 0,
        isCollapsed: () => primitivePanelRef.current?.isCollapsed() ?? false,
        isExpanded: () => !(primitivePanelRef.current?.isCollapsed() ?? false),
        resize: (size) => primitivePanelRef.current?.resize(`${size}%`),
      }),
      [id],
    );

    return (
      <ResizablePrimitive.Panel
        key={`${tagName ?? "div"}:${order ?? ""}`}
        data-slot="resizable-panel"
        collapsedSize={toPercentSize(collapsedSize)}
        defaultSize={toPercentSize(defaultSize)}
        id={id == null ? undefined : String(id)}
        maxSize={toPercentSize(maxSize)}
        minSize={toPercentSize(minSize)}
        collapsible={collapsible}
        elementRef={setElementRef}
        panelRef={setPanelRef}
        onResize={handleResize}
        {...props}
      />
    );
  },
);

function ResizableHandle({
  withHandle,
  className,
  hitAreaMargins: _hitAreaMargins,
  id,
  onDragging,
  tagName,
  elementRef,
  ...props
}: ResizableHandleProps) {
  const separatorElementRef = React.useRef<HTMLDivElement | null>(null);
  const onDraggingRef = React.useRef(onDragging);
  onDraggingRef.current = onDragging;

  const setElementRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      separatorElementRef.current = element;
      assignRef(elementRef, element);
    },
    [elementRef],
  );

  React.useEffect(() => {
    const element = separatorElementRef.current;
    if (!element) return;

    let wasDragging = element.dataset.separator === "active";
    const observer = new MutationObserver(() => {
      const isDragging = element.dataset.separator === "active";
      if (isDragging !== wasDragging) {
        wasDragging = isDragging;
        onDraggingRef.current?.(isDragging);
      }
    });
    observer.observe(element, { attributeFilter: ["data-separator"] });

    return () => {
      observer.disconnect();
      if (wasDragging) onDraggingRef.current?.(false);
    };
  }, [tagName]);

  return (
    <ResizablePrimitive.Separator
      key={tagName}
      data-slot="resizable-handle"
      id={id == null ? undefined : String(id)}
      elementRef={setElementRef}
      className={cn(
        "relative flex w-0.5 items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-1 aria-[orientation=horizontal]:h-0.5 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=horizontal]:after:translate-x-0 [&[aria-orientation=horizontal]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-base border bg-border">
          <GripVertical className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

function getLegacyResizeTargetMinimumSize(children: React.ReactNode) {
  let target: PointerHitAreaMargins | undefined;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      const fragmentProps = child.props as { children?: React.ReactNode };
      const fragmentTarget = getLegacyResizeTargetMinimumSize(fragmentProps.children);
      if (fragmentTarget) {
        target = {
          coarse: Math.max(target?.coarse ?? 0, fragmentTarget.coarse),
          fine: Math.max(target?.fine ?? 0, fragmentTarget.fine),
        };
      }
      return;
    }
    if (child.type !== ResizableHandle) return;

    const handleProps = child.props as ResizableHandleProps;
    const margins = handleProps.hitAreaMargins ?? LEGACY_HIT_AREA_MARGINS;
    target = {
      coarse: Math.max(target?.coarse ?? 0, HANDLE_THICKNESS + margins.coarse * 2),
      fine: Math.max(target?.fine ?? 0, HANDLE_THICKNESS + margins.fine * 2),
    };
  });

  return target;
}

type PersistedLayout = ReturnType<typeof ResizablePrimitive.useDefaultLayout>;
type ResizablePanelGroupAdapterProps = ResizablePanelGroupProps & {
  persistedLayout?: PersistedLayout;
};

function ResizablePanelGroupAdapter({
  autoSaveId: _autoSaveId,
  children,
  className,
  defaultLayout,
  direction,
  disabled,
  elementRef,
  groupRef,
  id,
  keyboardResizeBy,
  onKeyDownCapture,
  onLayout,
  onLayoutChange,
  onLayoutChanged,
  orientation = direction ?? "horizontal",
  persistedLayout,
  resizeTargetMinimumSize,
  storage: _storage,
  tagName,
  ...props
}: ResizablePanelGroupAdapterProps) {
  const groupApiRef = React.useRef<ResizablePrimitive.GroupImperativeHandle | null>(null);
  const groupElementRef = React.useRef<HTMLDivElement | null>(null);

  const setElementRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      groupElementRef.current = element;
      assignRef(elementRef, element);
    },
    [elementRef],
  );

  const setGroupRef = React.useCallback(
    (handle: ResizablePrimitive.GroupImperativeHandle | null) => {
      groupApiRef.current = handle;
      assignRef(groupRef, handle);
    },
    [groupRef],
  );

  const layoutToArray = React.useCallback((layout: ResizablePrimitive.Layout) => {
    const panelIds = groupElementRef.current
      ? Array.from(groupElementRef.current.children)
          .filter((element) => element.hasAttribute("data-panel"))
          .map((element) => element.id)
      : [];
    return panelIds.length === Object.keys(layout).length
      ? panelIds.map((panelId) => layout[panelId] ?? 0)
      : Object.values(layout);
  }, []);

  const handleLayoutChange = React.useCallback(
    (layout: ResizablePrimitive.Layout) => {
      persistedLayout?.onLayoutChange(layout);
      onLayoutChange?.(layout);
      onLayout?.(layoutToArray(layout));
    },
    [layoutToArray, onLayout, onLayoutChange, persistedLayout],
  );

  const handleKeyDownCapture = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDownCapture?.(event);
      if (disabled || event.defaultPrevented) return;

      const isHorizontalKey = event.key === "ArrowLeft" || event.key === "ArrowRight";
      const isVerticalKey = event.key === "ArrowUp" || event.key === "ArrowDown";
      if (
        (orientation === "horizontal" && !isHorizontalKey) ||
        (orientation === "vertical" && !isVerticalKey)
      ) {
        return;
      }

      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-separator]")
          : null;
      const groupElement = groupElementRef.current;
      const groupApi = groupApiRef.current;
      if (!target || !groupElement || !groupApi || target.parentElement !== groupElement) return;

      const elements = Array.from(groupElement.children);
      const separatorIndex = elements.indexOf(target);
      const panelIndex =
        elements.slice(0, separatorIndex).filter((element) => element.hasAttribute("data-panel"))
          .length - 1;
      const panelIds = elements
        .filter((element) => element.hasAttribute("data-panel"))
        .map((element) => element.id);
      const firstPanelId = panelIds[panelIndex];
      const secondPanelId = panelIds[panelIndex + 1];
      if (!firstPanelId || !secondPanelId) return;

      const layout = groupApi.getLayout();
      let delta = event.shiftKey ? 100 : (keyboardResizeBy ?? LEGACY_KEYBOARD_RESIZE_BY);
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") delta *= -1;
      if (orientation === "horizontal" && getComputedStyle(groupElement).direction === "rtl") {
        delta *= -1;
      }

      event.preventDefault();
      groupApi.setLayout({
        ...layout,
        [firstPanelId]: layout[firstPanelId] + delta,
        [secondPanelId]: layout[secondPanelId] - delta,
      });
    },
    [disabled, keyboardResizeBy, onKeyDownCapture, orientation],
  );

  const legacyResizeTargetMinimumSize = getLegacyResizeTargetMinimumSize(children);

  return (
    <ResizablePrimitive.Group
      key={tagName}
      data-slot="resizable-panel-group"
      id={id == null ? undefined : String(id)}
      orientation={orientation}
      disabled={disabled}
      defaultLayout={defaultLayout ?? persistedLayout?.defaultLayout}
      elementRef={setElementRef}
      groupRef={setGroupRef}
      onKeyDownCapture={handleKeyDownCapture}
      onLayoutChange={handleLayoutChange}
      onLayoutChanged={onLayoutChanged}
      resizeTargetMinimumSize={resizeTargetMinimumSize ?? legacyResizeTargetMinimumSize}
      className={cn("flex h-full w-full font-base aria-[orientation=vertical]:flex-col", className)}
      {...props}
    >
      {children}
    </ResizablePrimitive.Group>
  );
}

function PersistedResizablePanelGroup({
  autoSaveId,
  storage,
  ...props
}: ResizablePanelGroupProps & { autoSaveId: string }) {
  const persistedLayout = ResizablePrimitive.useDefaultLayout({
    id: autoSaveId,
    storage: storage ?? defaultStorage,
  });

  return (
    <ResizablePanelGroupAdapter
      autoSaveId={autoSaveId}
      storage={storage}
      persistedLayout={persistedLayout}
      {...props}
    />
  );
}

function ResizablePanelGroup(props: ResizablePanelGroupProps) {
  return props.autoSaveId ? (
    <PersistedResizablePanelGroup {...props} autoSaveId={props.autoSaveId} />
  ) : (
    <ResizablePanelGroupAdapter {...props} />
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

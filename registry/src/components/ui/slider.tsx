"use client";

import { DirectionProvider, useDirection } from "@base-ui/react/direction-provider";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import * as React from "react";

import { cn } from "@/lib/utils";

type SliderProps = Omit<
  SliderPrimitive.Root.Props<readonly number[]>,
  "defaultValue" | "dir" | "minStepsBetweenValues" | "onValueChange" | "onValueCommitted" | "value"
> & {
  defaultValue?: number[];
  dir?: "ltr" | "rtl";
  inverted?: boolean;
  minStepsBetweenThumbs?: number;
  minStepsBetweenValues?: number;
  onValueChange?: (value: number[], eventDetails: SliderPrimitive.Root.ChangeEventDetails) => void;
  onValueCommit?: (value: number[], eventDetails: SliderPrimitive.Root.CommitEventDetails) => void;
  onValueCommitted?: (
    value: number[],
    eventDetails: SliderPrimitive.Root.CommitEventDetails,
  ) => void;
  value?: number[];
};

type SliderCollisionBehavior = "none" | "push" | "swap";
type SliderPointerReason = "drag" | "track-press";

type SliderValueUpdate = {
  activeIndex: number;
  values: number[];
};

type SliderPointerState = {
  activeIndex: number;
  changed: boolean;
  pointerId: number;
  reason: SliderPointerReason;
  startValues: number[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDecimalPrecision(value: number) {
  const valueString = value.toString();
  const exponentIndex = valueString.toLowerCase().indexOf("e-");
  if (exponentIndex !== -1) {
    return Number(valueString.slice(exponentIndex + 2));
  }

  return valueString.includes(".") ? valueString.length - valueString.indexOf(".") - 1 : 0;
}

function roundValueToStep(value: number, min: number, step: number) {
  const rounded = Math.round((value - min) / step) * step + min;
  return Number(rounded.toFixed(Math.max(getDecimalPrecision(step), getDecimalPrecision(min))));
}

function normalizeSliderValue(value: number, min: number, max: number, step: number) {
  return clamp(roundValueToStep(value, min, step), min, max);
}

function hasMinimumDistance(values: readonly number[], minimumDistance: number) {
  if (minimumDistance <= 0) {
    return true;
  }

  for (let index = 1; index < values.length; index += 1) {
    if (values[index] - values[index - 1] < minimumDistance) {
      return false;
    }
  }

  return true;
}

function getPushedValues(
  values: readonly number[],
  index: number,
  nextValue: number,
  min: number,
  max: number,
  minimumDistance: number,
) {
  const nextValues = [...values];
  const lastIndex = nextValues.length - 1;
  nextValues[index] = clamp(
    nextValue,
    min + index * minimumDistance,
    max - (lastIndex - index) * minimumDistance,
  );

  for (let currentIndex = index + 1; currentIndex <= lastIndex; currentIndex += 1) {
    const minimum = nextValues[currentIndex - 1] + minimumDistance;
    const maximum = max - (lastIndex - currentIndex) * minimumDistance;
    nextValues[currentIndex] = clamp(Math.max(nextValues[currentIndex], minimum), minimum, maximum);
  }

  for (let currentIndex = index - 1; currentIndex >= 0; currentIndex -= 1) {
    const minimum = min + currentIndex * minimumDistance;
    const maximum = nextValues[currentIndex + 1] - minimumDistance;
    nextValues[currentIndex] = clamp(Math.min(nextValues[currentIndex], maximum), minimum, maximum);
  }

  return nextValues.map((currentValue) => Number(currentValue.toFixed(12)));
}

function getNextSliderValues(
  values: readonly number[],
  value: number,
  index: number,
  min: number,
  max: number,
  step: number,
  minStepsBetweenValues: number,
  collisionBehavior: SliderCollisionBehavior,
): SliderValueUpdate | null {
  if (values.length === 0 || index < 0 || index >= values.length) {
    return null;
  }

  const nextValue = normalizeSliderValue(value, min, max, step);
  const minimumDistance = minStepsBetweenValues * step;

  if (collisionBehavior === "push") {
    return {
      activeIndex: index,
      values: getPushedValues(values, index, nextValue, min, max, minimumDistance),
    };
  }

  if (collisionBehavior === "none") {
    const nextValues = [...values];
    const lowerBound = (nextValues[index - 1] ?? min - minimumDistance) + minimumDistance;
    const upperBound = (nextValues[index + 1] ?? max + minimumDistance) - minimumDistance;
    nextValues[index] = clamp(nextValue, lowerBound, upperBound);
    return { activeIndex: index, values: nextValues };
  }

  const nextValues = [...values];
  nextValues[index] = nextValue;
  nextValues.sort((first, second) => first - second);
  if (!hasMinimumDistance(nextValues, minimumDistance)) {
    return null;
  }

  return {
    activeIndex: nextValues.indexOf(nextValue),
    values: nextValues,
  };
}

function areSliderValuesEqual(first: readonly number[], second: readonly number[]) {
  return (
    first.length === second.length &&
    first.every((currentValue, index) => currentValue === second[index])
  );
}

function getClosestValueIndex(values: readonly number[], nextValue: number) {
  if (values.length <= 1) {
    return 0;
  }

  const distances = values.map((currentValue) => Math.abs(currentValue - nextValue));
  return distances.indexOf(Math.min(...distances));
}

function valueToPercent(value: number, min: number, max: number) {
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

function getInvertedThumbStyle(
  value: number,
  min: number,
  max: number,
  orientation: "horizontal" | "vertical",
  direction: "ltr" | "rtl",
): React.CSSProperties {
  const percentage = valueToPercent(value, min, max);

  if (orientation === "vertical") {
    return {
      bottom: "auto",
      left: "50%",
      top: `${percentage}%`,
      translate: "-50% -50%",
    };
  }

  const leftPercentage = direction === "rtl" ? percentage : 100 - percentage;
  return {
    insetInlineStart: "auto",
    left: `${leftPercentage}%`,
    right: "auto",
    translate: "-50% -50%",
  };
}

function getInvertedIndicatorStyle(
  values: readonly number[],
  min: number,
  max: number,
  orientation: "horizontal" | "vertical",
  direction: "ltr" | "rtl",
): React.CSSProperties | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const firstPercentage = valueToPercent(values[0], min, max);
  const lastPercentage = valueToPercent(values[values.length - 1], min, max);
  const range = values.length > 1;

  if (orientation === "vertical") {
    return {
      bottom: "auto",
      height: `${range ? lastPercentage - firstPercentage : firstPercentage}%`,
      position: "absolute",
      top: `${range ? firstPercentage : 0}%`,
      width: "inherit",
    };
  }

  if (!range) {
    return {
      insetInlineStart: "auto",
      left: direction === "rtl" ? 0 : "auto",
      position: "absolute",
      right: direction === "rtl" ? "auto" : 0,
      width: `${firstPercentage}%`,
    };
  }

  const firstPosition = direction === "rtl" ? firstPercentage : 100 - firstPercentage;
  const lastPosition = direction === "rtl" ? lastPercentage : 100 - lastPercentage;
  return {
    insetInlineStart: "auto",
    left: `${Math.min(firstPosition, lastPosition)}%`,
    position: "absolute",
    right: "auto",
    width: `${Math.abs(lastPosition - firstPosition)}%`,
  };
}

function createSliderChangeDetails<Reason extends "drag" | "keyboard" | "track-press">(
  reason: Reason,
  event: Reason extends "keyboard" ? KeyboardEvent : PointerEvent,
  activeThumbIndex: number,
) {
  let canceled = false;
  let propagationAllowed = false;

  return {
    activeThumbIndex,
    allowPropagation() {
      propagationAllowed = true;
    },
    cancel() {
      canceled = true;
    },
    event,
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
    reason,
    trigger: undefined,
  } as Extract<SliderPrimitive.Root.ChangeEventDetails, { reason: Reason }>;
}

function createSliderCommitDetails<Reason extends "drag" | "keyboard" | "track-press">(
  reason: Reason,
  event: Reason extends "keyboard" ? KeyboardEvent : PointerEvent,
) {
  return { event, reason } as Extract<SliderPrimitive.Root.CommitEventDetails, { reason: Reason }>;
}

function SliderThumb({
  index,
  inputRef,
  onKeyDown,
  orientation,
  style,
}: {
  index: number;
  inputRef: React.Ref<HTMLInputElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  orientation: "horizontal" | "vertical";
  style?: React.CSSProperties;
}) {
  const aliasedStyle = {
    "--radix-slider-thumb-transform":
      orientation === "horizontal" ? "translateX(-50%)" : "translateY(50%)",
    ...style,
  } as React.CSSProperties;

  return (
    <SliderPrimitive.Thumb
      data-slider-index={index}
      data-slot="slider-thumb"
      index={index}
      inputRef={inputRef}
      onKeyDown={onKeyDown}
      style={aliasedStyle}
      className="relative block size-5 shrink-0 rounded-full border-2 border-border bg-white ring-offset-white transition-colors select-none after:absolute after:-inset-2 has-focus-visible:outline-none has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 data-disabled:pointer-events-none data-disabled:opacity-50"
    />
  );
}

function Slider({
  className,
  defaultValue,
  dir,
  disabled = false,
  form,
  inverted = false,
  largeStep,
  max = 100,
  min = 0,
  minStepsBetweenThumbs = 0,
  minStepsBetweenValues,
  name,
  onValueChange,
  onValueCommit,
  onValueCommitted,
  orientation = "horizontal",
  step = 1,
  thumbCollisionBehavior = "swap",
  value,
  ...props
}: SliderProps) {
  const inheritedDirection = useDirection();
  const direction = dir ?? inheritedDirection;
  const effectiveDirection =
    orientation === "horizontal" && inverted ? (direction === "ltr" ? "rtl" : "ltr") : direction;
  const minimumSteps = minStepsBetweenValues ?? minStepsBetweenThumbs;
  const initialValuesRef = React.useRef(
    [...(defaultValue ?? [min])].sort((first, second) => first - second),
  );
  const [uncontrolledValues, setUncontrolledValues] = React.useState(initialValuesRef.current);
  const currentValues = React.useMemo(
    () => [...(value ?? uncontrolledValues)].sort((first, second) => first - second),
    [uncontrolledValues, value],
  );
  const currentValuesRef = React.useRef(currentValues);
  currentValuesRef.current = currentValues;

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const inputRefCallbacks = React.useRef<
    Array<((input: HTMLInputElement | null) => void) | undefined>
  >([]);
  const [associatedForm, setAssociatedForm] = React.useState<HTMLFormElement | null>(null);
  const pointerStateRef = React.useRef<SliderPointerState | null>(null);

  const getInputRef = React.useCallback((index: number) => {
    let callback = inputRefCallbacks.current[index];
    if (callback === undefined) {
      callback = (input) => {
        inputRefs.current[index] = input;
        if (index === 0) {
          setAssociatedForm(input?.form ?? null);
        }
      };
      inputRefCallbacks.current[index] = callback;
    }
    return callback;
  }, []);

  React.useEffect(() => {
    if (value !== undefined || associatedForm === null) {
      return undefined;
    }

    const reset = () => {
      const nextValues = [...initialValuesRef.current];
      currentValuesRef.current = nextValues;
      setUncontrolledValues(nextValues);
    };
    associatedForm.addEventListener("reset", reset);
    return () => associatedForm.removeEventListener("reset", reset);
  }, [associatedForm, value]);

  const applyValues = React.useCallback(
    (nextValues: number[], eventDetails: SliderPrimitive.Root.ChangeEventDetails) => {
      onValueChange?.(nextValues, eventDetails);
      if (eventDetails.isCanceled) {
        return false;
      }

      if (value === undefined) {
        currentValuesRef.current = nextValues;
        setUncontrolledValues(nextValues);
      }
      return true;
    },
    [onValueChange, value],
  );

  const commitValues = React.useCallback(
    (nextValues: number[], eventDetails: SliderPrimitive.Root.CommitEventDetails) => {
      onValueCommitted?.(nextValues, eventDetails);
      onValueCommit?.(nextValues, eventDetails);
    },
    [onValueCommit, onValueCommitted],
  );

  const focusThumb = React.useCallback((index: number, focusVisible: boolean) => {
    queueMicrotask(() => {
      inputRefs.current[index]?.focus({ preventScroll: true, focusVisible });
    });
  }, []);

  const handleThumbKeyDown = React.useCallback(
    (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      const directionalKeys = new Set([
        "PageUp",
        "PageDown",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ]);
      if (
        disabled ||
        (event.key !== "Home" && event.key !== "End" && !directionalKeys.has(event.key))
      ) {
        return;
      }

      event.preventDefault();

      const values = currentValuesRef.current;
      let targetIndex = index;
      let nextValue: number;

      if (event.key === "Home") {
        targetIndex = 0;
        nextValue = min;
      } else if (event.key === "End") {
        targetIndex = values.length - 1;
        nextValue = max;
      } else {
        const slideDirection =
          orientation === "horizontal"
            ? (direction === "ltr") !== inverted
              ? "from-left"
              : "from-right"
            : inverted
              ? "from-top"
              : "from-bottom";
        const backKeys = {
          "from-left": new Set(["PageDown", "ArrowDown", "ArrowLeft"]),
          "from-right": new Set(["PageDown", "ArrowDown", "ArrowRight"]),
          "from-bottom": new Set(["PageDown", "ArrowDown", "ArrowLeft"]),
          "from-top": new Set(["PageDown", "ArrowUp", "ArrowLeft"]),
        }[slideDirection];
        const isLargeStep =
          event.key === "PageUp" ||
          event.key === "PageDown" ||
          (event.shiftKey && event.key.startsWith("Arrow"));
        const increment = isLargeStep ? (largeStep ?? step * 10) : step;
        nextValue = values[targetIndex] + (backKeys.has(event.key) ? -increment : increment);
      }

      const update = getNextSliderValues(
        values,
        nextValue,
        targetIndex,
        min,
        max,
        step,
        minimumSteps,
        thumbCollisionBehavior,
      );
      if (update === null || areSliderValuesEqual(values, update.values)) {
        return;
      }

      const changeDetails = createSliderChangeDetails(
        "keyboard",
        event.nativeEvent,
        update.activeIndex,
      );
      if (applyValues(update.values, changeDetails)) {
        commitValues(update.values, createSliderCommitDetails("keyboard", event.nativeEvent));
        focusThumb(update.activeIndex, true);
      }
    },
    [
      applyValues,
      commitValues,
      direction,
      disabled,
      focusThumb,
      inverted,
      largeStep,
      max,
      min,
      minimumSteps,
      orientation,
      step,
      thumbCollisionBehavior,
    ],
  );

  const getPointerValue = React.useCallback(
    (control: HTMLElement, clientX: number, clientY: number) => {
      const rect = control.getBoundingClientRect();
      if (orientation === "horizontal") {
        const percentage = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
        const fromLeft = (direction === "ltr") !== inverted;
        const position = fromLeft ? percentage : 1 - percentage;
        return min + clamp(position, 0, 1) * (max - min);
      }

      const percentage = rect.height === 0 ? 0 : (clientY - rect.top) / rect.height;
      const position = inverted ? percentage : 1 - percentage;
      return min + clamp(position, 0, 1) * (max - min);
    },
    [direction, inverted, max, min, orientation],
  );

  const updateFromPointer = React.useCallback(
    (rawValue: number, index: number, reason: SliderPointerReason, event: PointerEvent) => {
      const values = currentValuesRef.current;
      const update = getNextSliderValues(
        values,
        rawValue,
        index,
        min,
        max,
        step,
        minimumSteps,
        thumbCollisionBehavior,
      );
      if (update === null || areSliderValuesEqual(values, update.values)) {
        return null;
      }

      const details =
        reason === "drag"
          ? createSliderChangeDetails("drag", event, update.activeIndex)
          : createSliderChangeDetails("track-press", event, update.activeIndex);
      return applyValues(update.values, details) ? update : null;
    },
    [applyValues, max, min, minimumSteps, step, thumbCollisionBehavior],
  );

  const indicatorStyle = inverted
    ? getInvertedIndicatorStyle(currentValues, min, max, orientation, direction)
    : undefined;

  const slider = (
    <SliderPrimitive.Root<readonly number[]>
      data-slot="slider"
      className={cn(
        "w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto",
        className,
      )}
      dir={direction}
      disabled={disabled}
      form={form}
      largeStep={largeStep ?? step * 10}
      max={max}
      min={min}
      minStepsBetweenValues={minimumSteps}
      name={name}
      onValueChange={(nextValue, eventDetails) => {
        applyValues([...nextValue], eventDetails);
      }}
      onValueCommitted={(nextValue, eventDetails) => {
        commitValues([...nextValue], eventDetails);
      }}
      orientation={orientation}
      step={step}
      thumbCollisionBehavior={thumbCollisionBehavior}
      value={currentValues}
      {...props}
    >
      <SliderPrimitive.Control
        className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col"
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) {
            return;
          }

          event.preventBaseUIHandler();
          event.preventDefault();

          const control = event.currentTarget;
          const thumb = (event.target as Element).closest<HTMLElement>("[data-slider-index]");
          const thumbIndex = thumb === null ? -1 : Number(thumb.dataset.sliderIndex);
          const startValues = [...currentValuesRef.current];
          let activeIndex = thumbIndex;
          let changed = false;

          if (activeIndex === -1) {
            const rawValue = getPointerValue(control, event.clientX, event.clientY);
            activeIndex = getClosestValueIndex(startValues, rawValue);
            const update = updateFromPointer(
              rawValue,
              activeIndex,
              "track-press",
              event.nativeEvent,
            );
            if (update !== null) {
              activeIndex = update.activeIndex;
              changed = true;
            }
          }

          if (activeIndex < 0 || activeIndex >= startValues.length) {
            return;
          }

          focusThumb(activeIndex, false);
          control.setPointerCapture(event.pointerId);
          pointerStateRef.current = {
            activeIndex,
            changed,
            pointerId: event.pointerId,
            reason: "track-press",
            startValues,
          };
        }}
        onPointerMove={(event) => {
          const pointerState = pointerStateRef.current;
          if (pointerState === null || pointerState.pointerId !== event.pointerId) {
            return;
          }

          event.preventBaseUIHandler();
          const rawValue = getPointerValue(event.currentTarget, event.clientX, event.clientY);
          const update = updateFromPointer(
            rawValue,
            pointerState.activeIndex,
            "drag",
            event.nativeEvent,
          );
          if (update !== null) {
            if (update.activeIndex !== pointerState.activeIndex) {
              focusThumb(update.activeIndex, false);
            }
            pointerState.activeIndex = update.activeIndex;
            pointerState.changed = true;
            pointerState.reason = "drag";
          }
        }}
        onPointerUp={(event) => {
          const pointerState = pointerStateRef.current;
          if (pointerState === null || pointerState.pointerId !== event.pointerId) {
            return;
          }

          event.preventBaseUIHandler();
          if (
            pointerState.changed &&
            !areSliderValuesEqual(pointerState.startValues, currentValuesRef.current)
          ) {
            const committedValues = [...currentValuesRef.current];
            const details =
              pointerState.reason === "drag"
                ? createSliderCommitDetails("drag", event.nativeEvent)
                : createSliderCommitDetails("track-press", event.nativeEvent);
            commitValues(committedValues, details);
          }

          pointerStateRef.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onTouchStartCapture={(event) => {
          event.stopPropagation();
        }}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-3 w-full grow overflow-hidden rounded-base border-2 border-border bg-secondary-background select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-3"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            style={indicatorStyle}
            className="bg-main select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {currentValues.map((currentValue, index) => (
          <SliderThumb
            index={index}
            inputRef={getInputRef(index)}
            key={index}
            onKeyDown={(event) => handleThumbKeyDown(index, event)}
            orientation={orientation}
            style={
              inverted
                ? getInvertedThumbStyle(currentValue, min, max, orientation, direction)
                : undefined
            }
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );

  return <DirectionProvider direction={effectiveDirection}>{slider}</DirectionProvider>;
}

export { Slider };

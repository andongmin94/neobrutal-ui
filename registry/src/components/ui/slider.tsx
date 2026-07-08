"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

type SliderProps = Omit<
  SliderPrimitive.Root.Props<readonly number[]>,
  "defaultValue" | "onValueChange" | "onValueCommitted" | "value"
> & {
  defaultValue?: number[];
  onValueChange?: (value: number[], eventDetails: unknown) => void;
  onValueCommit?: (value: number[], eventDetails: unknown) => void;
  onValueCommitted?: (value: number[], eventDetails: unknown) => void;
  value?: number[];
};

function Slider({
  className,
  defaultValue,
  onValueChange,
  onValueCommit,
  onValueCommitted,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      max={max}
      min={min}
      onValueChange={(nextValue, eventDetails) => {
        onValueChange?.([...nextValue], eventDetails);
      }}
      onValueCommitted={(nextValue, eventDetails) => {
        const values = [...nextValue];

        onValueCommitted?.(values, eventDetails);
        onValueCommit?.(values, eventDetails);
      }}
      thumbAlignment="edge"
      value={value}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-base border-2 border-border bg-secondary-background select-none data-horizontal:h-3 data-horizontal:w-full data-vertical:h-full data-vertical:w-3"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-main select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="relative block size-5 shrink-0 rounded-full border-2 border-border bg-white ring-offset-white transition-colors select-none after:absolute after:-inset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };

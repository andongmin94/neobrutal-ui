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
      className={cn(
        "w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto",
        className,
      )}
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
      value={value}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-3 w-full grow overflow-hidden rounded-base border-2 border-border bg-secondary-background select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-3"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-main select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            index={index}
            key={index}
            className="relative block size-5 shrink-0 rounded-full border-2 border-border bg-white ring-offset-white transition-colors select-none after:absolute after:-inset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-disabled:pointer-events-none data-disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };

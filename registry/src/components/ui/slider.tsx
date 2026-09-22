"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

type SliderProps = SliderPrimitive.Root.Props<number[]> & {
  dir?: "ltr" | "rtl";
  getAriaLabel?: (index: number) => string;
};

function Slider({
  className,
  defaultValue,
  dir,
  getAriaLabel,
  min = 0,
  orientation = "horizontal",
  thumbCollisionBehavior = "swap",
  value,
  ...props
}: SliderProps) {
  const initialValues = defaultValue ?? [min];
  const values = value ?? initialValues;
  const slider = (
    <SliderPrimitive.Root<number[]>
      data-slot="slider"
      className={cn(
        "w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto",
        className,
      )}
      defaultValue={initialValues}
      value={value}
      min={min}
      orientation={orientation}
      thumbCollisionBehavior={thumbCollisionBehavior}
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
        {values.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            data-slot="slider-thumb"
            index={index}
            aria-label={getAriaLabel?.(index)}
            className="relative block size-5 shrink-0 rounded-full border-2 border-border bg-white transition-colors select-none after:absolute after:-inset-2 has-focus-visible:outline-none has-focus-visible:ring-1 has-focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
  return dir ? <DirectionProvider direction={dir}>{slider}</DirectionProvider> : slider;
}

export { Slider };

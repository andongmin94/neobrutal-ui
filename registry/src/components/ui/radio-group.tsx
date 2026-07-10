"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import * as React from "react";

import { cn } from "@/lib/utils";

type RadioGroupProps = Omit<RadioGroupPrimitive.Props<string>, "dir" | "onValueChange"> & {
  dir?: "ltr" | "rtl";
  loop?: boolean;
  onValueChange?: (value: string, eventDetails: RadioGroupPrimitive.ChangeEventDetails) => void;
  orientation?: "horizontal" | "vertical";
};

function RadioGroup({
  className,
  dir,
  loop = true,
  onKeyDown,
  orientation,
  ...props
}: RadioGroupProps) {
  const group = (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-orientation={orientation}
      dir={dir}
      className={cn("grid gap-2", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.baseUIHandlerPrevented) {
          event.preventBaseUIHandler();
          return;
        }

        const horizontalKey = event.key === "ArrowLeft" || event.key === "ArrowRight";
        const verticalKey = event.key === "ArrowUp" || event.key === "ArrowDown";

        if (
          (orientation === "horizontal" && verticalKey) ||
          (orientation === "vertical" && horizontalKey)
        ) {
          event.preventBaseUIHandler();
          return;
        }

        if (loop || (!horizontalKey && !verticalKey)) {
          return;
        }

        const radios = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'),
        ).filter(
          (radio) =>
            radio.closest('[role="radiogroup"]') === event.currentTarget &&
            radio.getAttribute("aria-disabled") !== "true" &&
            !radio.hasAttribute("data-disabled"),
        );
        const currentRadio = (event.target as Element).closest<HTMLElement>('[role="radio"]');
        const currentIndex = currentRadio === null ? -1 : radios.indexOf(currentRadio);

        if (currentIndex === -1) {
          return;
        }

        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const backward =
          event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft");
        const forward =
          event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight");

        if ((backward && currentIndex === 0) || (forward && currentIndex === radios.length - 1)) {
          event.preventBaseUIHandler();
        }
      }}
      {...props}
    />
  );

  return dir === undefined ? group : <DirectionProvider direction={dir}>{group}</DirectionProvider>;
}

function RadioGroupItem({
  className,
  ...props
}: Omit<RadioPrimitive.Root.Props<string>, "value"> & { value: string }) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border-2 border-border text-black outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };

"use client";

import * as React from "react";

import { Slider } from "@/components/ui/slider";

export default function SliderControlled() {
  const labelId = React.useId();
  const [value, setValue] = React.useState([0.3, 0.7]);

  return (
    <div className="grid w-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <span id={labelId} className="text-sm font-heading leading-none select-none">
          Temperature
        </span>
        <span className="text-foreground font-base text-sm">{value.join(", ")}</span>
      </div>
      <Slider
        aria-labelledby={labelId}
        getAriaLabel={(index) => (index === 0 ? "Minimum temperature" : "Maximum temperature")}
        value={value}
        onValueChange={setValue}
        min={0}
        max={1}
        step={0.1}
      />
    </div>
  );
}

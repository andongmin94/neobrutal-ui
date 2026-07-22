"use client";

import { Slider } from "@/components/ui/slider";

export default function TwoThumbsSliderDemo() {
  return (
    <Slider
      defaultValue={[25, 50]}
      getAriaLabel={(index) => (index === 0 ? "Minimum value" : "Maximum value")}
      max={100}
      step={1}
    />
  );
}

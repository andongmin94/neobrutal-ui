import { Slider } from "@/components/ui/slider";

export default function SliderDemo() {
  return (
    <Slider
      defaultValue={[33]}
      getAriaLabel={() => "Value"}
      getAriaValueText={(_, value) => `${value} percent`}
      max={100}
      step={1}
    />
  );
}

import { Slider } from "@/components/ui/slider";

export default function SliderDemo() {
  return <Slider defaultValue={[33]} getAriaLabel={() => "Value"} max={100} step={1} />;
}

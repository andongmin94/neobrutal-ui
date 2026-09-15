import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const densities = [
  {
    value: "comfortable",
    label: "Comfortable",
    detail: "More breathing room for forms and documentation.",
  },
  {
    value: "balanced",
    label: "Balanced",
    detail: "A practical default for most product screens.",
  },
  {
    value: "compact",
    label: "Compact",
    detail: "Higher information density for dashboards.",
  },
];

export default function RadioGroupDemo() {
  return (
    <fieldset className="w-full max-w-md">
      <legend className="mb-3 font-heading">Interface density</legend>
      <RadioGroup defaultValue="balanced" className="grid gap-2">
        {densities.map((density) => (
          <div
            key={density.value}
            className="flex items-start gap-3 rounded-base border-2 border-border bg-secondary-background p-3 has-[[data-checked]]:bg-main has-[[data-checked]]:text-main-foreground"
          >
            <RadioGroupItem
              value={density.value}
              id={`density-${density.value}`}
              className="mt-0.5"
            />
            <Label
              htmlFor={`density-${density.value}`}
              className="grid cursor-pointer gap-1 leading-none"
            >
              <span className="font-heading">{density.label}</span>
              <span className="text-sm font-base leading-5 opacity-80">{density.detail}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

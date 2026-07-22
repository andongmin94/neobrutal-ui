import { Checkbox } from "@/components/ui/checkbox";

export default function CheckboxDemo() {
  return (
    <label htmlFor="accept-terms" className="flex min-h-10 cursor-pointer items-center gap-3">
      <Checkbox id="accept-terms" />
      <span className="text-sm">Accept terms</span>
    </label>
  );
}

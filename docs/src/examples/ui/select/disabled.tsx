import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const environments = [
  { value: "development", label: "Development" },
  { value: "preview", label: "Preview" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
];

export default function SelectDemo() {
  return (
    <div className="grid w-full max-w-xs gap-2">
      <label htmlFor="locked-environment" className="font-heading">
        Deployment environment
      </label>
      <Select items={environments} defaultValue="staging" disabled>
        <SelectTrigger id="locked-environment" aria-label="Locked deployment environment">
          <SelectValue placeholder="Choose an environment" />
        </SelectTrigger>
        <SelectContent>
          {environments.map((environment) => (
            <SelectItem key={environment.value} value={environment.value}>
              {environment.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-foreground/70">Unlock deployments to change this setting.</p>
    </div>
  );
}

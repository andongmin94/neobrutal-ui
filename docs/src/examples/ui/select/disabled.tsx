import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectDemo() {
  return (
    <div className="grid w-full max-w-xs gap-2">
      <label htmlFor="locked-environment" className="font-heading">
        Deployment environment
      </label>
      <Select defaultValue="staging" disabled>
        <SelectTrigger id="locked-environment" aria-label="Locked deployment environment">
          <SelectValue placeholder="Choose an environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="development">Development</SelectItem>
          <SelectItem value="preview">Preview</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="production">Production</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-foreground/70">Unlock deployments to change this setting.</p>
    </div>
  );
}

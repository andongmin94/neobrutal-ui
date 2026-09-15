import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LabelDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="workspace-name">Workspace name</Label>
      <Input id="workspace-name" name="workspaceName" defaultValue="neobrutal-ui" />
      <p className="text-sm leading-5 text-foreground/70">
        Visible to everyone who can access this workspace.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="w-full max-w-sm rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label htmlFor="auto-publish" className="font-heading">
            Auto-publish documentation
          </Label>
          <p className="mt-1 text-sm leading-5 text-foreground/75">
            Deploy the docs site after the registry checks pass.
          </p>
        </div>
        <Switch id="auto-publish" checked={enabled} onCheckedChange={setEnabled} />
      </div>
      <p className="mt-4 border-t-2 border-border pt-3 text-sm" role="status">
        Preview setting: <strong>{enabled ? "enabled" : "disabled"}</strong>
      </p>
    </div>
  );
}

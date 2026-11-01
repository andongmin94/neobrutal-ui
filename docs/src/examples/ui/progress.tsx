"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

export default function ProgressDemo() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid w-[60%] gap-5">
      <div className="grid gap-2">
        <p className="text-sm font-heading">Measured progress</p>
        <Progress value={progress} aria-label="Loading progress" />
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-heading">Unknown total</p>
        <Progress value={null} aria-label="Processing progress" />
      </div>
    </div>
  );
}

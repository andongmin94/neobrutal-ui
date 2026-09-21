"use client";

import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AlertWithButtonDemo() {
  const [undone, setUndone] = useState(false);

  return (
    <Alert>
      <CheckCircle2Icon aria-hidden="true" />
      <AlertTitle className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          {undone
            ? "The selected emails have been restored to the inbox."
            : "The selected emails have been marked as spam."}
        </span>
        <Button
          size="sm"
          variant="noShadow"
          className="shrink-0 bg-secondary-background text-foreground"
          disabled={undone}
          onClick={() => setUndone(true)}
        >
          {undone ? "Undone" : "Undo"}
        </Button>
      </AlertTitle>
    </Alert>
  );
}

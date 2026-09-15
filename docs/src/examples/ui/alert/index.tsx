import { CircleCheckBig } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AlertDemo() {
  return (
    <Alert className="w-full max-w-xl">
      <CircleCheckBig aria-hidden="true" />
      <AlertTitle>Registry checks passed</AlertTitle>
      <AlertDescription>
        The schema, generated files, and fresh consumer builds are ready for review.
      </AlertDescription>
    </Alert>
  );
}

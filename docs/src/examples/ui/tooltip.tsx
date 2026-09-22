import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="noShadow" size="icon" aria-label="Registry verification status" />
          }
        >
          <ShieldCheck aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified in fresh Next.js and Vite projects.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

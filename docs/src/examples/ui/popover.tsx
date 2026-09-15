import { Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const checks = ["Registry schema valid", "Next.js consumer built", "Vite consumer built"];

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="noShadow">View release status</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(22rem,calc(100vw-2rem))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <PopoverTitle>Release candidate</PopoverTitle>
            <PopoverDescription className="mt-1">
              All required consumer checks completed successfully.
            </PopoverDescription>
          </div>
          <span className="rounded-base border-2 border-border bg-main px-2 py-1 text-xs font-heading text-main-foreground">
            Ready
          </span>
        </div>
        <ul className="mt-4 divide-y-2 divide-border border-y-2 border-border">
          {checks.map((check) => (
            <li key={check} className="flex items-center gap-3 py-3 text-sm">
              <Check className="size-4 shrink-0" aria-hidden="true" />
              {check}
            </li>
          ))}
        </ul>
        <a
          href="/docs/registry"
          className="mt-4 inline-flex items-center gap-2 font-heading underline underline-offset-4"
        >
          Review registry guidance
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </PopoverContent>
    </Popover>
  );
}

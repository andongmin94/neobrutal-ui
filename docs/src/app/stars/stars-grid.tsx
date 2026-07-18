import STARS from "@/data/stars";

import { TooltipProvider } from "@/components/ui/tooltip";

import CopyBtn from "./copy-btn";
import ShadcnBtn from "./shadcn-btn";

const REGISTRY_BASE_URL =
  process.env.NEXT_PUBLIC_REGISTRY_BASE_URL || "https://neobrutal-ui.andongmin.com";

export default function StarsGrid() {
  const command = `npx shadcn@latest add ${REGISTRY_BASE_URL}/r/`;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-[50px]">
      {STARS.map((star, i) => {
        return (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-base border-2 border-border bg-secondary-background p-5 shadow-shadow"
            key={i}
          >
            <div className="size-[120px] md:size-[160px] xl:size-[200px]">
              <star.componentExample />
            </div>

            <h4 className="font-heading">Star {i + 1}</h4>

            <div className="flex items-center gap-2">
              <TooltipProvider delayDuration={0}>
                <ShadcnBtn command={command + `s${i + 1}.json`} />
                <CopyBtn code={star.code} />
              </TooltipProvider>
            </div>
          </div>
        );
      })}
    </div>
  );
}

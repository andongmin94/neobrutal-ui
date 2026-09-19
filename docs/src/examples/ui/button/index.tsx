import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ButtonDemo() {
  return (
    <div className="grid w-full gap-6">
      <div className="flex flex-wrap items-center gap-4">
        {(
          [
            "default",
            "outline",
            "ghost",
            "destructive",
            "link",
            "noShadow",
            "neutral",
            "reverse",
          ] as const
        ).map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Add item">
          <Plus aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button>
          <Download aria-hidden="true" />
          Download
        </Button>
        <Button disabled>Unavailable</Button>
        <Button disabled aria-busy="true">
          Saving…
        </Button>
      </div>
    </div>
  );
}

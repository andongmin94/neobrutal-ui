import { ScrollArea } from "@/components/ui/scroll-area";

export default function ScrollAreaMatrix() {
  return (
    <ScrollArea
      aria-label="Registry release matrix"
      className="h-40 w-full max-w-xs rounded-base border-2 border-border bg-secondary-background"
    >
      <ul className="grid w-max grid-cols-6 gap-3 p-4">
        {Array.from({ length: 36 }, (_, index) => (
          <li
            key={index}
            className="grid h-12 w-24 place-items-center rounded-base border-2 border-border bg-main text-sm font-heading text-main-foreground"
          >
            Release {index + 1}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

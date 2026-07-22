import { Separator } from "@/components/ui/separator";

export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm">
      <div>
        <h3 className="font-heading">neobrutal-ui</h3>
        <p className="text-sm">Copy-owned components built with Base UI.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-3 text-sm">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Registry</span>
        <Separator orientation="vertical" />
        <span>Templates</span>
      </div>
    </div>
  );
}

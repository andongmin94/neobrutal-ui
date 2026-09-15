import { Badge } from "@/components/ui/badge";

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Published</Badge>
      <Badge variant="neutral">Documentation</Badge>
      <Badge variant="neutral">v0.1.0</Badge>
    </div>
  );
}

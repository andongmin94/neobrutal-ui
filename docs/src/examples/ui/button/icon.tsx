import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ButtonIconDemo() {
  return (
    <Button size="icon" aria-label="More options">
      <MoreHorizontalIcon />
    </Button>
  );
}

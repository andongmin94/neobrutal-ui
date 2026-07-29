import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export default function InputGroupDemo() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <Search aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search components" placeholder="Search components..." />
      <InputGroupAddon align="inline-end">
        <InputGroupText>⌘ K</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

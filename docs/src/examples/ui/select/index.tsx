"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const items = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "published", label: "Published" },
];
export default function SelectDemo() {
  const [value, setValue] = useState("draft");
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Label htmlFor="publication-status">Publication status</Label>
      <Select items={items} value={value} onValueChange={setValue} name="status">
        <SelectTrigger id="publication-status" aria-label="Publication status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <output className="text-sm">Selected value: {value}</output>
    </div>
  );
}

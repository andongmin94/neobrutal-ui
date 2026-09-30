"use client";
import { useState } from "react";
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
  const [value, setValue] = useState<string | null>("draft");
  return (
    <div className="grid w-full max-w-xs gap-3">
      <label htmlFor="publication-status" className="text-sm font-heading leading-none select-none">
        Publication status
      </label>
      <Select items={items} value={value} onValueChange={setValue} name="status">
        <SelectTrigger id="publication-status" aria-label="Publication status">
          <SelectValue placeholder="Choose a status" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <output className="text-sm">Selected value: {value ?? "None"}</output>
    </div>
  );
}

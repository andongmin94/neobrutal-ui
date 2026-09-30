import { ChartBarIcon, ChartLineIcon, ChartPieIcon, CircleDashed } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartTypes = [
  {
    value: "line",
    label: (
      <>
        <ChartLineIcon />
        Line
      </>
    ),
  },
  {
    value: "bar",
    label: (
      <>
        <ChartBarIcon />
        Bar
      </>
    ),
  },
  {
    value: "pie",
    label: (
      <>
        <ChartPieIcon />
        Pie
      </>
    ),
  },
];

export default function SelectDemo() {
  return (
    <Select items={chartTypes}>
      <SelectTrigger className="w-[180px]" aria-label="Chart type">
        <SelectValue
          placeholder={
            <>
              <CircleDashed />
              With Icon
            </>
          }
        />
      </SelectTrigger>
      <SelectContent>
        {chartTypes.map((chartType) => (
          <SelectItem key={chartType.value} value={chartType.value}>
            {chartType.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

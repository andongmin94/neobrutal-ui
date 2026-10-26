"use client";

import { addDays } from "date-fns";
import { DateRange } from "@daypicker/react";

import * as React from "react";

import { Calendar } from "@/components/ui/calendar";

export default function CalendarRangeDemo() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    const from = new Date(new Date().getFullYear(), 0, 12);
    return { from, to: addDays(from, 30) };
  });

  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={setDateRange}
      numberOfMonths={2}
      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
    />
  );
}

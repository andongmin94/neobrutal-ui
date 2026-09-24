"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react";

type DayPickerProps = React.ComponentProps<typeof DayPicker>;

export type CalendarProps = DayPickerProps & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar rounded-base! border-2 border-border bg-secondary-background p-3 font-heading text-foreground shadow-shadow [--cell-radius:var(--radius-base)] [--cell-size:clamp(1.75rem,7vw,2.25rem)]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-2 sm:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 flex h-8 w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto absolute left-0 size-8 bg-transparent p-0 text-foreground select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto absolute right-0 size-8 bg-transparent p-0 text-foreground select-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "relative flex h-8 w-full items-center justify-center px-10 text-foreground",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn("relative rounded-(--cell-radius)", defaultClassNames.dropdown_root),
        dropdown: cn("absolute inset-0 bg-main opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-heading text-foreground select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-foreground",
          defaultClassNames.caption_label,
        ),
        month_grid: cn("w-full border-collapse space-y-1", defaultClassNames.month_grid),
        weekdays: cn("flex gap-0.5", defaultClassNames.weekdays),
        weekday: cn(
          "w-(--cell-size) rounded-(--cell-radius) text-xs font-base text-foreground/65 select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-1 flex w-full gap-0.5", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn("text-[0.8rem] text-foreground select-none", defaultClassNames.week_number),
        day: cn(
          "group/day relative p-0 text-center text-sm select-none focus-within:relative focus-within:z-20 [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.mode === "range"
            ? "[&:has(>.rdp-range_end)]:rounded-r-(--cell-radius) [&:has(>.rdp-range_start)]:rounded-l-(--cell-radius) data-[selected=true]:bg-main/15 first:data-[selected=true]:rounded-l-(--cell-radius) last:data-[selected=true]:rounded-r-(--cell-radius)"
            : "data-[selected=true]:rounded-(--cell-radius) data-[selected=true]:bg-main/15",
          defaultClassNames.day,
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-main/15 after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-main/15",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-main/15 after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-main/15",
          defaultClassNames.range_end,
        ),
        today: cn(
          "rounded-(--cell-radius) bg-secondary-background text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-foreground opacity-60 aria-selected:text-foreground aria-selected:opacity-100",
          defaultClassNames.outside,
        ),
        disabled: cn("text-foreground opacity-30", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
          }
          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
          }
          return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon-sm"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-today={modifiers.today}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 size-(--cell-size) border-transparent bg-transparent p-0 font-base text-foreground leading-none hover:border-border hover:bg-foreground/10 hover:text-foreground aria-selected:opacity-100 data-[today=true]:underline data-[today=true]:decoration-2 data-[today=true]:underline-offset-4 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:border-border data-[range-end=true]:bg-main data-[range-end=true]:text-main-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-main/15 data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:border-border data-[range-start=true]:bg-main data-[range-start=true]:text-main-foreground data-[selected-single=true]:rounded-(--cell-radius) data-[selected-single=true]:border-border data-[selected-single=true]:bg-main data-[selected-single=true]:text-main-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day_button,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };

import * as React from "react";
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react";

type DayPickerProps = React.ComponentProps<typeof DayPicker>;
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type CalendarProps = DistributiveOmit<DayPickerProps, "captionLayout"> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  captionLayout?: DayPickerProps["captionLayout"] | "buttons";
  fromDate?: Date;
  fromMonth?: Date;
  fromYear?: number;
  hideHead?: boolean;
  initialFocus?: boolean;
  toDate?: Date;
  toMonth?: Date;
  toYear?: number;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "noShadow",
  locale,
  formatters,
  components,
  startMonth,
  endMonth,
  hidden,
  autoFocus,
  hideWeekdays,
  fromDate,
  fromMonth,
  fromYear,
  hideHead,
  initialFocus,
  toDate,
  toMonth,
  toYear,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const resolvedCaptionLayout = captionLayout === "buttons" ? "label" : captionLayout;
  const resolvedStartMonth =
    startMonth ?? fromMonth ?? (fromYear === undefined ? fromDate : new Date(fromYear, 0));
  const resolvedEndMonth =
    endMonth ?? toMonth ?? (toYear === undefined ? toDate : new Date(toYear, 11));
  const legacyHidden = [
    fromDate && fromMonth === undefined && fromYear === undefined
      ? { before: fromDate }
      : undefined,
    toDate && toMonth === undefined && toYear === undefined ? { after: toDate } : undefined,
  ].filter((matcher) => matcher !== undefined);
  const resolvedHidden = legacyHidden.length
    ? [...(hidden === undefined ? [] : Array.isArray(hidden) ? hidden : [hidden]), ...legacyHidden]
    : hidden;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar rounded-base! border-2 border-border bg-main p-3 font-heading text-main-foreground shadow-shadow [--cell-radius:var(--radius-base)] [--cell-size:--spacing(9)] in-data-[slot=card-content]:bg-main in-data-[slot=popover-content]:bg-main",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={resolvedCaptionLayout}
      startMonth={resolvedStartMonth}
      endMonth={resolvedEndMonth}
      hidden={resolvedHidden}
      {...{ autoFocus: autoFocus ?? initialFocus }}
      hideWeekdays={hideWeekdays ?? hideHead}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-2 sm:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-1 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "absolute left-1 size-7 bg-transparent p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "absolute right-1 size-7 bg-transparent p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "relative flex w-full items-center justify-center pt-1 text-main-foreground",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn("relative rounded-(--cell-radius)", defaultClassNames.dropdown_root),
        dropdown: cn("absolute inset-0 bg-main opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-heading text-main-foreground select-none",
          resolvedCaptionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-main-foreground",
          defaultClassNames.caption_label,
        ),
        month_grid: cn("w-full border-collapse space-y-1", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-9 rounded-(--cell-radius) text-[0.8rem] font-base text-main-foreground select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] text-main-foreground select-none",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative p-0 text-center text-sm select-none focus-within:relative focus-within:z-20 [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.mode === "range"
            ? "[&:has(>.rdp-range_end)]:rounded-r-(--cell-radius) [&:has(>.rdp-range_start)]:rounded-l-(--cell-radius) data-[selected=true]:bg-black/50 first:data-[selected=true]:rounded-l-(--cell-radius) last:data-[selected=true]:rounded-r-(--cell-radius)"
            : "data-[selected=true]:rounded-(--cell-radius) data-[selected=true]:bg-black/50",
          defaultClassNames.day,
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-black/50 after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-black/50",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-black/50 after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-black/50",
          defaultClassNames.range_end,
        ),
        today: cn(
          "rounded-(--cell-radius) bg-secondary-background text-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-main-foreground opacity-50 aria-selected:text-main-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn("text-main-foreground opacity-50", defaultClassNames.disabled),
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
      variant="noShadow"
      size="icon-sm"
      data-day={day.date.toLocaleDateString(locale?.code)}
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
        "relative isolate z-10 size-9 p-0 font-base leading-none aria-selected:opacity-100 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-black group-data-[focused=true]/day:ring-offset-2 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:bg-black data-[range-end=true]:text-white data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-black/50 data-[range-middle=true]:text-white data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:bg-black data-[range-start=true]:text-white data-[selected-single=true]:rounded-(--cell-radius) data-[selected-single=true]:bg-black data-[selected-single=true]:text-white [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day_button,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };

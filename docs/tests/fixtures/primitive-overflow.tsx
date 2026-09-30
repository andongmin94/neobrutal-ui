import * as React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server.browser";
import { DayPicker, TZDate } from "react-day-picker";
import { faIR } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SheetSideExample from "@/examples/ui/sheet/side";
import "./primitive-overflow.css";

const query = new URLSearchParams(window.location.search);
const surface = query.get("surface");
const captionLayout = query.get("caption") === "label" ? "label" : "dropdown";
const fixedMonth = new Date(2024, 0, 1);
const calendarProps = {
  mode: "single" as const,
  defaultMonth: fixedMonth,
  startMonth: fixedMonth,
  endMonth: new Date(2024, 11, 1),
  today: new Date(2024, 0, 15),
};

function HydrationCalendar() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return (
    <>
      <Calendar {...calendarProps} captionLayout={captionLayout} />
      <output data-testid="calendar-hydrated">{hydrated ? "complete" : "pending"}</output>
    </>
  );
}

function LocaleCalendars() {
  const timeZone = "Pacific/Honolulu";
  const zonedMonth = new TZDate(2024, 0, 1, timeZone);
  return (
    <>
      <section data-testid="localized-calendar">
        <Calendar {...calendarProps} captionLayout="dropdown" locale={faIR} />
      </section>
      <section data-testid="native-calendar">
        <DayPicker {...calendarProps} captionLayout="dropdown" locale={faIR} />
      </section>
      <section data-testid="zoned-calendar">
        <Calendar
          mode="single"
          timeZone={timeZone}
          defaultMonth={zonedMonth}
          selected={zonedMonth}
          today={zonedMonth}
          showOutsideDays={false}
        />
      </section>
    </>
  );
}

function LongMenus() {
  const items = Array.from({ length: 40 }, (_, index) => index + 1);
  const target = React.useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col gap-4 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Open options</DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.map((item) => (
            <DropdownMenuItem key={item}>Option {item}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ContextMenu>
        <ContextMenuTrigger
          ref={target}
          tabIndex={0}
          className="flex h-20 w-52 items-center justify-center border-2 border-border"
        >
          Open context options
        </ContextMenuTrigger>
        <ContextMenuContent finalFocus={target}>
          {items.map((item) => (
            <ContextMenuItem key={item}>Context option {item}</ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

const root = document.getElementById("root")!;
if (surface === "calendar-hydrate") {
  document.documentElement.dataset.hydrationErrors = "[]";
  hydrateRoot(root, <HydrationCalendar />, {
    onRecoverableError(error) {
      const errors = JSON.parse(document.documentElement.dataset.hydrationErrors!) as string[];
      errors.push(String(error));
      document.documentElement.dataset.hydrationErrors = JSON.stringify(errors);
    },
  });
} else {
  createRoot(root).render(
    surface === "calendar-ssr" ? (
      <output data-testid="calendar-ssr-markup">{renderToString(<HydrationCalendar />)}</output>
    ) : surface === "calendar-locale" ? (
      <LocaleCalendars />
    ) : surface === "sheet" ? (
      <SheetSideExample />
    ) : (
      <LongMenus />
    ),
  );
}

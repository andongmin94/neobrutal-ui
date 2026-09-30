import * as React from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from "@/components/ui/chart";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function BadgeFixture() {
  const outer = React.useRef<HTMLSpanElement>(null);
  const inner = React.useRef<HTMLAnchorElement>(null);
  const [sameRef, setSameRef] = React.useState(false);
  const [calls, setCalls] = React.useState<string[]>([]);
  React.useEffect(
    () => setSameRef(outer.current === inner.current && inner.current?.tagName === "A"),
    [],
  );
  return (
    <section aria-label="Badge composition">
      <Badge
        ref={outer}
        onClick={() => setCalls((current) => [...current, "outer"])}
        style={{ color: "rgb(200, 0, 0)" }}
        render={
          <a
            ref={inner}
            href="#destination"
            style={{ fontWeight: 700 }}
            onClick={() => setCalls((current) => [...current, "inner"])}
          >
            Published
          </a>
        }
      />
      <output data-testid="badge-refs">{String(sameRef)}</output>
      <output data-testid="badge-calls">{calls.join(",")}</output>
    </section>
  );
}

function InputFixture() {
  const [calls, setCalls] = React.useState(0);
  const [cancelled, setCancelled] = React.useState(0);
  return (
    <section aria-label="Input composition">
      <InputGroup>
        <InputGroupAddon data-testid="normal-addon" onClick={() => setCalls((value) => value + 1)}>
          Search
        </InputGroupAddon>
        <InputGroupInput aria-label="Search field" />
        <InputGroupAddon
          data-testid="cancelled-addon"
          onClick={(event) => {
            event.preventDefault();
            setCancelled((value) => value + 1);
          }}
        >
          Cancel focus
        </InputGroupAddon>
        <InputGroupAddon>
          <InputGroupButton>Keep button focus</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <output data-testid="addon-calls">{calls}</output>
      <output data-testid="addon-cancelled">{cancelled}</output>
    </section>
  );
}

function CarouselFixture() {
  const [blocked, setBlocked] = React.useState(false);
  const [nextCalls, setNextCalls] = React.useState(0);
  const [previousCalls, setPreviousCalls] = React.useState(0);
  return (
    <section aria-label="Carousel composition">
      <Button onClick={() => setBlocked((value) => !value)} aria-pressed={blocked}>
        Block next navigation
      </Button>
      <Carousel aria-label="Composed slides" style={{ width: 300 }}>
        <CarouselContent style={{ display: "flex" }}>
          {["One", "Two", "Three"].map((title) => (
            <CarouselItem key={title} style={{ flex: "0 0 100%", minWidth: 0 }}>
              {title}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious onClick={() => setPreviousCalls((value) => value + 1)} />
        <CarouselNext
          onClick={(event) => {
            setNextCalls((value) => value + 1);
            if (blocked) event.preventDefault();
          }}
        />
      </Carousel>
      <output data-testid="next-calls">{nextCalls}</output>
      <output data-testid="previous-calls">{previousCalls}</output>
    </section>
  );
}

function SidebarControls() {
  const { state } = useSidebar();
  const [cancel, setCancel] = React.useState(false);
  const [calls, setCalls] = React.useState(0);
  const [railCalls, setRailCalls] = React.useState(0);
  const [disabledCalls, setDisabledCalls] = React.useState(0);
  return (
    <>
      <Button aria-pressed={cancel} onClick={() => setCancel((value) => !value)}>
        Cancel sidebar toggle
      </Button>
      <SidebarTrigger
        onClick={(event) => {
          setCalls((value) => value + 1);
          if (cancel) event.preventDefault();
        }}
      />
      <SidebarRail onClick={() => setRailCalls((value) => value + 1)} />
      <SidebarMenuButton
        disabled
        tooltip="Unavailable action"
        onClick={() => setDisabledCalls((value) => value + 1)}
      >
        Unavailable action
      </SidebarMenuButton>
      <output data-testid="sidebar-state">{state}</output>
      <output data-testid="sidebar-calls">{calls}</output>
      <output data-testid="rail-calls">{railCalls}</output>
      <output data-testid="disabled-calls">{disabledCalls}</output>
    </>
  );
}

function SidebarFixture() {
  const [observed, setObserved] = React.useState<boolean>();
  return (
    <section aria-label="Sidebar composition">
      <SidebarProvider defaultOpen={false} onOpenChange={setObserved}>
        <SidebarControls />
        <output data-testid="sidebar-observed">{String(observed)}</output>
      </SidebarProvider>
    </section>
  );
}

function SelectFixture({ removal = false, cancelClear = false }) {
  const [value, setValue] = React.useState<string | null>("a");
  const [hasAlpha, setHasAlpha] = React.useState(true);
  const [calls, setCalls] = React.useState<(string | null)[]>([]);
  return (
    <section aria-label="Select controlled state">
      <output data-testid="selection-value">{value ?? "null"}</output>
      <output data-testid="selection-calls">{JSON.stringify(calls)}</output>
      <Button onClick={() => setHasAlpha(false)}>Remove Alpha</Button>
      <Select
        name="selection"
        value={value}
        items={[
          ...(hasAlpha ? [{ value: "a", label: "Alpha" }] : []),
          { value: "b", label: "Bravo" },
        ]}
        onValueChange={(nextValue, details) => {
          setCalls((current) => [...current, nextValue]);
          if (nextValue === null && cancelClear) details.cancel();
          else setValue(nextValue);
        }}
      >
        <SelectTrigger aria-label="Selection">
          <SelectValue placeholder="No selection" />
        </SelectTrigger>
        <SelectContent>
          {hasAlpha && <SelectItem value="a">Alpha</SelectItem>}
          <SelectItem value="b">Bravo</SelectItem>
          {!removal && <SelectItem value={null}>Clear selection</SelectItem>}
        </SelectContent>
      </Select>
    </section>
  );
}

const workspaceItems = Array.from({ length: 80 }, (_, index) => ({
  value: `workspace-${index}`,
  label: `Workspace ${index + 1}`,
}));

function LongSelectFixture() {
  const aligned = new URLSearchParams(location.search).get("aligned") === "true";
  return (
    <div style={{ paddingTop: aligned ? 120 : 0 }}>
      <Select defaultValue="workspace-39" items={workspaceItems}>
        <SelectTrigger aria-label="Workspace">
          <SelectValue placeholder="Choose workspace" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={aligned}>
          {workspaceItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EmptyCommandFixture() {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <>
      <Button onClick={() => setLoaded((current) => !current)}>Toggle available options</Button>
      <Command>
        <CommandInput placeholder="Find options" />
        <CommandList>
          <CommandEmpty>No options available</CommandEmpty>
          {loaded && <CommandItem>Loaded option</CommandItem>}
        </CommandList>
      </Command>
    </>
  );
}

function SwitchFixture() {
  const [checked, setChecked] = React.useState(true);
  return (
    <>
      {(["ltr", "rtl"] as const).map((direction) => (
        <div key={direction} dir={direction}>
          {(["default", "sm"] as const).map((size) => (
            <Switch
              key={size}
              size={size}
              checked={checked}
              onCheckedChange={setChecked}
              aria-label={`${direction} ${size}`}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function LongAlertFixture() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button />}>Open long confirmation</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive all project records?</AlertDialogTitle>
          <AlertDialogDescription>
            {Array.from(
              { length: 8 },
              () =>
                "The records will leave the active review queue. Review each consequence before confirming this operation. ",
            ).join("")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep active</AlertDialogCancel>
          <AlertDialogAction>Archive records</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ChartHtmlPropsFixture() {
  const tooltip = React.useRef<HTMLDivElement>(null);
  const legend = React.useRef<HTMLDivElement>(null);
  const [refs, setRefs] = React.useState("");
  const [tooltipCalls, setTooltipCalls] = React.useState(0);
  const [legendCalls, setLegendCalls] = React.useState(0);
  React.useEffect(() => setRefs(`${tooltip.current?.id},${legend.current?.id}`), []);
  return (
    <>
      <ChartContainer
        config={{ visits: { label: "Visits", color: "blue" } }}
        style={{ width: 300, height: 200 }}
      >
        <div style={{ width: 300, height: 200 }}>
          <ChartTooltipContent
            active
            payload={[{ graphicalItemId: "visits", dataKey: "visits", name: "Visits", value: 120 }]}
            htmlProps={{
              id: "composition-tooltip",
              ref: tooltip,
              onClick: () => setTooltipCalls((current) => current + 1),
            }}
          />
          <ChartLegendContent
            payload={[{ dataKey: "visits", value: "Visits", color: "blue", type: "square" }]}
            htmlProps={{
              id: "composition-legend",
              ref: legend,
              onClick: () => setLegendCalls((current) => current + 1),
            }}
          />
        </div>
      </ChartContainer>
      <output data-testid="chart-refs">{refs}</output>
      <output data-testid="tooltip-calls">{tooltipCalls}</output>
      <output data-testid="legend-calls">{legendCalls}</output>
    </>
  );
}

const surface = new URLSearchParams(location.search).get("surface");
if (surface) await import("./component-composition.css");

const fixtures = {
  "select-clear": <SelectFixture />,
  "select-remove": <SelectFixture removal />,
  "select-cancel": <SelectFixture cancelClear />,
  "select-long": <LongSelectFixture />,
  "command-empty": <EmptyCommandFixture />,
  switch: <SwitchFixture />,
  "alert-long": <LongAlertFixture />,
  "chart-html-props": <ChartHtmlPropsFixture />,
};

createRoot(document.getElementById("root")!).render(
  surface && surface in fixtures ? (
    <main style={{ padding: 16 }}>{fixtures[surface as keyof typeof fixtures]}</main>
  ) : (
    <>
      <BadgeFixture />
      <InputFixture />
      <CarouselFixture />
      <SidebarFixture />
    </>
  ),
);

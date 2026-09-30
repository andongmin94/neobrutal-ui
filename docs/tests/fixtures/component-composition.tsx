import * as React from "react";
import { createRoot } from "react-dom/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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

createRoot(document.getElementById("root")!).render(
  <>
    <BadgeFixture />
    <InputFixture />
    <CarouselFixture />
    <SidebarFixture />
  </>,
);

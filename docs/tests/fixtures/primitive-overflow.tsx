import * as React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server.browser";
import { DayPicker, TZDate, type DateRange } from "@daypicker/react";
import { faIR } from "@daypicker/react/locale";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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

function ControlledCalendar() {
  const [month, setMonth] = React.useState(fixedMonth);
  const [updates, setUpdates] = React.useState(0);
  return (
    <>
      <Calendar
        {...calendarProps}
        month={month}
        onMonthChange={setMonth}
        endMonth={new Date(2026, 11, 1)}
        captionLayout="dropdown"
      />
      <Button onClick={() => setUpdates((current) => current + 1)}>Refresh calendar props</Button>
      <output data-testid="calendar-parent-updates">{updates}</output>
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

function DirectionalCalendar() {
  const direction = query.get("direction") === "rtl" ? "rtl" : "ltr";
  const requestedLayout = query.get("navLayout");
  const navLayout =
    requestedLayout === "around" || requestedLayout === "after" ? requestedLayout : undefined;
  const [range, setRange] = React.useState<DateRange | undefined>(() => ({
    from: new Date(2024, 0, 5),
    to: new Date(2024, 0, 10),
  }));
  return (
    <Calendar
      dir={direction}
      navLayout={navLayout}
      captionLayout={query.get("captionLayout") === "dropdown" ? "dropdown" : "label"}
      numberOfMonths={query.get("months") === "2" ? 2 : 1}
      mode="range"
      defaultMonth={fixedMonth}
      selected={range}
      onSelect={setRange}
      today={new Date(2024, 0, 15)}
    />
  );
}

function OtpPasteField({ readOnly }: { readOnly: boolean }) {
  const [value, setValue] = React.useState("1234");
  const [changes, setChanges] = React.useState(0);
  const [captures, setCaptures] = React.useState(0);
  return (
    <section aria-label={readOnly ? "Read-only OTP" : "Editable OTP"}>
      <InputOTP
        aria-label="Verification code"
        maxLength={4}
        value={value}
        readOnly={readOnly}
        pasteTransformer={(text) => text.replaceAll("-", "")}
        onChange={(nextValue) => {
          setValue(nextValue);
          setChanges((count) => count + 1);
        }}
        onPasteCapture={() => setCaptures((count) => count + 1)}
      >
        <InputOTPGroup>
          {[0, 1, 2, 3].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <output data-testid="paste-changes">{changes}</output>
      <output data-testid="paste-captures">{captures}</output>
    </section>
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

function LongNavigationMenu() {
  return (
    <div className="p-4">
      <NavigationMenu aria-label="Site sections">
        <NavigationMenuList>
          <NavigationMenuItem value="sections">
            <NavigationMenuTrigger>Sections</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-64">
                {Array.from({ length: 40 }, (_, index) => index + 1).map((item) => (
                  <li key={item}>
                    <NavigationMenuLink href={`#section-${item}`} active={item === 1}>
                      Section {item}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

function DirectionalNavigationMenu() {
  const direction = query.get("direction") === "rtl" ? "rtl" : "ltr";
  return (
    <div dir={direction} className="flex justify-center p-8">
      <DirectionProvider direction={direction}>
        <NavigationMenu aria-label="Directional sections">
          <NavigationMenuList>
            {["Guides", "Resources"].map((section) => (
              <NavigationMenuItem key={section} value={section}>
                <NavigationMenuTrigger>{section}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-60">
                    {["Overview", "Reference"].map((page) => (
                      <li key={page}>
                        <NavigationMenuLink href={`#${section}-${page}`}>
                          {section} {page}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </DirectionProvider>
    </div>
  );
}

function DirectionalPortals() {
  const direction = query.get("direction") === "rtl" ? "rtl" : "ltr";
  const kind = query.get("kind");
  return (
    <div dir={direction} className="flex justify-center p-8">
      <DirectionProvider direction={direction}>
        {kind === "popover" ? (
          <Popover>
            <PopoverTrigger render={<Button />}>Open popover</PopoverTrigger>
            <PopoverContent align="start" className="w-60">
              <PopoverTitle>Popover details</PopoverTitle>
              <p>Local direction is preserved.</p>
            </PopoverContent>
          </Popover>
        ) : kind === "tooltip" ? (
          <Tooltip>
            <TooltipTrigger delay={0} render={<Button />}>
              Open tooltip
            </TooltipTrigger>
            <TooltipContent align="start" className="w-60">
              Tooltip details
            </TooltipContent>
          </Tooltip>
        ) : kind === "hover-card" ? (
          <HoverCard>
            <HoverCardTrigger href="#profile" delay={0}>
              Open hover card
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-60">
              <p>Profile details</p>
            </HoverCardContent>
          </HoverCard>
        ) : kind === "dialog" ? (
          <Dialog>
            <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog details</DialogTitle>
                <DialogDescription>Local direction is preserved.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        ) : kind === "alert-dialog" ? (
          <AlertDialog>
            <AlertDialogTrigger render={<Button />}>Open alert dialog</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alert details</AlertDialogTitle>
                <AlertDialogDescription>Local direction is preserved.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogContent>
          </AlertDialog>
        ) : kind === "sheet" ? (
          <Sheet>
            <SheetTrigger render={<Button />}>Open sheet</SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet details</SheetTitle>
                <SheetDescription>Local direction is preserved.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        ) : (
          <Drawer>
            <DrawerTrigger render={<Button />}>Open drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Drawer details</DrawerTitle>
                <DrawerDescription>Local direction is preserved.</DrawerDescription>
              </DrawerHeader>
              <DrawerClose render={<Button />}>Close drawer</DrawerClose>
            </DrawerContent>
          </Drawer>
        )}
      </DirectionProvider>
    </div>
  );
}

const menuParts = {
  dropdown: {
    Group: DropdownMenuGroup,
    Label: DropdownMenuLabel,
    Item: DropdownMenuItem,
    CheckboxItem: DropdownMenuCheckboxItem,
    RadioGroup: DropdownMenuRadioGroup,
    RadioItem: DropdownMenuRadioItem,
    Sub: DropdownMenuSub,
    SubContent: DropdownMenuSubContent,
    SubTrigger: DropdownMenuSubTrigger,
  },
  context: {
    Group: ContextMenuGroup,
    Label: ContextMenuLabel,
    Item: ContextMenuItem,
    CheckboxItem: ContextMenuCheckboxItem,
    RadioGroup: ContextMenuRadioGroup,
    RadioItem: ContextMenuRadioItem,
    Sub: ContextMenuSub,
    SubContent: ContextMenuSubContent,
    SubTrigger: ContextMenuSubTrigger,
  },
  menubar: {
    Group: MenubarGroup,
    Label: MenubarLabel,
    Item: MenubarItem,
    CheckboxItem: MenubarCheckboxItem,
    RadioGroup: MenubarRadioGroup,
    RadioItem: MenubarRadioItem,
    Sub: MenubarSub,
    SubContent: MenubarSubContent,
    SubTrigger: MenubarSubTrigger,
  },
};

function MenuGroups({ kind }: { kind: keyof typeof menuParts }) {
  const { Group, Label, Item, CheckboxItem, RadioGroup, RadioItem, Sub, SubContent, SubTrigger } =
    menuParts[kind];
  return (
    <>
      <Group>
        <Label
          id={`${kind}-actions`}
          render={<span />}
          ref={(node) => {
            node?.setAttribute("data-label-ref", "attached");
          }}
          className={() => "native-menu-label"}
        >
          File actions
        </Label>
        <Item>Rename</Item>
        <Sub>
          <SubTrigger>Export</SubTrigger>
          <SubContent className="min-w-40">
            <Item>JSON</Item>
            <Item>CSV</Item>
          </SubContent>
        </Sub>
        <CheckboxItem defaultChecked>Show previews</CheckboxItem>
      </Group>
      <RadioGroup defaultValue="grid">
        <Label inset>View layout</Label>
        <RadioItem value="grid">Grid</RadioItem>
        <RadioItem value="list">List</RadioItem>
      </RadioGroup>
    </>
  );
}

function NamedMenus() {
  const kind = query.get("kind");
  const direction = query.get("direction") === "rtl" ? "rtl" : "ltr";
  const contextTarget = React.useRef<HTMLDivElement>(null);
  return (
    <section
      dir={direction}
      className="flex min-h-72 items-start justify-center p-8"
      data-testid="menu-direction"
    >
      {kind === "context" ? (
        <ContextMenu dir={direction}>
          <ContextMenuTrigger ref={contextTarget} tabIndex={0}>
            Context commands
          </ContextMenuTrigger>
          <ContextMenuContent className="min-w-48" finalFocus={contextTarget}>
            <MenuGroups kind="context" />
          </ContextMenuContent>
        </ContextMenu>
      ) : kind === "menubar" ? (
        <DirectionProvider direction={direction}>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Menu commands</MenubarTrigger>
              <MenubarContent className="w-72" alignOffset={0}>
                <MenuGroups kind="menubar" />
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </DirectionProvider>
      ) : (
        <DropdownMenu dir={direction}>
          <DropdownMenuTrigger render={<Button />}>Dropdown commands</DropdownMenuTrigger>
          <DropdownMenuContent className="w-72" align="start">
            <MenuGroups kind="dropdown" />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </section>
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
    ) : surface === "calendar-controlled" ? (
      <ControlledCalendar />
    ) : surface === "calendar-direction" ? (
      <DirectionalCalendar />
    ) : surface === "otp-paste" ? (
      <>
        <OtpPasteField readOnly />
        <OtpPasteField readOnly={false} />
      </>
    ) : surface === "sheet" ? (
      <SheetSideExample />
    ) : surface === "navigation-menu" ? (
      <LongNavigationMenu />
    ) : surface === "navigation-direction" ? (
      <DirectionalNavigationMenu />
    ) : surface === "portal-direction" ? (
      <DirectionalPortals />
    ) : surface === "named-menus" ? (
      <NamedMenus />
    ) : (
      <LongMenus />
    ),
  );
}

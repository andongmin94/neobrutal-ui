"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  CheckCircle2,
  Code2,
  Columns3,
  Command,
  Copy,
  Eye,
  FileText,
  GitBranch,
  Grid2X2,
  LayoutPanelLeft,
  Menu,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

type ComponentEntry = {
  category: string;
  description: string;
  name: string;
  slug: string;
  status: "New" | "Stable" | "Updated";
};

const componentEntries: ComponentEntry[] = [
  {
    category: "Actions",
    description: "A clickable control with nine visual variants.",
    name: "Button",
    slug: "button",
    status: "Stable",
  },
  {
    category: "Feedback",
    description: "A callout for short, important messages.",
    name: "Alert",
    slug: "alert",
    status: "Stable",
  },
  {
    category: "Disclosure",
    description: "A vertically stacked set of expandable sections.",
    name: "Accordion",
    slug: "accordion",
    status: "Updated",
  },
  {
    category: "Forms",
    description: "A compact binary input for immediate settings.",
    name: "Switch",
    slug: "switch",
    status: "Stable",
  },
  {
    category: "Forms",
    description: "A text field with the neobrutal focus treatment.",
    name: "Input",
    slug: "input",
    status: "Stable",
  },
  {
    category: "Navigation",
    description: "Switch between content panels using the keyboard.",
    name: "Tabs",
    slug: "tabs",
    status: "Updated",
  },
  {
    category: "Overlays",
    description: "A focused window rendered above the page.",
    name: "Dialog",
    slug: "dialog",
    status: "Stable",
  },
  {
    category: "Overlays",
    description: "Contextual content that opens beside a trigger.",
    name: "Popover",
    slug: "popover",
    status: "Stable",
  },
  {
    category: "Data display",
    description: "Structured rows and columns for dense information.",
    name: "Table",
    slug: "table",
    status: "Stable",
  },
  {
    category: "Data display",
    description: "Accessible data visualizations powered by Recharts.",
    name: "Chart",
    slug: "chart",
    status: "New",
  },
  {
    category: "Navigation",
    description: "A fast keyboard-first command surface.",
    name: "Command",
    slug: "command",
    status: "Updated",
  },
  {
    category: "Forms",
    description: "Choose one option from a positioned popup list.",
    name: "Select",
    slug: "select",
    status: "Updated",
  },
];

const componentGroups = [
  { label: "Get started", items: ["Installation", "Theming"] },
  { label: "Actions", items: ["Button"] },
  { label: "Forms", items: ["Input", "Select", "Switch"] },
  { label: "Disclosure", items: ["Accordion"] },
  { label: "Feedback", items: ["Alert"] },
  { label: "Overlays", items: ["Dialog", "Popover"] },
  { label: "Navigation", items: ["Command", "Tabs"] },
  { label: "Data display", items: ["Chart", "Table"] },
];

const prototypeLinks = [
  { href: "/design-lab", label: "Overview", short: "00" },
  { href: "/design-lab/workbench", label: "Workbench", short: "01" },
  { href: "/design-lab/notebook", label: "Notebook", short: "02" },
  { href: "/design-lab/directory", label: "Directory", short: "03" },
  { href: "/design-lab/hybrid", label: "Hybrid", short: "04" },
];

const installCommand = "npx shadcn@latest add https://neobrutal-ui.andongmin.com/r/button.json";

const demoVariables = {
  "--background": "#dceafe",
  "--secondary-background": "#ffffff",
  "--foreground": "#000000",
  "--main": "#5294ff",
  "--main-foreground": "#000000",
  "--border": "#000000",
  "--ring": "#000000",
  "--shadow": "4px 4px 0 0 #000000",
  "--border-radius": "5px",
  "--box-shadow-x": "4px",
  "--box-shadow-y": "4px",
} as React.CSSProperties;

function useCopyFeedback() {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, []);

  return { copied, copy };
}

export function LabSwitcher() {
  const pathname = usePathname();
  const activeLinkRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    activeLinkRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 flex h-12 items-center border-b-2 border-black bg-black px-3 text-sm text-white sm:px-5">
      <Link
        aria-label="Back to current docs"
        className="mr-3 grid size-8 shrink-0 place-items-center border border-white/40 hover:bg-white hover:text-black"
        href="/"
        title="Back to current docs"
      >
        <ArrowLeft className="size-4" />
      </Link>
      <Link className="mr-5 hidden font-bold tracking-[0.08em] sm:block" href="/design-lab">
        DOCS DESIGN LAB
      </Link>
      <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {prototypeLinks.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex h-8 shrink-0 items-center gap-2 border px-3 font-semibold transition-colors ${
                active
                  ? "border-[#c8ff3d] bg-[#c8ff3d] text-black"
                  : "border-transparent text-white/70 hover:border-white/40 hover:text-white"
              }`}
              href={item.href}
              key={item.href}
              ref={active ? activeLinkRef : undefined}
            >
              <span className="font-mono text-[10px]">{item.short}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
      <span className="ml-3 hidden shrink-0 text-xs text-white/50 md:block">UNPUBLISHED</span>
    </nav>
  );
}

function CopyCommand({ dark = false }: { dark?: boolean }) {
  const { copied, copy } = useCopyFeedback();

  return (
    <div
      className={`flex min-w-0 items-center border-2 ${dark ? "border-white/30 bg-black" : "border-black bg-white"}`}
    >
      <code className="min-w-0 flex-1 truncate px-3 py-2 font-mono text-[11px]">
        {installCommand}
      </code>
      <button
        aria-label="Copy install command"
        className={`grid size-9 shrink-0 place-items-center border-l-2 ${
          dark
            ? "border-white/30 hover:bg-[#c8ff3d] hover:text-black"
            : "border-black hover:bg-[#ffe14d]"
        }`}
        onClick={copy}
        title="Copy install command"
        type="button"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

function ComponentDemo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`bg-background text-foreground ${compact ? "space-y-4 p-4" : "space-y-6 p-5 sm:p-8"}`}
      style={demoVariables}
    >
      <Alert>
        <CheckCircle2 />
        <AlertTitle>Component ready</AlertTitle>
        <AlertDescription>Your registry is connected and ready to install.</AlertDescription>
      </Alert>

      <Input aria-label="Project name" defaultValue="neobrutal-app" />

      <div className="flex flex-wrap items-center gap-3">
        <Button>Deploy component</Button>
        <Button variant="neutral">View source</Button>
        <div className="ml-auto flex items-center gap-2 text-sm font-heading">
          Preview
          <Switch aria-label="Toggle preview" defaultChecked />
        </div>
      </div>

      <Accordion collapsible defaultValue="item-1" type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. The component keeps keyboard navigation and focus management intact.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Can I customize it?</AccordionTrigger>
          <AccordionContent>
            Yes. Change the tokens, classes, and source code inside your own project.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function CodeDemo({ dark = false }: { dark?: boolean }) {
  return (
    <pre
      className={`min-h-[310px] overflow-auto p-5 font-mono text-xs leading-6 ${
        dark ? "bg-[#10110f] text-[#d9ff75]" : "bg-[#171717] text-[#f8f5ed]"
      }`}
    >
      <code>{`import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  return (
    <div className="flex gap-3">
      <Button>Deploy component</Button>
      <Button variant="neutral">
        View source
      </Button>
    </div>
  )
}`}</code>
    </pre>
  );
}

function SegmentControl({
  active,
  dark = false,
  onChange,
}: {
  active: "preview" | "code";
  dark?: boolean;
  onChange: (value: "preview" | "code") => void;
}) {
  return (
    <div className={`inline-flex border-2 ${dark ? "border-white/30" : "border-black"}`}>
      {(["preview", "code"] as const).map((value) => (
        <button
          className={`flex h-9 items-center gap-2 px-3 text-xs font-bold uppercase ${
            value !== "preview"
              ? dark
                ? "border-l-2 border-white/30"
                : "border-l-2 border-black"
              : ""
          } ${
            active === value
              ? dark
                ? "bg-[#c8ff3d] text-black"
                : "bg-black text-white"
              : dark
                ? "bg-transparent text-white/70 hover:text-white"
                : "bg-white hover:bg-[#ffe14d]"
          }`}
          key={value}
          onClick={() => onChange(value)}
          type="button"
        >
          {value === "preview" ? <Eye className="size-4" /> : <Code2 className="size-4" />}
          {value}
        </button>
      ))}
    </div>
  );
}

function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link className="flex items-center gap-2" href="/design-lab">
      <span
        className={`grid size-8 place-items-center border-2 text-base font-black ${
          inverted ? "border-white bg-[#c8ff3d] text-black" : "border-black bg-[#5294ff]"
        }`}
      >
        N
      </span>
      <span className="font-black">neobrutal-ui</span>
    </Link>
  );
}

function StatusPill({ status }: { status: ComponentEntry["status"] }) {
  const color =
    status === "New" ? "bg-[#ffe14d]" : status === "Updated" ? "bg-[#ff796b]" : "bg-white";
  return (
    <span className={`border border-black px-2 py-0.5 font-mono text-[10px] uppercase ${color}`}>
      {status}
    </span>
  );
}

const overviewItems = [
  {
    accent: "#c8ff3d",
    description: "A focused builder with navigation, canvas, and live controls.",
    href: "/design-lab/workbench",
    icon: LayoutPanelLeft,
    name: "Workbench",
    number: "01",
    preview: "workbench",
  },
  {
    accent: "#ff796b",
    description: "An editorial reference manual built for deliberate reading.",
    href: "/design-lab/notebook",
    icon: BookOpenText,
    name: "Notebook",
    number: "02",
    preview: "notebook",
  },
  {
    accent: "#ffe14d",
    description: "A dense, search-first catalog for scanning the whole library.",
    href: "/design-lab/directory",
    icon: Grid2X2,
    name: "Directory",
    number: "03",
    preview: "directory",
  },
  {
    accent: "#5294ff",
    description: "The catalog and component workbench combined in one shell.",
    href: "/design-lab/hybrid",
    icon: Columns3,
    name: "Hybrid",
    number: "04",
    preview: "hybrid",
  },
];

function Miniature({ type }: { type: string }) {
  if (type === "workbench") {
    return (
      <div className="grid h-44 grid-cols-[22%_1fr_26%] gap-px bg-black p-px">
        <div className="space-y-2 bg-[#20221f] p-3">
          <div className="h-2 w-3/4 bg-[#c8ff3d]" />
          <div className="h-2 w-full bg-white/20" />
          <div className="h-2 w-2/3 bg-white/20" />
        </div>
        <div className="grid place-items-center bg-[#f2f1ec] p-3">
          <div className="h-20 w-full border-2 border-black bg-[#5294ff] shadow-[3px_3px_0_#000]" />
        </div>
        <div className="space-y-3 bg-[#141512] p-3">
          <div className="h-5 border border-white/30" />
          <div className="h-2 w-1/2 bg-white/30" />
          <div className="h-6 bg-[#c8ff3d]" />
        </div>
      </div>
    );
  }

  if (type === "notebook") {
    return (
      <div className="grid h-44 grid-cols-[28%_1fr] border border-black bg-[#f7f4ec]">
        <div className="space-y-3 border-r border-black p-4">
          <div className="h-2 w-2/3 bg-[#ff796b]" />
          <div className="h-px bg-black/30" />
          <div className="h-px bg-black/30" />
          <div className="h-px bg-black/30" />
        </div>
        <div className="p-5">
          <div className="mb-3 h-3 w-1/2 bg-black" />
          <div className="mb-2 h-px bg-black/20" />
          <div className="mb-5 h-px w-4/5 bg-black/20" />
          <div className="h-16 border-2 border-black bg-white shadow-[3px_3px_0_#ff796b]" />
        </div>
      </div>
    );
  }

  if (type === "directory") {
    return (
      <div className="h-44 border border-black bg-[#f4f4f0] p-3">
        <div className="mb-3 h-7 border-2 border-black bg-white" />
        <div className="grid grid-cols-2 gap-2">
          {["#5294ff", "#ffe14d", "#fff", "#ff796b"].map((color) => (
            <div
              className="h-12 border-2 border-black p-2"
              key={color}
              style={{ background: color }}
            >
              <div className="h-2 w-1/2 bg-black" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-44 grid-cols-[25%_1fr] gap-px bg-black p-px">
      <div className="space-y-2 bg-white p-3">
        <div className="h-5 border-2 border-black" />
        <div className="h-3 bg-[#5294ff]" />
        <div className="h-3 bg-black/10" />
        <div className="h-3 bg-black/10" />
      </div>
      <div className="grid grid-rows-[30%_1fr] gap-px bg-black">
        <div className="bg-[#ffe14d] p-3">
          <div className="h-3 w-1/3 bg-black" />
        </div>
        <div className="grid place-items-center bg-[#dceafe] p-4">
          <div className="h-14 w-4/5 border-2 border-black bg-[#5294ff] shadow-[3px_3px_0_#000]" />
        </div>
      </div>
    </div>
  );
}

export function PrototypeOverview() {
  return (
    <main className="min-h-[calc(100dvh-48px)] bg-[#efeee8]">
      <header className="border-b-2 border-black px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em]">
              Four directions / same components
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-none sm:text-6xl">
              Choose the docs shell.
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6">
            Every route below uses the same component data, install command, and live UI. Only the
            information architecture and visual language change.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] border-x-2 border-black md:grid-cols-2">
        {overviewItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              className={`group block bg-white p-5 transition-colors hover:bg-[#fffdf5] sm:p-7 ${
                index % 2 === 0 ? "md:border-r-2 md:border-black" : ""
              } ${index < 2 ? "border-b-2 border-black" : index === 2 ? "border-b-2 border-black md:border-b-0" : ""}`}
              href={item.href}
              key={item.href}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-xs">{item.number}</span>
                <span
                  className="grid size-9 place-items-center border-2 border-black"
                  style={{ background: item.accent }}
                >
                  <Icon className="size-4" />
                </span>
              </div>
              <Miniature type={item.preview} />
              <div className="mt-5 flex items-end justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-black">{item.name}</h2>
                  <p className="mt-1 max-w-md text-sm leading-5">{item.description}</p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center border-2 border-black bg-white transition-transform group-hover:translate-x-1">
                  <ArrowRight className="size-5" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}

export function WorkbenchPrototype() {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const [density, setDensity] = React.useState<"compact" | "comfortable">("comfortable");
  const [selected, setSelected] = React.useState("Button");

  return (
    <main className="min-h-[calc(100dvh-48px)] bg-[#171916] text-[#f5f5ef]">
      <header className="flex min-h-16 items-center gap-4 border-b border-white/20 px-4 lg:px-6">
        <Logo inverted />
        <span className="hidden border-l border-white/30 pl-4 font-mono text-xs text-white/50 sm:block">
          COMPONENT WORKBENCH
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="GitHub repository"
            className="grid size-9 place-items-center border border-white/30 hover:border-[#c8ff3d] hover:text-[#c8ff3d]"
            title="GitHub repository"
            type="button"
          >
            <GitBranch className="size-4" />
          </button>
          <button
            aria-label="Open menu"
            className="grid size-9 place-items-center border border-white/30 lg:hidden"
            title="Open menu"
            type="button"
          >
            <Menu className="size-4" />
          </button>
          <Link
            className="hidden h-9 items-center border border-[#c8ff3d] bg-[#c8ff3d] px-3 text-xs font-bold text-black sm:flex"
            href="/docs/installation"
          >
            GET STARTED
          </Link>
        </div>
      </header>

      <div className="grid min-h-[calc(100dvh-112px)] grid-cols-[minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)_290px]">
        <aside className="hidden border-r border-white/20 bg-[#20221f] p-4 lg:block">
          <label className="mb-5 flex h-9 items-center gap-2 border border-white/30 px-3 text-xs text-white/60">
            <Search className="size-4" />
            <input className="min-w-0 bg-transparent outline-none" placeholder="Find component" />
            <Command className="ml-auto size-3" />
          </label>
          <nav className="space-y-5">
            {componentGroups.slice(1).map((group) => (
              <div key={group.label}>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      className={`flex w-full items-center justify-between px-2 py-1.5 text-left text-sm ${
                        selected === item
                          ? "bg-[#c8ff3d] font-bold text-black"
                          : "hover:bg-white/10"
                      }`}
                      key={item}
                      onClick={() => setSelected(item)}
                      type="button"
                    >
                      {item}
                      {selected === item && <ArrowRight className="size-3" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 bg-[#f2f1ec] text-black">
          <div className="border-b-2 border-black px-5 py-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase text-black/50">
                  Components <span>/</span> {selected}
                </div>
                <h1 className="text-3xl font-black sm:text-4xl">{selected}</h1>
                <p className="mt-2 text-sm">
                  A live component surface with code and install controls.
                </p>
              </div>
              <SegmentControl active={tab} onChange={setTab} />
            </div>
          </div>
          <div className={`mx-auto max-w-4xl ${density === "compact" ? "p-4" : "p-6 lg:p-10"}`}>
            <div className="border-2 border-black shadow-[6px_6px_0_#000]">
              <div className="flex h-10 items-center justify-between border-b-2 border-black bg-white px-3">
                <span className="font-mono text-[10px] uppercase">Live canvas</span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-black/50">
                  <span className="size-2 bg-[#3ddc84]" /> READY
                </span>
              </div>
              {tab === "preview" ? <ComponentDemo compact={density === "compact"} /> : <CodeDemo />}
            </div>
          </div>
        </section>

        <aside className="border-t border-white/20 bg-[#141512] p-5 lg:border-t-0 lg:border-l">
          <div className="mb-6 flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-[#c8ff3d]" />
            <h2 className="text-sm font-bold uppercase">Inspector</h2>
          </div>
          <div className="space-y-6">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase text-white/50">Density</p>
              <div className="grid grid-cols-2 border border-white/30">
                {(["compact", "comfortable"] as const).map((value) => (
                  <button
                    className={`h-9 text-xs ${
                      value === "comfortable" ? "border-l border-white/30" : ""
                    } ${density === value ? "bg-[#c8ff3d] font-bold text-black" : "text-white/60"}`}
                    key={value}
                    onClick={() => setDensity(value)}
                    type="button"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase text-white/50">Tokens</p>
              <div className="grid grid-cols-4 gap-2">
                {["#5294ff", "#ffe14d", "#ff796b", "#c8ff3d"].map((color) => (
                  <button
                    aria-label={`Accent ${color}`}
                    className="aspect-square border-2 border-white/40 hover:border-white"
                    key={color}
                    style={{ background: color }}
                    title={`Accent ${color}`}
                    type="button"
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase text-white/50">Install</p>
              <CopyCommand dark />
            </div>
            <div className="border-t border-white/20 pt-5 text-xs leading-5 text-white/50">
              <p className="mb-1 text-white">Base UI primitive</p>
              <p>Source-owned, accessible, and ready to customize.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function NotebookPrototype() {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");

  return (
    <main className="min-h-[calc(100dvh-48px)] bg-[#f7f4ec] text-[#171717]">
      <header className="border-b-2 border-black">
        <div className="mx-auto flex min-h-20 max-w-[1420px] items-center gap-8 px-5 sm:px-8">
          <Logo />
          <nav className="ml-auto hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link href="/docs">Docs</Link>
            <Link href="/docs/accordion">Components</Link>
            <Link href="/styling">Styling</Link>
            <Link href="/charts">Charts</Link>
          </nav>
          <button
            aria-label="Search documentation"
            className="grid size-9 place-items-center border-2 border-black bg-[#ff796b]"
            title="Search documentation"
            type="button"
          >
            <Search className="size-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1420px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden border-r-2 border-black px-7 py-12 lg:block">
          <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.16em]">On this page</p>
          <ol className="space-y-4 text-sm">
            {[
              ["01", "Overview"],
              ["02", "Installation"],
              ["03", "Usage"],
              ["04", "Anatomy"],
              ["05", "Accessibility"],
            ].map(([number, label], index) => (
              <li key={label}>
                <a
                  className={`flex items-center gap-3 border-b py-2 ${
                    index === 0 ? "border-black font-bold" : "border-black/20 text-black/60"
                  }`}
                  href={`#${label.toLowerCase()}`}
                >
                  <span className="font-mono text-[10px]">{number}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-12 border-l-4 border-[#ff796b] pl-4 text-xs leading-5">
            Built on Base UI. The source stays in your project.
          </div>
        </aside>

        <article className="min-w-0">
          <header className="border-b-2 border-black px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
            <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
              Components <span className="text-black/30">/</span> Disclosure
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] sm:text-7xl">Accordion</h1>
            <p className="mt-6 max-w-2xl text-lg leading-7">
              A vertically stacked set of interactive headings that each reveal a section of
              content.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <StatusPill status="Updated" />
              <span className="border border-black bg-white px-2 py-0.5 font-mono text-[10px] uppercase">
                Base UI
              </span>
              <span className="border border-black bg-white px-2 py-0.5 font-mono text-[10px] uppercase">
                v1.0
              </span>
            </div>
          </header>

          <section className="border-b-2 border-black px-5 py-10 sm:px-10 lg:px-14" id="overview">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/50">
                  Example 01
                </p>
                <h2 className="mt-1 text-2xl font-black">Default accordion</h2>
              </div>
              <SegmentControl active={tab} onChange={setTab} />
            </div>
            <div className="border-2 border-black bg-white shadow-[6px_6px_0_#ff796b]">
              {tab === "preview" ? <ComponentDemo /> : <CodeDemo />}
            </div>
          </section>

          <section
            className="grid border-b-2 border-black md:grid-cols-[1fr_1fr]"
            id="installation"
          >
            <div className="border-b-2 border-black p-6 sm:p-10 md:border-r-2 md:border-b-0 lg:p-14">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em]">Installation</p>
              <h2 className="text-3xl font-black">Add it to your project.</h2>
              <p className="mt-4 max-w-lg text-sm leading-6">
                The registry copies the component source and required dependencies into your app.
              </p>
            </div>
            <div className="grid content-center bg-[#ff796b] p-6 sm:p-10 lg:p-14">
              <CopyCommand />
            </div>
          </section>

          <section
            className="grid gap-8 px-5 py-10 sm:px-10 md:grid-cols-2 lg:px-14"
            id="accessibility"
          >
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em]">Keyboard</p>
              <h2 className="text-2xl font-black">Designed for every input.</h2>
            </div>
            <p className="text-sm leading-7">
              Arrow keys move between triggers. Enter and Space open a section. Focus remains
              visible and predictable across the full interaction.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

export function DirectoryPrototype() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const categories = ["All", ...Array.from(new Set(componentEntries.map((item) => item.category)))];
  const filtered = componentEntries.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      `${item.name} ${item.description} ${item.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <main className="min-h-[calc(100dvh-48px)] bg-[#f4f4f0] text-black">
      <header className="border-b-2 border-black bg-[#ffe14d]">
        <div className="mx-auto flex min-h-16 max-w-[1540px] items-center gap-5 px-4 sm:px-7">
          <Logo />
          <span className="hidden border-l-2 border-black pl-5 font-mono text-[10px] uppercase lg:block">
            Component directory
          </span>
          <nav className="ml-auto hidden items-center gap-6 text-sm font-bold md:flex">
            <Link href="/docs/installation">Install</Link>
            <Link href="/styling">Styling</Link>
            <Link href="/charts">Charts</Link>
          </nav>
          <button
            aria-label="Open GitHub"
            className="grid size-9 place-items-center border-2 border-black bg-white shadow-[3px_3px_0_#000] transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
            title="Open GitHub"
            type="button"
          >
            <GitBranch className="size-4" />
          </button>
        </div>
      </header>

      <section className="border-b-2 border-black bg-[#5294ff] px-4 py-8 sm:px-7 sm:py-12">
        <div className="mx-auto max-w-[1540px]">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                Prototype index / 12 components
              </p>
              <h1 className="text-4xl font-black sm:text-6xl">Find the right component.</h1>
            </div>
            <p className="max-w-md text-sm leading-6">
              Search by name or purpose, then open the reference or copy the registry command.
            </p>
          </div>
          <label className="mt-8 flex h-14 max-w-4xl items-center gap-3 border-2 border-black bg-white px-4 shadow-[5px_5px_0_#000]">
            <Search className="size-5 shrink-0" />
            <input
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-black/40"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search button, forms, overlays..."
              value={query}
            />
            {query && (
              <button
                aria-label="Clear search"
                className="grid size-8 place-items-center hover:bg-[#ffe14d]"
                onClick={() => setQuery("")}
                title="Clear search"
                type="button"
              >
                <X className="size-4" />
              </button>
            )}
            <span className="hidden border border-black bg-[#ffe14d] px-2 py-1 font-mono text-[10px] sm:block">
              ⌘ K
            </span>
          </label>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1540px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="border-b-2 border-black p-4 sm:p-6 lg:border-r-2 lg:border-b-0">
          <div className="flex items-center gap-2 lg:mb-5">
            <SlidersHorizontal className="size-4" />
            <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Filter</p>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-0 lg:block lg:space-y-1">
            {categories.map((item) => {
              const count =
                item === "All"
                  ? componentEntries.length
                  : componentEntries.filter((entry) => entry.category === item).length;
              return (
                <button
                  className={`flex h-9 shrink-0 items-center justify-between gap-5 border-2 px-3 text-sm lg:w-full ${
                    category === item
                      ? "border-black bg-[#ffe14d] font-bold"
                      : "border-transparent hover:border-black"
                  }`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                  <span className="font-mono text-[10px] text-black/50">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex items-center justify-between border-b-2 border-black pb-3">
            <p className="font-mono text-xs uppercase">{filtered.length} results</p>
            <span className="font-mono text-[10px] text-black/50">UPDATED THIS WEEK</span>
          </div>
          {filtered.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item, index) => (
                <Link
                  className={`group flex min-h-44 flex-col border-2 border-black p-4 shadow-[4px_4px_0_#000] transition-all duration-150 hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                    index % 4 === 0
                      ? "bg-[#5294ff]"
                      : index % 4 === 1
                        ? "bg-white"
                        : index % 4 === 2
                          ? "bg-[#ff796b]"
                          : "bg-[#ffe14d]"
                  }`}
                  href={`/docs/${item.slug}`}
                  key={item.slug}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <Package className="size-5" />
                    <StatusPill status={item.status} />
                  </div>
                  <h2 className="text-xl font-black">{item.name}</h2>
                  <p className="mt-1 text-sm leading-5">{item.description}</p>
                  <div className="mt-auto flex items-end justify-between pt-5">
                    <span className="font-mono text-[10px] uppercase">{item.category}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center border-2 border-dashed border-black bg-white p-8 text-center">
              <div>
                <Search className="mx-auto mb-3 size-6" />
                <h2 className="text-xl font-black">No components found</h2>
                <button className="mt-3 underline" onClick={() => setQuery("")} type="button">
                  Clear the search
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export function HybridPrototype() {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(componentEntries[0]);
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const filtered = componentEntries.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="min-h-[calc(100dvh-48px)] bg-white text-black">
      <header className="border-b-2 border-black bg-white">
        <div className="flex min-h-16 items-center gap-5 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-5 border-l-2 border-black pl-5 text-sm font-bold md:flex">
            <Link href="/docs">Docs</Link>
            <Link href="/styling">Styling</Link>
            <Link href="/charts">Charts</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden border border-black bg-[#ffe14d] px-2 py-1 font-mono text-[10px] sm:block">
              12 COMPONENT SAMPLE
            </span>
            <button
              aria-label="GitHub repository"
              className="grid size-9 place-items-center border-2 border-black bg-[#5294ff] shadow-[3px_3px_0_#000] transition-all duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
              title="GitHub repository"
              type="button"
            >
              <GitBranch className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100dvh-112px)] grid-cols-[minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b-2 border-black bg-[#f4f4f0] lg:border-r-2 lg:border-b-0">
          <div className="border-b-2 border-black p-4">
            <label className="flex h-10 items-center gap-2 border-2 border-black bg-white px-3">
              <Search className="size-4" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a component"
                value={query}
              />
            </label>
          </div>
          <nav className="max-h-52 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-h-[calc(100dvh-178px)]">
            {filtered.map((item) => (
              <button
                className={`flex w-full items-center justify-between border-2 px-3 py-2 text-left text-sm ${
                  selected.slug === item.slug
                    ? "border-black bg-[#5294ff] font-bold"
                    : "border-transparent hover:border-black hover:bg-white"
                }`}
                key={item.slug}
                onClick={() => setSelected(item)}
                type="button"
              >
                <span>
                  <span className="block">{item.name}</span>
                  <span className="font-mono text-[9px] uppercase text-black/50">
                    {item.category}
                  </span>
                </span>
                {selected.slug === item.slug && <ArrowRight className="size-4" />}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="grid grid-cols-[minmax(0,1fr)] border-b-2 border-black xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="bg-[#ffe14d] p-5 sm:p-7 lg:p-9">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase">
                  Components / {selected.category}
                </span>
                <StatusPill status={selected.status} />
              </div>
              <h1 className="text-4xl font-black sm:text-6xl">{selected.name}</h1>
              <p className="mt-4 max-w-2xl text-base leading-6">{selected.description}</p>
            </div>
            <div className="border-t-2 border-black bg-[#171717] p-5 text-white xl:border-t-0 xl:border-l-2">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase">
                <Package className="size-4 text-[#c8ff3d]" /> Install
              </p>
              <CopyCommand dark />
              <div className="mt-5 grid grid-cols-2 gap-px bg-white/30 p-px font-mono text-[10px] uppercase">
                <div className="bg-[#171717] p-2">
                  Primitive <span className="mt-1 block text-white/50">Base UI</span>
                </div>
                <div className="bg-[#171717] p-2">
                  Version <span className="mt-1 block text-white/50">1.0.0</span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0 bg-[#dceafe] p-4 sm:p-7 lg:p-10">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-mono text-[10px] uppercase text-black/50">Live example</p>
                  <h2 className="text-xl font-black">Default</h2>
                </div>
                <SegmentControl active={tab} onChange={setTab} />
              </div>
              <div className="border-2 border-black bg-white shadow-[6px_6px_0_#000]">
                {tab === "preview" ? <ComponentDemo /> : <CodeDemo />}
              </div>
            </div>

            <aside className="border-t-2 border-black bg-white p-5 xl:border-t-0 xl:border-l-2">
              <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase">
                <FileText className="size-4" /> On this page
              </p>
              <nav className="space-y-1 text-sm">
                {["Preview", "Installation", "Usage", "API reference", "Accessibility"].map(
                  (item, index) => (
                    <a
                      className={`flex items-center justify-between border-l-4 px-3 py-2 ${
                        index === 0
                          ? "border-[#5294ff] bg-[#dceafe] font-bold"
                          : "border-transparent hover:border-black"
                      }`}
                      href={`#${item.toLowerCase().replace(" ", "-")}`}
                      key={item}
                    >
                      {item}
                      <span className="font-mono text-[9px]">0{index + 1}</span>
                    </a>
                  ),
                )}
              </nav>
              <div className="mt-8 border-2 border-black bg-[#ff796b] p-4">
                <Sparkles className="mb-3 size-5" />
                <p className="text-sm font-bold">Recently updated</p>
                <p className="mt-1 text-xs leading-5">
                  Base UI behavior and keyboard support are aligned.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

from pathlib import Path
import json
import re


def write(name, content):
    file = Path(name)
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(content.strip() + '\n')


def replace(name, old, new):
    file = Path(name)
    content = file.read_text()
    assert old in content, f'Missing edit anchor in {name}: {old[:80]}'
    file.write_text(content.replace(old, new))

write('docs/app/components/home-showcase.tsx', r'''
import { Check, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function HomeShowcase() {
  const [saved, setSaved] = useState(false);
  return <div className="home-showcase">
    <div className="home-showcase__caption"><span>Not a screenshot.</span><span>Try it out ↓</span></div>
    <Card className="w-full bg-secondary-background">
      <CardHeader>
        <Badge className="w-fit">Built with neobrutal-ui</Badge>
        <h2 className="text-2xl font-heading">Your next big idea.</h2>
        <p className="text-sm text-foreground/70">A few components. A little personality.</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
          <div className="grid gap-2"><Label htmlFor="showcase-name">Workspace name</Label><Input id="showcase-name" defaultValue="Side project studio" onChange={() => setSaved(false)} /></div>
          <div className="flex items-center justify-between gap-4"><Label htmlFor="showcase-notifications">Keep me in the loop</Label><Switch id="showcase-notifications" defaultChecked /></div>
          <div className="flex flex-wrap items-center gap-4"><Button type="submit"><Check aria-hidden="true" />Save workspace</Button><Link className="home-showcase__link" to="/docs/card">View components<ArrowUpRight aria-hidden="true" size={16} /></Link></div>
          <p role="status" className="min-h-5 text-sm text-foreground/70">{saved ? "Saved locally in this demo. Nothing was sent." : "Editable source. No hosted UI dependency."}</p>
        </form>
      </CardContent>
    </Card>
  </div>;
}
''')

write('docs/app/components/directory-home.tsx', r'''
import { ArrowRight, Bell, ChevronDown, Layers, Layout, MousePointer, Navigation, Search, SlidersHorizontal, Table, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { buttonVariants } from "@/components/ui/button-variants";
import { COMPONENT_CATEGORIES, COMPONENT_DIRECTORY_LINKS, getComponentCategory, getComponentInstallMode, type ComponentGroup } from "@/data/component-directory";
import descriptions from "@/data/component-descriptions.json";
import { HomeShowcase } from "./home-showcase";

const categoryIcons: Record<ComponentGroup, LucideIcon> = {
  Actions: MousePointer, Forms: SlidersHorizontal, Navigation, Overlays: Layers,
  Feedback: Bell, Disclosure: ChevronDown, "Data display": Table, Layout,
};
const entries = COMPONENT_DIRECTORY_LINKS.map((link) => {
  const slug = link.href.split("/").pop()!;
  return { ...link, slug, category: getComponentCategory(slug), installMode: getComponentInstallMode(slug), description: (descriptions as Record<string, string>)[slug] };
});

export function DirectoryHome() {
  const [params, setParams] = useSearchParams();
  const searchInput = useRef<HTMLInputElement>(null);
  const query = params.get("q") ?? "";
  const category = COMPONENT_CATEGORIES.find((value) => value === params.get("category")) ?? "All";
  const filteredEntries = entries.filter((entry) => (category === "All" || entry.category === category) && `${entry.text} ${entry.category} ${entry.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  function setFilter(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value && value !== "All") next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true, preventScrollReset: true });
  }
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || target?.closest("input, textarea, select, [contenteditable=true]")) return;
      event.preventDefault(); searchInput.current?.focus();
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  return <main id="main-content" className="directory-page" tabIndex={-1}>
    <section className="directory-hero">
      <div className="directory-hero__inner">
        <div className="directory-hero__copy">
          <p className="eyebrow">React / Base UI / Tailwind CSS v4</p>
          <h1>Bold by design.<br />Yours to build.</h1>
          <p className="directory-hero__description">Neobrutalist components with hard shadows, clear interactions, and source you own. Install the pieces. Make them yours.</p>
          <div className="directory-hero__actions"><Link className={buttonVariants({ size: "lg" })} to="/docs/installation">Get started<ArrowRight aria-hidden="true" /></Link><a className="directory-browse-link" href="#components">Browse {entries.length} components</a></div>
          <p className="directory-hero__meta">Open source · MIT · Light and dark themes</p>
        </div>
        <HomeShowcase />
      </div>
    </section>
    <section className="directory-tools" id="components" aria-label="Component directory">
      <div><h2>Find your building blocks.</h2><p>Search by component, purpose, or category.</p></div>
      <label className="directory-search"><Search aria-hidden="true" size={20} /><input ref={searchInput} value={query} type="search" placeholder="Search components…" aria-label="Search component directory" onChange={(event) => setFilter("q", event.target.value)} />{query ? <button type="button" aria-label="Clear search" onClick={() => setFilter("q", "")}><X aria-hidden="true" size={17} /></button> : <kbd>/</kbd>}</label>
    </section>
    <div className="directory-browser">
      <aside className="directory-categories"><h2>Categories</h2><div>{COMPONENT_CATEGORIES.map((item) => <button key={item} type="button" aria-pressed={category === item} className={category === item ? "is-active" : undefined} onClick={() => setFilter("category", item)}><span>{item}</span><small>{item === "All" ? entries.length : entries.filter((entry) => entry.category === item).length}</small></button>)}</div></aside>
      <section className="directory-results" aria-label="Components">
        <div className="directory-results__head"><p aria-live="polite"><strong>{filteredEntries.length}</strong> {filteredEntries.length === 1 ? "component" : "components"}{category !== "All" ? ` in ${category}` : ""}</p><Link to="/templates">Explore complete templates <ArrowRight aria-hidden="true" size={14} /></Link></div>
        {filteredEntries.length ? <div className="directory-grid">{filteredEntries.map((entry) => {
          const Icon = categoryIcons[entry.category];
          return <Link key={entry.slug} className="directory-card" to={entry.href}>
            <div className="directory-card__top"><Icon aria-hidden="true" size={22} /><span>{entry.installMode}</span></div>
            <div className="directory-card__body"><h2>{entry.text}</h2><span>{entry.description}</span></div>
            <div className="directory-card__bottom"><span>{entry.category}</span><ArrowRight aria-hidden="true" size={17} /></div>
          </Link>;
        })}</div> : <div className="directory-empty"><Search aria-hidden="true" size={25} /><h2>No components found</h2><p>Try another term or clear the filters.</p><button type="button" onClick={() => setParams({}, { replace: true, preventScrollReset: true })}>Reset filters</button></div>}
      </section>
    </div>
  </main>;
}
''')

write('docs/app/styles/directory.css', r'''
.directory-page { display: flex; flex: 1 0 auto; min-height: 0; flex-direction: column; }
.directory-hero { border-bottom: 2px solid var(--border); background: var(--background); }
.directory-hero__inner { display: grid; width: min(100%,1500px); margin: 0 auto; padding: 64px 40px; grid-template-columns: minmax(0,1fr) minmax(320px,460px); align-items: center; gap: 64px; }
.directory-hero .eyebrow { margin: 0 0 24px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.directory-hero h1 { margin: 0; font-size: clamp(40px,4.8vw,70px); font-weight: 900; line-height: 1.05; letter-spacing: -0.045em; }
.directory-hero__description { max-width: 560px; margin: 24px 0; font-size: 17px; line-height: 1.75; }
.directory-hero__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 22px; }
.directory-browse-link { font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }
.directory-hero__meta { margin: 25px 0 0; color: var(--foreground-muted); font-size: 12px; }
.home-showcase { min-width: 0; }
.home-showcase__caption { display: flex; justify-content: space-between; margin-bottom: 12px; gap: 12px; font-family: var(--font-mono); font-size: 11px; }
.home-showcase__caption span:first-child { font-weight: 800; }
.home-showcase__link { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; text-decoration: underline; text-underline-offset: 4px; }
.directory-tools { display: grid; width: min(100%,1500px); margin: 0 auto; padding: 36px 40px; grid-template-columns: 1fr minmax(280px,480px); align-items: center; gap: 28px; scroll-margin-top: calc(var(--header-height) + 20px); }
.directory-tools h2 { margin: 0 0 6px; font-size: 23px; font-weight: 850; }
.directory-tools p { margin: 0; color: var(--foreground-muted); font-size: 14px; }
.directory-search { display: flex; min-width: 0; height: 50px; padding: 0 14px; gap: 12px; align-items: center; border: 2px solid var(--border); border-radius: var(--radius-small); background: var(--secondary-background); }
.directory-search:focus-within { outline: 2px solid var(--ring); outline-offset: 3px; }
.directory-search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 14px; }
.directory-search button { display: grid; width: 32px; height: 32px; place-items: center; background: transparent; border: 0; }
.directory-search kbd { border: 1px solid var(--border); padding: 0 6px; font-size: 12px; }
.directory-browser { display: grid; width: min(100%,1500px); margin: 0 auto; grid-template-columns: 210px minmax(0,1fr); padding: 0 40px 56px; gap: 30px; }
.directory-categories h2 { margin: 0 0 14px; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.directory-categories > div { display: grid; gap: 5px; }
.directory-categories button { display: flex; min-height: 42px; justify-content: space-between; align-items: center; gap: 14px; border: 2px solid transparent; border-radius: var(--radius-small); padding: 8px 10px; background: transparent; font-size: 13px; text-align: left; }
.directory-categories small { font-family: var(--font-mono); font-size: 11px; }
.directory-categories button:hover { background: var(--secondary-background); }
.directory-categories button.is-active { border-color: var(--border); background: var(--main); color: var(--main-foreground); font-weight: 750; box-shadow: 2px 2px 0 var(--border); }
.directory-results { min-width: 0; }
.directory-results__head { display: flex; margin-bottom: 16px; padding-bottom: 14px; justify-content: space-between; align-items: center; gap: 16px; border-bottom: 1px solid var(--border); font-size: 12px; }
.directory-results__head p { margin: 0; }
.directory-results__head a { display: inline-flex; align-items: center; gap: 6px; text-decoration: underline; text-underline-offset: 3px; }
.directory-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
.directory-card { display: flex; min-width: 0; flex-direction: column; gap: 18px; border: 2px solid var(--border); border-radius: var(--radius-small); padding: 18px; background: var(--secondary-background); color: var(--foreground); text-decoration: none; transition: box-shadow 140ms ease; }
.directory-card:hover, .directory-card:focus-visible { box-shadow: 4px 4px 0 var(--border); }
.directory-card__top, .directory-card__bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.directory-card__top > span { border: 1px solid var(--border); padding: 3px 6px; font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; }
.directory-card h2 { margin: 0 0 8px; font-size: 19px; font-weight: 800; }
.directory-card__body > span { display: block; font-size: 13px; line-height: 1.65; color: var(--foreground-muted); }
.directory-card__bottom { margin-top: auto; font-size: 10px; font-family: var(--font-mono); }
.directory-empty { display: grid; min-height: 300px; justify-items: center; align-content: center; gap: 12px; padding: 24px; text-align: center; border: 2px dashed var(--border); }
.directory-empty h2, .directory-empty p { margin: 0; }
.directory-empty button { margin-top: 8px; border: 2px solid var(--border); padding: 9px 14px; background: var(--main); color: var(--main-foreground); font-weight: 700; }
.theme-workbench { display: grid; grid-template-columns: 280px minmax(0,1fr); gap: 28px; }
.theme-workbench__controls { padding: 24px; background: var(--secondary-background); border: 2px solid var(--border); border-radius: var(--radius-small); }
.theme-workbench h2 { margin: 0 0 12px; font-size: 22px; font-weight: 800; }
.theme-workbench__controls p, .theme-workbench__export p { margin: 0 0 20px; font-size: 14px; line-height: 1.7; }
.theme-workbench__controls > label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 700; }
.theme-workbench__controls select { width: 100%; min-height: 44px; margin-bottom: 24px; border: 2px solid var(--border); border-radius: 4px; padding: 8px; background: var(--background); text-transform: capitalize; }
.theme-workbench__setting { margin-bottom: 22px; }
.theme-workbench__setting label { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; font-weight: 650; }
.theme-workbench__setting output { font-family: var(--font-mono); font-size: 12px; }
.theme-workbench__setting input { width: 100%; min-height: 32px; accent-color: var(--foreground); }
.theme-reset { width: 100%; min-height: 42px; border: 2px solid var(--border); padding: 8px; background: var(--background); font-size: 13px; font-weight: 700; }
.theme-workbench__stage { display: flex; min-width: 0; flex-direction: column; align-items: center; justify-content: center; gap: 28px; padding: 28px; border: 2px solid var(--border); background: var(--background); color: var(--foreground); font-weight: var(--base-font-weight); }
.theme-workbench__stage-label { display: flex; width: 100%; justify-content: space-between; gap: 12px; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.theme-workbench__hint { margin: 0; font-size: 12px; text-align: center; }
.theme-workbench__export { grid-column: 1 / -1; min-width: 0; max-width: 960px; width: 100%; }
.theme-workbench__export summary { cursor: pointer; min-height: 44px; padding-block: 10px; font-weight: 700; }
@media (max-width:1180px) { .directory-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .directory-hero__inner { gap: 36px; } }
@media (max-width:860px) {
  .directory-hero__inner { padding: 36px 24px; grid-template-columns: 1fr; gap: 32px; }
  .home-showcase { width: min(100%,520px); }
  .directory-tools { grid-template-columns: 1fr; padding: 28px 24px; }
  .directory-browser { grid-template-columns: 1fr; padding: 0 24px 40px; gap: 24px; }
  .directory-categories > div { display: flex; gap: 8px; overflow-x: auto; padding: 2px 3px 6px; }
  .directory-categories button { white-space: nowrap; }
  .theme-workbench { grid-template-columns: 1fr; }
  .theme-workbench__controls { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0 20px; }
  .theme-workbench__controls > h2, .theme-workbench__controls > p, .theme-workbench__controls > label, .theme-workbench__controls > select, .theme-reset { grid-column: 1 / -1; }
}
@media (max-width:560px) {
  .directory-hero__inner { padding: 30px 18px; }
  .directory-hero__description { font-size: 15px; }
  .directory-hero__actions { gap: 18px; }
  .directory-tools { padding: 26px 18px; }
  .directory-browser { padding: 0 18px 32px; }
  .directory-grid { grid-template-columns: 1fr; gap: 14px; }
  .directory-card { gap: 14px; }
  .directory-results__head { align-items: flex-start; flex-direction: column; gap: 8px; }
  .theme-workbench__controls, .theme-workbench__stage { padding: 18px; }
}
''')

# Button: compare the whole visual vocabulary in a single compact, source-backed preview.
write('docs/src/examples/ui/button/index.tsx', r'''
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ButtonDemo() {
  return <div className="grid w-full gap-6">
    <div className="flex flex-wrap items-center gap-4">
      {(["default", "outline", "secondary", "ghost", "destructive", "link", "noShadow", "neutral", "reverse"] as const).map((variant) => <Button key={variant} variant={variant}>{variant}</Button>)}
    </div>
    <div className="flex flex-wrap items-center gap-4"><Button size="xs">Extra small</Button><Button size="sm">Small</Button><Button>Default</Button><Button size="lg">Large</Button><Button size="icon" aria-label="Add item"><Plus aria-hidden="true" /></Button></div>
    <div className="flex flex-wrap items-center gap-4"><Button><Download aria-hidden="true" />Download</Button><Button disabled>Unavailable</Button><Button disabled aria-busy="true">Saving…</Button></div>
  </div>;
}
''')
write('docs/content/docs/button.mdx', r'''
---
title: Button
description: Action buttons with hard shadows, clear states, and explicit composition.
shadcnDocsLink: https://base-ui.com/react/components/button
---

<ComponentPreview component="button">
<include cwd lang="tsx">
  ./src/examples/ui/button/index.tsx
</include>
</ComponentPreview>

## Installation

<Installation component="button">
Install the design-system base first, then create both files. The CLI installs both automatically.

**`components/ui/button-variants.ts`**
<include cwd lang="ts">
  ./src/components/ui/button-variants.ts
</include>

**`components/ui/button.tsx`**
<include cwd lang="tsx">
  ./src/components/ui/button.tsx
</include>
</Installation>

## Usage

```tsx
import { Button } from "@/components/ui/button";

<Button type="submit">Save changes</Button>
```

Use a button for actions, not navigation. Set `type="submit"` explicitly when submitting a form.

## Variants and sizes

| Prop | Values | Default |
| --- | --- | --- |
| `variant` | `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`, `noShadow`, `neutral`, `reverse` | `default` |
| `size` | `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` | `default` |
| `disabled` | Prevents interaction and shows the disabled appearance | `false` |
| `render` | Composes with another button element or component | Native button |

`default` is the primary filled action; `outline` uses the page surface; `secondary` and `neutral` use the secondary surface. `ghost` removes the raised treatment. `destructive` marks destructive actions. `noShadow` keeps the border without the shadow, while `reverse` raises on hover. The `link` variant only changes appearance: it still represents an action button.

## States and accessible names

```tsx
<Button disabled aria-busy="true">Saving…</Button>
<Button size="icon" aria-label="Add item"><Plus aria-hidden="true" /></Button>
```

Import `Plus` from `lucide-react`. Give every icon-only control an accessible name. `aria-busy` communicates pending work; it does not disable a control or implement a loading operation. Keep the operation state in your application.

## Navigation links

Use a native anchor or router link with the server-safe style function. Do not put links inside `Button` or pass an anchor to its `render` prop.

```tsx
import { buttonVariants } from "@/components/ui/button-variants";

<a href="/about" className={buttonVariants({ variant: "outline", size: "sm" })}>
  About
</a>
```

## Composition

`render` forwards button behavior to the chosen element. A custom component must forward the supplied props and ref to its underlying button.

```tsx
<Button render={<button data-analytics="save" />}>Save changes</Button>
```

There is no additional `Button asChild` API. For keyboard interaction, disabled focus behavior, and the full primitive API, use the Base UI reference above.
''')
# Remove old one-button examples and their registrations: the primary example now includes all states.
p = Path('docs/src/data/components.ts')
s = p.read_text()
for name in ['Icon', 'Neutral', 'NoShadow', 'Reverse', 'WithIcon']:
    s = re.sub(rf'^const Button{name}Demo = .*;\n', '', s, flags=re.M)
start = s.index('    name: "Button",')
end = s.index('\n  },', start)
s = s[:start] + '    name: "Button",\n    exampleComponent: ButtonDemo,' + s[end:]
p.write_text(s)
for name in ['icon', 'neutral', 'no-shadow', 'reverse', 'with-icon']:
    Path(f'docs/src/examples/ui/button/{name}.tsx').unlink()

write('docs/src/examples/ui/dialog/index.tsx', r'''
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [savedName, setSavedName] = useState("");
  return <div className="grid justify-items-center gap-4">
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
      <DialogContent>
        <form className="grid gap-5" onSubmit={(event) => {
          event.preventDefault();
          setSavedName(String(new FormData(event.currentTarget).get("name") ?? ""));
          setOpen(false);
        }}>
          <DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>This demo only updates local state. No data is sent.</DialogDescription></DialogHeader>
          <div className="grid gap-2"><Label htmlFor="dialog-name">Name</Label><Input id="dialog-name" name="name" defaultValue={savedName || "Alex Doe"} required /></div>
          <DialogFooter><DialogClose render={<Button variant="neutral" />}>Cancel</DialogClose><Button type="submit">Save changes</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <p role="status" className="min-h-5 text-sm">{savedName ? `Saved: ${savedName}` : "Open the dialog, try Tab, then Escape."}</p>
  </div>;
}
''')
write('docs/content/docs/dialog.mdx', r'''
---
title: Dialog
description: A focused task in a modal surface, with keyboard focus management.
shadcnDocsLink: https://base-ui.com/react/components/dialog
---

<ComponentPreview component="dialog">
<include cwd lang="tsx">
  ./src/examples/ui/dialog/index.tsx
</include>
</ComponentPreview>

## Installation

<Installation component="dialog">
<include cwd lang="tsx">
  ./src/components/ui/dialog.tsx
</include>
</Installation>

The example also uses `input` and `label`. Install them when copying the complete form, rather than only the Dialog component.

## Usage

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
  <DialogContent>
    <DialogTitle>Workspace settings</DialogTitle>
    <DialogDescription>Update the options for this workspace.</DialogDescription>
  </DialogContent>
</Dialog>
```

## Controlled state

The live example controls `open` and closes only after handling form submission. In a real application, close after the operation succeeds; show errors inside the dialog and leave it open on failure.

| Part / prop | Purpose | Default |
| --- | --- | --- |
| `Dialog.open` / `onOpenChange` | Controlled visibility | Uncontrolled when omitted |
| `Dialog.defaultOpen` | Initial uncontrolled visibility | `false` |
| `DialogContent.showCloseButton` | Built-in close control | `true` |
| `DialogContent.initialFocus` | Override the initial focus destination | Base UI behavior |
| `DialogContent.finalFocus` | Override the focus destination after closing | Base UI behavior |
| `DialogTrigger.render` / `DialogClose.render` | Compose with your button | Primitive element |

## Keyboard and naming

Keep a meaningful `DialogTitle` and describe the task with `DialogDescription`. Tab and Shift+Tab move through the modal; Escape closes a dismissible dialog. Test that focus returns to its trigger after closing. Prefer the built-in focus behavior unless the task needs a specific destination.

Use `render` for new compositions, as shown above. For a destructive confirmation that must require an explicit choice, use [Alert Dialog](/docs/alert-dialog).

## Longer content

### Scrollable content

<ComponentPreview component="dialog" example="scrollable-content">
<include cwd lang="tsx">
  ./src/examples/ui/dialog/scrollable-content.tsx
</include>
</ComponentPreview>

### Sticky footer

<ComponentPreview component="dialog" example="sticky-footer">
<include cwd lang="tsx">
  ./src/examples/ui/dialog/sticky-footer.tsx
</include>
</ComponentPreview>
''')

write('docs/src/examples/ui/select/index.tsx', r'''
"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const items = [{ value: "draft", label: "Draft" }, { value: "review", label: "In review" }, { value: "published", label: "Published" }];
export default function SelectDemo() {
  const [value, setValue] = useState("draft");
  return <div className="grid w-full max-w-xs gap-3">
    <Label htmlFor="publication-status">Publication status</Label>
    <Select items={items} value={value} onValueChange={setValue} name="status">
      <SelectTrigger id="publication-status"><SelectValue /></SelectTrigger>
      <SelectContent>{items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
    </Select>
    <p role="status" className="text-sm">Selected value: {value}</p>
  </div>;
}
''')
p = Path('docs/content/docs/select.mdx')
s = p.read_text()
start, end = s.index('## Usage'), s.index('## Examples')
s = s[:start] + '''## Usage and controlled state

The primary example is a controlled Select. Keep its string value in React state, pass `onValueChange`, and provide `items` so the displayed label is available before the popup mounts. Copy the Code tab for a complete working example, including imports and a label.

For uncontrolled use, pass `defaultValue` instead of `value`. Do not switch between controlled and uncontrolled values during a component's lifetime.

| Part / prop | Purpose | Default |
| --- | --- | --- |
| `Select.value` / `onValueChange` | Controlled string value | Uncontrolled when omitted |
| `Select.defaultValue` | Initial uncontrolled selection | No selection |
| `Select.items` | Available values and display labels | Inferred from direct item children |
| `Select.name` | Name of the field submitted with a form | Not set |
| `Select.disabled` | Disables the selection control | `false` |
| `SelectTrigger.size` | `sm` or `default` | `default` |
| `SelectContent.side` | Preferred popup side | `bottom` |

This wrapper uses string values. It is not the full generic object-value API of the underlying primitive. Use a [Combobox](/docs/combobox) when users need to search the available options.

## Keyboard and form usage

Associate a `Label` with the trigger's `id`. Test arrow keys to navigate, Enter to choose, and Escape to dismiss. A placeholder is not a replacement for a label. The example includes `name="status"`; your form owns submission and validation.

''' + s[end:]
s = s.replace('shadcnDocsLink: https://ui.shadcn.com/docs/components/select', 'shadcnDocsLink: https://base-ui.com/react/components/select')
p.write_text(s)

# Bring simple trigger/close examples into the same composition style without a compatibility helper.
for p in Path('docs/src/examples/ui/dialog').glob('*.tsx'):
    s = p.read_text()
    s = re.sub(r'<(DialogTrigger|DialogClose) asChild>\s*<Button([^>]*)>([\s\S]*?)</Button>\s*</\1>', lambda m: f'<{m[1]} render={{<Button{m[2]} />}}>{m[3]}</{m[1]}>', s)
    p.write_text(s)

# Add repeatable contracts and real browser smoke tests to the existing docs toolchain.
p = Path('docs/package.json')
pkg = json.loads(p.read_text())
pkg['scripts']['test'] = 'tsx --test scripts/docs-contract.test.ts'
pkg['scripts']['test:browser'] = 'playwright test'
pkg['devDependencies']['@playwright/test'] = '1.58.2'
p.write_text(json.dumps(pkg, indent=2) + '\n')
p = Path('docs/.gitignore')
p.write_text(p.read_text() + '\n/playwright-report/\n/test-results/\n')
write('docs/playwright.config.ts', r'''
import { defineConfig } from "@playwright/test";
const baseURL = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:4173";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  timeout: 45000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, browserName: "chromium", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop-light", use: { viewport: { width: 1440, height: 900 }, colorScheme: "light" } },
    { name: "desktop-dark", use: { viewport: { width: 1440, height: 900 }, colorScheme: "dark" } },
    { name: "mobile-light", use: { viewport: { width: 390, height: 844 }, colorScheme: "light", isMobile: true, hasTouch: true } },
    { name: "mobile-dark", use: { viewport: { width: 390, height: 844 }, colorScheme: "dark", isMobile: true, hasTouch: true } },
  ],
  webServer: process.env.DOCS_TEST_URL ? undefined : { command: "npm run start -- --host 127.0.0.1 --port 4173", url: baseURL, reuseExistingServer: !process.env.CI },
});
''')
write('docs/scripts/docs-contract.test.ts', r'''
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import colors from "../src/data/colors";
import { createCustomizedTheme, serializeThemeCss, defaultThemeSettings, themeCss } from "../src/data/theme-styles";
import { COMPONENT_DIRECTORY_LINKS } from "../src/data/component-directory";
import descriptions from "../src/data/component-descriptions.json";
import components from "../src/data/components";

test("all palette exports match the installable registry contract", () => {
  for (const color of colors) {
    const item = JSON.parse(fs.readFileSync(`../registry/public/r/theme-${color.name}.json`, "utf8"));
    assert.deepEqual(createCustomizedTheme(color), item.cssVars);
    assert.deepEqual(themeCss, item.css);
    const css = serializeThemeCss(color);
    for (const section of Object.values(item.cssVars) as Record<string, string>[]) {
      for (const [key, value] of Object.entries(section)) assert.ok(css.includes(`--${key}: ${value};`), `${color.name}: missing ${key}`);
    }
  }
});
test("customization changes the same light/dark variables without dropping tokens", () => {
  const settings = { ...defaultThemeSettings, radius: 12, shadowX: -2, shadowY: 6, baseWeight: 600, headingWeight: 900 };
  const vars = createCustomizedTheme(colors[0], settings);
  assert.equal(vars.light.radius, "12px"); assert.equal(vars.dark.radius, "12px");
  assert.equal(vars.dark["box-shadow-x"], "-2px"); assert.equal(vars.light["base-font-weight"], "600");
  assert.ok(vars.theme["color-primary"] && vars.theme["color-sidebar"] && vars.theme["color-destructive"]);
});
test("shared theme sources are byte-identical after registry synchronization", () => {
  for (const name of ["theme.ts", "theme-styles.ts"]) assert.equal(fs.readFileSync(`src/data/${name}`, "utf8"), fs.readFileSync(`../registry/src/data/${name}`, "utf8"));
});
test("every directory card has a purpose-specific description", () => {
  for (const link of COMPONENT_DIRECTORY_LINKS) {
    const slug = link.href.split("/").pop()!;
    assert.ok((descriptions as Record<string, string>)[slug]?.length > 15, slug);
  }
});
test("markdown typography never uses bare descendant element selectors", () => {
  const css = fs.readFileSync("app/styles/content.css", "utf8");
  assert.doesNotMatch(css, /\.docs-content\s+(?:h[1-6]|p|a|ol|ul|li|strong)\b/);
});
test("all documented preview names resolve to a registered loader", () => {
  for (const file of fs.readdirSync("content/docs").filter((name) => name.endsWith(".mdx"))) {
    const source = fs.readFileSync(`content/docs/${file}`, "utf8");
    for (const match of source.matchAll(/<ComponentPreview\s+([^>]+)>/g)) {
      const attributes = match[1];
      if (attributes.includes('type="star"')) continue;
      const slug = attributes.match(/component="([^"]+)"/)?.[1];
      const example = attributes.match(/example="([^"]+)"/)?.[1];
      const component = components.find((entry) => entry.name.toLowerCase().replaceAll(" ", "-") === slug?.toLowerCase().replaceAll(" ", "-"));
      assert.ok(component && (example ? component.examples?.[example] : component.exampleComponent), `${file}: ${slug}/${example ?? "default"}`);
    }
  }
});
''')
write('docs/tests/docs.spec.ts', r'''
import { test, expect } from "@playwright/test";

test("home has a working showcase, installation path, and URL-backed directory", async ({ page }, info) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Bold by design/ })).toBeVisible();
  await page.getByLabel("Workspace name", { exact: true }).fill("Docs review");
  await page.getByRole("button", { name: "Save workspace" }).click();
  await expect(page.getByRole("status")).toContainText("Nothing was sent");
  await expect(page.getByRole("link", { name: "Get started", exact: true })).toHaveAttribute("href", "/docs/installation");
  await page.screenshot({ path: info.outputPath("home.png"), fullPage: true });
  await page.getByRole("searchbox", { name: "Search component directory" }).fill("calendar");
  await expect(page).toHaveURL(/q=calendar/);
  const card = page.locator(".directory-card").filter({ has: page.getByRole("heading", { name: "Calendar", exact: true }) });
  await card.click();
  await expect(page.getByRole("heading", { name: "Calendar", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("searchbox", { name: "Search component directory" })).toHaveValue("calendar");
});

test("markdown list and link styling does not leak into the breadcrumb preview", async ({ page }) => {
  await page.goto("/docs/breadcrumb");
  const list = page.locator('[data-react-component="breadcrumb"] [data-slot="breadcrumb-list"]').first();
  await expect(list).toBeVisible();
  const differences = await list.evaluate((node) => {
    const properties = ["marginTop", "marginBottom", "paddingLeft", "listStyleType", "fontWeight"] as const;
    const before = getComputedStyle(node);
    const snapshot = Object.fromEntries(properties.map((key) => [key, before[key]]));
    const clone = node.cloneNode(true) as HTMLElement;
    document.body.append(clone);
    const outside = getComputedStyle(clone);
    const diff = properties.filter((key) => snapshot[key] !== outside[key]);
    clone.remove();
    return diff;
  });
  expect(differences).toEqual([]);
  expect(await list.evaluate((node) => getComputedStyle(node).listStyleType)).toBe("none");
});

test("preview tabs really hide inactive content and small demos are compact", async ({ page }, info) => {
  await page.goto("/docs/button");
  const preview = page.locator(".component-preview").first();
  await expect(preview.locator('[data-slot="button"]').first()).toBeVisible();
  expect(await preview.locator(".component-preview__canvas").evaluate((node) => parseFloat(getComputedStyle(node).minHeight))).toBeLessThan(180);
  await preview.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(preview.locator(".component-preview__canvas")).toBeHidden();
  await expect(preview.locator(".component-preview__code")).toBeVisible();
  await preview.getByRole("tab", { name: "Preview", exact: true }).click();
  await expect(preview.locator(".component-preview__code")).toBeHidden();
  await page.screenshot({ path: info.outputPath("button.png"), fullPage: true });
});

test("dialog supports Escape, focus return, and real local form submission", async ({ page }) => {
  await page.goto("/docs/dialog");
  const primary = page.locator(".component-preview").first();
  const trigger = primary.getByRole("button", { name: "Edit profile" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Docs tester");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(primary.getByRole("status")).toHaveText("Saved: Docs tester");
});

test("controlled select supports keyboard choice", async ({ page }) => {
  await page.goto("/docs/select");
  const primary = page.locator(".component-preview").first();
  const trigger = primary.getByRole("combobox");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(primary.getByRole("status")).toHaveText("Selected value: published");
});

test("customizer uses scoped tokens, full CSS export, and reversible defaults", async ({ page }, info) => {
  await page.goto("/styling");
  await expect(page.getByLabel("Palette", { exact: true })).toBeVisible();
  const shellBefore = await page.locator("html").evaluate((node) => getComputedStyle(node).getPropertyValue("--main"));
  await page.getByLabel("Palette", { exact: true }).selectOption("red");
  const radius = page.getByRole("slider", { name: /Corner radius/ });
  await radius.fill("12");
  await expect(page.locator("[data-theme-preview]")).toHaveCSS("--radius", "12px");
  expect(await page.locator("html").evaluate((node) => getComputedStyle(node).getPropertyValue("--main"))).toBe(shellBefore);
  await page.getByText("Customized CSS — light and dark included", { exact: true }).click();
  await expect(page.locator("[data-theme-css]")).toContainText("--radius: 12px;");
  await expect(page.locator("[data-theme-css]")).toContainText("--color-primary: var(--primary);");
  await expect(page.locator("[data-theme-css]")).toContainText("--color-sidebar: var(--sidebar);");
  await page.screenshot({ path: info.outputPath("styling.png"), fullPage: true });
  await page.getByRole("button", { name: "Reset defaults" }).click();
  await expect(page.getByLabel("Palette", { exact: true })).toHaveValue("yellow");
  await expect(page.locator("[data-theme-preview]")).toHaveCSS("--radius", "5px");
});

test("representative pages have no page-level horizontal overflow or runtime errors", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["/", "/docs/installation", "/docs/button", "/docs/breadcrumb", "/docs/dialog", "/docs/select", "/styling", "/templates"]) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBe(true);
    await expect(page.locator("main h1").first()).toBeVisible();
    await page.locator('[data-react-host][aria-busy="true"]').first().waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBe(true);
    await expect(page.locator(".react-host__error")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  await page.screenshot({ path: info.outputPath("templates.png"), fullPage: true });
});
''')
print('Showcase, reference documentation, and tests staged in the runner workspace.')

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useForm } from "react-hook-form";

import { buttonVariants } from "../src/components/ui/button-variants";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../src/components/ui/form";
import colors from "../src/data/colors";
import { createThemeCssVars } from "../src/data/theme";
import { serializeThemeVariables } from "../src/data/theme-styles";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relative: string) => readFileSync(path.join(root, relative), "utf8");

function FieldFixture({
  omit,
  controlChild,
}: {
  omit?: "form" | "field" | "item";
  controlChild?: { value: React.ReactNode };
}) {
  const methods = useForm({ defaultValues: { username: "example" } });
  const content = (
    <>
      <FormLabel>Username</FormLabel>
      <FormControl>
        {(controlChild ? controlChild.value : <input name="username" />) as React.ReactElement}
      </FormControl>
      <FormDescription>Your public name.</FormDescription>
      <FormMessage>Example error text</FormMessage>
    </>
  );
  const item = omit === "item" ? content : <FormItem>{content}</FormItem>;
  const field =
    omit === "field" ? (
      item
    ) : (
      <FormField control={methods.control} name="username" render={() => item} />
    );

  return omit === "form" ? field : <Form {...methods}>{field}</Form>;
}

test("form helpers reject missing providers before field-state lookup", () => {
  for (const [omit, message] of [
    ["form", "useFormField should be used within <Form>"],
    ["field", "useFormField should be used within <FormField>"],
    ["item", "useFormField should be used within <FormItem>"],
  ] as const) {
    assert.throws(() => renderToStaticMarkup(<FieldFixture omit={omit} />), { message });
  }
});

test("FormControl rejects missing, text, sibling, and Fragment children", () => {
  for (const value of [
    null,
    "not a control",
    [<input key="first" />, <input key="second" />],
    <React.Fragment key="fragment">
      <input />
    </React.Fragment>,
  ]) {
    assert.throws(() => renderToStaticMarkup(<FieldFixture controlChild={{ value }} />), {
      message: "FormControl requires exactly one non-Fragment React element.",
    });
  }
});

test("server-rendered fields have unique labels and do not invent unregistered IDREFs", () => {
  const html = renderToStaticMarkup(
    <>
      <FieldFixture />
      <FieldFixture />
    </>,
  );
  const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map(([tag]) => tag);
  assert.equal(inputs.length, 2);
  const ids = inputs.map((tag) => {
    const id = /\bid="([^"]+)"/.exec(tag)?.[1];
    assert.ok(id, "input ID is present");
    assert.ok(html.includes(`for="${id}"`));
    // Mounted associations, custom IDs, and removal are checked in form-composition.spec.ts.
    // Server markup must not fabricate references based on parts that might not be rendered.
    assert.doesNotMatch(tag, /aria-describedby=/);
    return id;
  });
  assert.equal(new Set(ids).size, 2);
  assert.ok(html.includes("Your public name."));
  assert.ok(html.includes("Example error text"));
  assert.ok(html.includes("text-error"));
  assert.ok(!html.includes("undefined-form-"));
});

test("interactive focus stays semantic, compact, and keyboard-only", () => {
  // Pointer interaction must not add a second visual border around controls.
  const classes = buttonVariants({ variant: "neutral" }).split(/\s+/);
  assert.ok(classes.includes("focus-visible:ring-ring"));
  assert.ok(classes.includes("focus-visible:ring-1"));
  assert.ok(classes.includes("bg-secondary-background"));
  assert.ok(!classes.some((value) => value.includes("ring-offset")));
  assert.ok(!classes.includes("focus-visible:ring-black"));
  assert.ok(
    !classes.some((value) => value.startsWith("focus-visible:not-data-disabled:translate-")),
  );
  for (const relative of [
    "registry/src/components/ui/input.tsx",
    "registry/src/components/ui/textarea.tsx",
    "registry/src/components/ui/select.tsx",
    "registry/src/components/ui/input-group.tsx",
  ]) {
    const fieldSource = source(relative);
    assert.match(fieldSource, /focus-visible.*border-ring|focus-visible\]:border-ring/);
    assert.doesNotMatch(fieldSource, /focus-visible:ring-[1-9]|focus-visible\]:ring-[1-9]/);
    assert.doesNotMatch(fieldSource, /ring-offset/);
  }
  const selectSource = source("registry/src/components/ui/select.tsx");
  assert.doesNotMatch(selectSource, /\bfocus:ring-/);
  assert.doesNotMatch(source("registry/src/components/ui/button-variants.ts"), /\bsecondary\s*:/);
  assert.doesNotMatch(source("docs/content/docs/button.mdx"), /`secondary`/);
  assert.doesNotMatch(source("docs/src/examples/ui/button/index.tsx"), /"secondary"/);
});

test("popover uses Base UI native composition without legacy Radix adapters", () => {
  const popoverSource = source("registry/src/components/ui/popover.tsx");
  assert.doesNotMatch(
    popoverSource,
    /asChild|--radix-popover|onOpenAutoFocus|onCloseAutoFocus|onInteractOutside|forceMount/,
  );

  for (const relative of [
    "docs/src/examples/ui/popover.tsx",
    "docs/src/examples/ui/date-picker.tsx",
    "docs/src/examples/ui/combobox/index.tsx",
    "docs/src/examples/ui/combobox/users.tsx",
    "docs/src/examples/ui/combobox/timezones.tsx",
    "docs/src/examples/ui/combobox/multiselect.tsx",
  ]) {
    assert.doesNotMatch(source(relative), /<PopoverTrigger\s+asChild/, relative);
  }
});

test("dialog family uses Base UI native composition without legacy adapters", () => {
  for (const relative of [
    "registry/src/components/ui/dialog.tsx",
    "registry/src/components/ui/sheet.tsx",
    "registry/src/components/ui/alert-dialog.tsx",
  ]) {
    const componentSource = source(relative);
    assert.doesNotMatch(
      componentSource,
      /asChild|onOpenAutoFocus|onCloseAutoFocus|onInteractOutside|onPointerDownOutside|forceMount|preventBaseUIHandler|dismissableLayer|data-state=/,
      relative,
    );
  }

  assert.doesNotMatch(
    source("docs/src/special-pages/charts-examples.tsx"),
    /<DialogTrigger\s+asChild/,
  );
  assert.doesNotMatch(
    source("docs/src/examples/ui/sheet/index.tsx"),
    /<Sheet(?:Trigger|Close)\s+asChild/,
  );
  assert.doesNotMatch(
    source("docs/src/examples/ui/alert-dialog.tsx"),
    /<AlertDialogTrigger\s+asChild/,
  );
});

test("tooltip and hover card use Base UI native overlay composition", () => {
  const tooltipSource = source("registry/src/components/ui/tooltip.tsx");
  assert.doesNotMatch(
    tooltipSource,
    /asChild|--radix-tooltip|delayDuration|disableHoverableContent|skipDelayDuration|CustomEvent|forceMount|portalContainer|data-state=/,
  );

  const hoverCardSource = source("registry/src/components/ui/hover-card.tsx");
  assert.doesNotMatch(
    hoverCardSource,
    /asChild|--radix-hover-card|openDelay|CustomEvent|forceMount|MutationObserver|tabIndex\s*=\s*-1|data-state=/,
  );

  assert.doesNotMatch(source("docs/src/examples/ui/tooltip.tsx"), /<TooltipTrigger\s+asChild/);
});

test("select uses Base UI native state and composition", () => {
  const selectSource = source("registry/src/components/ui/select.tsx");
  assert.doesNotMatch(
    selectSource,
    /asChild|--radix-select|CustomEvent|forceMount|onCloseAutoFocus|onPointerDownOutside|onEscapeKeyDown|createPortal|data-state=/,
  );
  const chartSource = source("registry/src/components/ui/chart.tsx");
  assert.doesNotMatch(chartSource, /data-\[state=(?:open|checked)\]/);
  assert.match(chartSource, /data-popup-open:/);
  assert.match(chartSource, /data-selected:/);
});

test("dropdown menu uses Base UI native menu state and composition", () => {
  const menuSource = source("registry/src/components/ui/dropdown-menu.tsx");
  assert.doesNotMatch(
    menuSource,
    /asChild|--radix-dropdown-menu|CustomEvent|onOpenAutoFocus|onCloseAutoFocus|onInteractOutside|onPointerDownOutside|onFocusOutside|preventBaseUIHandler|data-state=/,
  );

  for (const relative of [
    "docs/src/examples/ui/dropdown-menu/index.tsx",
    "docs/src/examples/ui/dropdown-menu/radio.tsx",
    "docs/src/examples/ui/dropdown-menu/checkboxes.tsx",
    "docs/src/examples/ui/sidebar/_sidebar.tsx",
    "registry/src/components/ui/data-table.tsx",
  ]) {
    assert.doesNotMatch(source(relative), /<DropdownMenuTrigger\s+asChild/, relative);
  }
});

test("context menu uses Base UI native state and composition", () => {
  const contextMenuSource = source("registry/src/components/ui/context-menu.tsx");
  assert.doesNotMatch(
    contextMenuSource,
    /asChild|--radix-context-menu|CustomEvent|onOpenAutoFocus|onCloseAutoFocus|onInteractOutside|onPointerDownOutside|onFocusOutside|preventBaseUIHandler|data-state=/,
  );
});

test("menubar delegates open state and keyboard navigation to Base UI", () => {
  const menubarSource = source("registry/src/components/ui/menubar.tsx");
  assert.doesNotMatch(
    menubarSource,
    /MenubarValueContext|MenubarMenuContext|--radix-menubar|getAsChildElement|data-value=|defaultValue\?: string|onValueChange\?: \(value: string\)|\basChild\b/,
  );

  const menubarDoc = source("docs/content/docs/menubar.mdx");
  assert.doesNotMatch(
    menubarDoc,
    /Menubar\.value|Menubar\.defaultValue|MenubarMenu\.value|Menubar\.loop\b/,
  );
  assert.match(menubarDoc, /Menubar\.loopFocus/);
});

test("navigation menu delegates state, motion, and popup layout to Base UI", () => {
  const navigationSource = source("registry/src/components/ui/navigation-menu.tsx");
  assert.doesNotMatch(
    navigationSource,
    /NavigationMenuAdapterContext|NavigationMenuIndicator|function NavigationMenuPositioner|--radix-navigation-menu|CustomEvent|MutationObserver|ResizeObserver|skipDelayDuration|delayDuration|forceMount|portalContainer|onInteractOutside|onPointerDownOutside|preventBaseUIHandler|data-state=|\basChild\b/,
  );
  assert.match(navigationSource, /NavigationMenuPrimitive\.Viewport/);
  assert.match(navigationSource, /NavigationMenuPrimitive\.Positioner/);
  assert.match(navigationSource, /NavigationMenuPrimitive\.Popup/);

  assert.doesNotMatch(
    source("docs/src/examples/ui/navigation-menu.tsx"),
    /<NavigationMenuLink\s+asChild/,
  );
  const previewStates = source("docs/tests/preview-states.spec.ts");
  assert.doesNotMatch(previewStates, /navigation-menu-content[^\n]*data-state/);
  assert.match(previewStates, /navigation-menu-content[^\n]*data-open/);
});

test("drawer delegates swipe, snap points, and dismissal to Base UI", () => {
  const drawerSource = source("registry/src/components/ui/drawer.tsx");
  assert.doesNotMatch(
    drawerSource,
    /data-vaul|PointerDragState|CustomEvent|createPointer|preventBaseUIHandler|dragMetricsRef|scheduleRelease|handleOnly|dismissible|shouldScaleBackground|setBackgroundColorOnScale|snapToSequentialPoint\?:|\bdirection\?:|\basChild\b|forceMount|onOpenAutoFocus|onCloseAutoFocus|onInteractOutside|onPointerDownOutside|data-state=/,
  );
  assert.match(drawerSource, /DrawerPrimitive\.Viewport/);
  assert.match(drawerSource, /DrawerPrimitive\.Popup/);
  assert.match(drawerSource, /--drawer-swipe-movement-[xy]/);
  assert.match(drawerSource, /--drawer-snap-point-offset/);

  for (const relative of [
    "docs/src/examples/ui/drawer/index.tsx",
    "docs/src/examples/ui/drawer/scrollable-content.tsx",
    "docs/content/docs/drawer.mdx",
  ]) {
    assert.doesNotMatch(
      source(relative),
      /Drawer(?:Trigger|Close)\s+asChild|<Drawer\s+direction=/,
      relative,
    );
  }
  assert.match(
    source("docs/src/examples/ui/drawer/scrollable-content.tsx"),
    /swipeDirection="right"/,
  );
});

test("accordion and collapsible use Base UI native disclosure state", () => {
  const accordionSource = source("registry/src/components/ui/accordion.tsx");
  assert.doesNotMatch(
    accordionSource,
    /asChild|--radix-accordion|preventBaseUIHandler|mergeProps|type: "single"|type: "multiple"|collapsible\?:|data-state=/,
  );
  assert.match(accordionSource, /AccordionPrimitive\.Root/);
  assert.match(accordionSource, /--accordion-panel-height/);

  const collapsibleSource = source("registry/src/components/ui/collapsible.tsx");
  assert.doesNotMatch(
    collapsibleSource,
    /asChild|--radix-collapsible|preventBaseUIHandler|mergeProps|forceMount|data-state=/,
  );
  assert.match(collapsibleSource, /--collapsible-panel-height/);

  assert.doesNotMatch(
    source("docs/src/examples/ui/accordion.tsx"),
    /<Accordion[^>]+(?:type=|collapsible)/,
  );
  assert.doesNotMatch(
    source("docs/src/examples/ui/collapsible.tsx"),
    /<CollapsibleTrigger\s+asChild/,
  );
  const sidebarExample = source("docs/src/examples/ui/sidebar/_sidebar.tsx");
  assert.doesNotMatch(sidebarExample, /<Collapsible(?:Trigger)?\s+[^>]*asChild/);
  assert.match(sidebarExample, /render={<SidebarMenuItem \/>}/);
});

test("form and status primitives use Base UI native state without Radix adapters", () => {
  const checkboxSource = source("registry/src/components/ui/checkbox.tsx");
  assert.doesNotMatch(
    checkboxSource,
    /asChild|mergeProps|preventBaseUIHandler|forceMount|data-state=|CheckedState|uncontrolledChecked/,
  );
  assert.match(checkboxSource, /data-indeterminate/);
  assert.match(checkboxSource, /nativeButton/);

  const radioSource = source("registry/src/components/ui/radio-group.tsx");
  assert.doesNotMatch(
    radioSource,
    /asChild|mergeProps|preventBaseUIHandler|forceMount|DirectionProvider|orientation|\bloop\b|data-state=/,
  );
  assert.match(radioSource, /RadioGroupPrimitive/);
  assert.match(radioSource, /RadioPrimitive\.Indicator/);

  const progressSource = source("registry/src/components/ui/progress.tsx");
  assert.doesNotMatch(
    progressSource,
    /asChild|mergeProps|preventBaseUIHandler|getValueLabel|data-state=|data-max=|data-value=/,
  );
  assert.match(progressSource, /ProgressPrimitive\.Track/);
  assert.match(progressSource, /ProgressPrimitive\.Indicator/);

  const scrollSource = source("registry/src/components/ui/scroll-area.tsx");
  assert.doesNotMatch(
    scrollSource,
    /asChild|mergeProps|preventBaseUIHandler|--radix-scroll-area|ScrollAreaContractContext|scrollHideDelay|\btype\?:|data-state=/,
  );
  assert.match(scrollSource, /data-hovering:opacity-100/);
  assert.match(scrollSource, /data-scrolling:opacity-100/);

  assert.doesNotMatch(
    source("docs/content/docs/scroll-area.mdx"),
    /ScrollArea\.type|ScrollArea\.scrollHideDelay/,
  );
  assert.doesNotMatch(source("docs/content/docs/radio-group.mdx"), /RadioGroup\.orientation/);
  assert.match(source("docs/content/docs/checkbox.mdx"), /independent of `checked`/);
});

test("error text is a separate theme token included in every palette export", () => {
  for (const color of colors) {
    const vars = createThemeCssVars(color);
    assert.equal(vars.theme["color-error"], "var(--error)");
    assert.notEqual(vars.light.error, vars.light.destructive);
    assert.notEqual(vars.dark.error, vars.dark.destructive);
    assert.notEqual(vars.light.error, vars.dark.error);
    const css = serializeThemeVariables(color);
    assert.ok(css.includes(`--error: ${vars.light.error};`), color.name);
    assert.ok(css.includes(`--error: ${vars.dark.error};`), color.name);
    assert.ok(css.includes("--color-error: var(--error);"), color.name);
  }
});

test("installable templates inherit tokens; gallery presets stay in docs", () => {
  for (const name of ["blog", "blog-post", "portfolio", "cms", "link-hub"]) {
    const original = source(`registry/src/blocks/templates/${name}-template.tsx`);
    const generated = source(`docs/src/components/templates/${name}-template.tsx`);
    assert.equal(generated, original, `${name}: regenerate managed docs copies`);
    assert.doesNotMatch(
      original,
      /TEMPLATE_THEME|\[--(?:background|main|radius|ring|shadow|box-shadow-[xy]):/,
    );
    assert.match(original, /bg-background/);
  }
  assert.match(source("docs/src/site/components/template-preview.tsx"), /data-template-preview/);
});

test("removed decorative collection is absent from sources and built catalogs", () => {
  for (const relative of [
    "registry/src/components/stars",
    "docs/src/components/stars",
    "docs/src/examples/stars",
    "docs/src/data/stars.ts",
    "docs/src/scripts/generate-stars-ts.ts",
    "docs/content/stars.mdx",
    "docs/content/docs/stars.mdx",
    "docs/src/site/components/stars-page.tsx",
  ])
    assert.equal(existsSync(path.join(root, relative)), false, relative);

  for (const relative of [
    "registry/registry.json",
    "registry/public/r/registry.json",
    "docs/public/r/registry.json",
  ]) {
    const registry = JSON.parse(source(relative)) as { items: { name: string }[] };
    assert.ok(registry.items.length > 0, `${relative}: the retained catalog is not empty`);
    assert.ok(!registry.items.some(({ name }) => /^s\d+$/.test(name)), relative);
  }
  for (const relative of ["registry/public/r", "docs/public/r"]) {
    assert.ok(!readdirSync(path.join(root, relative)).some((name) => /^s\d+\.json$/.test(name)));
  }
  for (const relative of [
    "docs/src/site/lib/navigation.ts",
    "docs/src/site/components/sidebar-nav.tsx",
    "docs/src/site/components/search-launcher.tsx",
    "docs/src/site/components/site-layout.tsx",
    "docs/src/site/components/special-page.tsx",
    "docs/src/site/components/component-preview.tsx",
  ])
    assert.doesNotMatch(
      source(relative),
      /(?:\/stars|StarsPage|STARS_EXAMPLES|PreviewType)/,
      relative,
    );
});

test("published examples use fictional sample identities instead of maintainer profiles", () => {
  const examplesRoot = path.join(root, "docs/src/examples/ui");
  const exampleFiles = readdirSync(examplesRoot, { recursive: true }).filter(
    (entry): entry is string => typeof entry === "string" && entry.endsWith(".tsx"),
  );

  for (const relative of exampleFiles) {
    assert.doesNotMatch(
      readFileSync(path.join(examplesRoot, relative), "utf8"),
      /andongmin94|Andong Min|leerob|evilrabbit/,
      relative,
    );
  }
});

test("site header keeps repository stars separate from the removed Stars collection", () => {
  const header = source("docs/src/site/components/site-header.tsx");
  const starsRoute = source("docs/press.config.tsx");
  assert.match(header, /\/api\/github-stars/);
  assert.match(header, /data-github-stars/);
  assert.doesNotMatch(header, /href=["'{]\/stars/);
  assert.match(starsRoute, /api\.github\.com\/repos\/andongmin94\/neobrutal-ui/);
});

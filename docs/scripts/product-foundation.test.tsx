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
  assert.match(source("docs/app/components/template-preview.tsx"), /data-template-preview/);
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
    "docs/app/components/stars-page.tsx",
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
    "docs/app/lib/navigation.ts",
    "docs/app/components/sidebar-nav.tsx",
    "docs/app/components/search-launcher.tsx",
    "docs/app/components/site-layout.tsx",
    "docs/app/components/special-page.tsx",
    "docs/app/components/component-preview.tsx",
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
  const header = source("docs/app/components/site-header.tsx");
  const starsRoute = source("docs/press.config.tsx");
  assert.match(header, /\/api\/github-stars/);
  assert.match(header, /data-github-stars/);
  assert.doesNotMatch(header, /href=["'{]\/stars/);
  assert.match(starsRoute, /api\.github\.com\/repos\/andongmin94\/neobrutal-ui/);
});

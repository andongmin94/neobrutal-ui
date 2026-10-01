import assert from "node:assert/strict";
import { test } from "node:test";

import { readDocsApiInputs, verifyDocsApi, type DocsApiInputs } from "./verify-docs-api";

const inputs = readDocsApiInputs();

function mutate(
  kind: "sources" | "documents",
  key: string,
  before: string,
  after: string,
): DocsApiInputs {
  const original = inputs[kind].get(key);
  assert.ok(original, `Mutation file is missing: ${key}`);
  assert.ok(original.includes(before), `Mutation target is missing: ${key}: ${before}`);
  return { ...inputs, [kind]: new Map(inputs[kind]).set(key, original.replace(before, after)) };
}

test("every component API table checks canonical wrapper defaults and local enum choices", () => {
  const result = verifyDocsApi(inputs);
  assert.equal(result.pages, inputs.directorySlugs.length);
  assert.ok(result.sourceDefaults > 0 && result.enumContracts > 0);
  assert.ok(result.nativeDefaults > 0);
  assert.ok(result.otherApiRows > 0 && result.recipeRows > 0);
});

test("documented inherited literal defaults follow installed native API tags", () => {
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "documents",
          "slider",
          "| `min` / `max` / `step` | Range and step | 0 / 100 / 1 |",
          "| `min` / `max` / `step` | Range and step | 0 / 200 / 1 |",
        ),
      ),
    /Slider\.max.*native @default is 100/,
  );
  assert.throws(
    () =>
      verifyDocsApi(mutate("documents", "select", "Unset / false / false", "Unset / true / false")),
    /Select\.required.*native @default is false/,
  );
  // The wrapper owns these overrides, even though native tags differ.
  assert.doesNotThrow(() => verifyDocsApi(inputs));
});

test("changing a canonical wrapper default requires the API default to change", () => {
  assert.throws(
    () =>
      verifyDocsApi(mutate("sources", "src/components/ui/tooltip.tsx", "delay = 0", "delay = 120")),
    /TooltipProvider\.delay.*canonical source default is 120/,
  );
});

test("wrong and missing documented own defaults fail the contract", () => {
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "documents",
          "calendar",
          "| `showOutsideDays` | Show adjacent-month days | `true` |",
          "| `showOutsideDays` | Show adjacent-month days | `false` |",
        ),
      ),
    /Calendar\.showOutsideDays.*canonical source default is true/,
  );
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "documents",
          "calendar",
          "| `showOutsideDays` | Show adjacent-month days | `true` |",
          "",
        ),
      ),
    /Calendar\.showOutsideDays needs exactly one API row/,
  );
});

test("new source-owned defaults enter the gate without extending an allowlist", () => {
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "sources",
          "src/components/ui/input.tsx",
          "className, type, ...props",
          'className, type = "email", ...props',
        ),
      ),
    /Input\.type.*canonical source default is email/,
  );
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "sources",
          "src/components/ui/textarea.tsx",
          "className, ...props",
          "className, spellCheck = true, ...props",
        ),
      ),
    /Textarea\.spellCheck needs exactly one API row/,
  );
});

test("CVA fallback defaults are checked when the wrapper leaves the prop unset", () => {
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "sources",
          "src/components/ui/badge.tsx",
          'variant: "default",',
          'variant: "neutral",',
        ),
      ),
    /Badge\.variant.*canonical source default is neutral/,
  );
});

test("the explicit wrapper default takes precedence over an unused CVA fallback", () => {
  assert.doesNotThrow(() =>
    verifyDocsApi(
      mutate(
        "sources",
        "src/components/ui/button-variants.ts",
        'variant: "default",',
        'variant: "neutral",',
      ),
    ),
  );
});

test("missing or extra documented enum choices and new canonical choices fail", () => {
  assert.throws(
    () =>
      verifyDocsApi(
        mutate("documents", "button", "`icon-xs`, `icon-sm`, `icon-lg`", "`icon-xs`, `icon-sm`"),
      ),
    /Button\.size API enum values differ/,
  );
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "documents",
          "button",
          "`icon-xs`, `icon-sm`, `icon-lg`",
          "`icon-xs`, `icon-sm`, `icon-lg`, `xxl`",
        ),
      ),
    /Button\.size API enum values differ/,
  );
  assert.throws(
    () =>
      verifyDocsApi(
        mutate("sources", "src/components/ui/button-variants.ts", "reverse:\n", "mirror:\n"),
      ),
    /Button\.variant API enum values differ/,
  );
});

test("literal constant defaults are source-derived and object property order is immaterial", () => {
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "sources",
          "src/components/ui/chart.tsx",
          "{ width: 320, height: 200 } as const",
          "{ width: 480, height: 200 } as const",
        ),
      ),
    /ChartContainer\.initialDimension.*canonical source default is/,
  );
  assert.doesNotThrow(() =>
    verifyDocsApi(
      mutate(
        "documents",
        "chart",
        "`{ width: 320, height: 200 }`",
        "`{ height: 200, width: 320 }`",
      ),
    ),
  );
});

test("unsupported calculated or wrapped defaults fail instead of becoming verified prose", () => {
  assert.throws(
    () =>
      verifyDocsApi(
        mutate("sources", "src/components/ui/tooltip.tsx", "delay = 0", "delay = calculateDelay()"),
      ),
    /Unsupported source-owned API default/,
  );
  assert.throws(
    () =>
      verifyDocsApi(
        mutate(
          "sources",
          "src/components/ui/tooltip.tsx",
          "export { Tooltip,",
          "const FutureTooltip = React.forwardRef(({ delay = 100 }) => null); export { FutureTooltip };\nexport { Tooltip,",
        ),
      ),
    /FutureTooltip has an unsupported wrapped component default/,
  );
});

test("registry and documentation inventory expansion cannot silently escape API review", () => {
  assert.throws(
    () => verifyDocsApi({ ...inputs, directorySlugs: inputs.directorySlugs.slice(1) }),
    /API audit directory and registry inventory differ/,
  );
  const expanded: DocsApiInputs = {
    ...inputs,
    components: [
      ...inputs.components,
      { slug: "audit-probe", files: ["src/components/ui/audit-probe.tsx"] },
    ],
    directorySlugs: [...inputs.directorySlugs, "audit-probe"],
    sources: new Map(inputs.sources).set(
      "src/components/ui/audit-probe.tsx",
      "export function AuditProbe({ delay = 10 }) { return null; }",
    ),
    documents: new Map(inputs.documents).set("audit-probe", "# Audit Probe"),
  };
  assert.throws(() => verifyDocsApi(expanded), /audit-probe: missing API reference section/);
});

test("the OTP separator default follows its canonical static icon rather than a copied constant", () => {
  const changed = mutate("sources", "src/components/ui/input-otp.tsx", "DotIcon", "MinusIcon");
  changed.sources.set(
    "src/components/ui/input-otp.tsx",
    changed.sources.get("src/components/ui/input-otp.tsx")!.replace("<DotIcon />", "<MinusIcon />"),
  );
  assert.throws(
    () => verifyDocsApi(changed),
    /InputOTPSeparator API must document its canonical Minus icon/,
  );
  changed.documents = new Map(inputs.documents).set(
    "input-otp",
    inputs.documents.get("input-otp")!.replace("| Dot |", "| Minus |"),
  );
  assert.doesNotThrow(() => verifyDocsApi(changed));
  assert.throws(
    () => verifyDocsApi(mutate("documents", "input-otp", "| Dot |", "| Dash |")),
    /InputOTPSeparator API must document its canonical Dot icon/,
  );
});

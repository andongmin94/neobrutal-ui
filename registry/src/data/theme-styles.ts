import { createThemeCssVars, defaultColor, type ColorPalette } from "./theme";

export const defaultThemeSettings = {
  radius: 5,
  shadowX: 4,
  shadowY: 4,
  baseWeight: 500,
  headingWeight: 700,
};
export type ThemeSettings = typeof defaultThemeSettings;

export const themeCss = {
  '@import "tw-animate-css"': {},
  '@import "shadcn/tailwind.css"': {},
  "@layer base": {
    "*": { "@apply border-border outline-ring/50": {} },
    ":root": { "color-scheme": "light" },
    ".dark": { "color-scheme": "dark" },
    body: { "@apply bg-background text-foreground": {} },
  },
};

export function createCustomizedTheme(
  color: ColorPalette = defaultColor,
  settings: ThemeSettings = defaultThemeSettings,
) {
  const vars = createThemeCssVars(color);
  const shared = {
    radius: `${settings.radius}px`,
    "box-shadow-x": `${settings.shadowX}px`,
    "box-shadow-y": `${settings.shadowY}px`,
  };
  return {
    ...vars,
    light: {
      ...vars.light,
      ...shared,
      "base-font-weight": String(settings.baseWeight),
      "heading-font-weight": String(settings.headingWeight),
    },
    dark: { ...vars.dark, ...shared },
  };
}

function cssRules(rules: Record<string, unknown>, indent = ""): string {
  return Object.entries(rules)
    .map(([selector, value]) => {
      if (typeof value === "string") return `${indent}${selector}: ${value};`;
      const declarations = value as Record<string, unknown>;
      return Object.keys(declarations).length === 0
        ? `${indent}${selector};`
        : `${indent}${selector} {\n${cssRules(declarations, `${indent}  `)}\n${indent}}`;
    })
    .join("\n");
}

export function serializeThemeVariables(
  color: ColorPalette = defaultColor,
  settings: ThemeSettings = defaultThemeSettings,
) {
  const vars = createCustomizedTheme(color, settings);
  const block = (selector: string, values: Record<string, string>) =>
    `${selector} {\n${Object.entries(values)
      .map(([name, value]) => `  --${name}: ${value};`)
      .join("\n")}\n}`;
  return (
    [
      block(":root", vars.light),
      block(".dark", vars.dark),
      block("@theme inline", vars.theme),
    ].join("\n\n") + "\n"
  );
}

export function serializeThemeCss(
  color: ColorPalette = defaultColor,
  settings: ThemeSettings = defaultThemeSettings,
) {
  const imports = Object.fromEntries(
    Object.entries(themeCss).filter(([key]) => key.startsWith("@import")),
  );
  return (
    [
      '@import "tailwindcss";',
      cssRules(imports),
      "@custom-variant dark (&:is(.dark *));",
      serializeThemeVariables(color, settings).trimEnd(),
      cssRules({ "@layer base": themeCss["@layer base"] }),
    ].join("\n\n") + "\n"
  );
}

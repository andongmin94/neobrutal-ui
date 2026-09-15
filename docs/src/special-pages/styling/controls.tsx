"use client";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import colors from "@/data/colors";
import { defaultColor } from "@/data/theme";
import {
  createCustomizedTheme,
  defaultThemeSettings,
  serializeThemeCss,
  type ThemeSettings,
} from "@/data/theme-styles";
import { Pre } from "@/components/docs/pre";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const settingFields: {
  key: keyof ThemeSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}[] = [
  { key: "radius", label: "Corner radius", min: 0, max: 16, step: 1, unit: "px" },
  { key: "shadowX", label: "Horizontal shadow", min: -8, max: 8, step: 1, unit: "px" },
  { key: "shadowY", label: "Vertical shadow", min: -8, max: 8, step: 1, unit: "px" },
  { key: "baseWeight", label: "Body weight", min: 400, max: 700, step: 100, unit: "" },
  { key: "headingWeight", label: "Heading weight", min: 500, max: 900, step: 100, unit: "" },
];

export default function Styling() {
  const [palette, setPalette] = useState(defaultColor);
  const [settings, setSettings] = useState(defaultThemeSettings);
  const [saved, setSaved] = useState(false);
  const dark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
  const vars = createCustomizedTheme(palette, settings);
  const style = Object.fromEntries(
    Object.entries({ ...vars.light, ...(dark ? vars.dark : {}) }).map(([key, value]) => [
      `--${key}`,
      value,
    ]),
  ) as CSSProperties;
  const css = serializeThemeCss(palette, settings);

  return (
    <section className="theme-workbench" aria-label="Theme workbench">
      <aside className="theme-workbench__controls">
        <h2>Make it yours</h2>
        <p>
          Adjust the real design tokens. Changes stay in the preview, not the documentation shell.
        </p>
        <label htmlFor="theme-palette">Palette</label>
        <select
          id="theme-palette"
          value={palette.name}
          onChange={(event) => {
            const next = colors.find((color) => color.name === event.target.value);
            if (next) setPalette(next);
          }}
        >
          {colors.map((color) => (
            <option key={color.name} value={color.name}>
              {color.name}
            </option>
          ))}
        </select>
        {settingFields.map(({ key, label, min, max, step, unit }) => (
          <div className="theme-workbench__setting" key={key}>
            <label htmlFor={`theme-${key}`}>
              {label}
              <output>
                {settings[key]}
                {unit}
              </output>
            </label>
            <input
              id={`theme-${key}`}
              type="range"
              min={min}
              max={max}
              step={step}
              value={settings[key]}
              onChange={(event) => setSettings({ ...settings, [key]: Number(event.target.value) })}
            />
          </div>
        ))}
        <button
          className="theme-reset"
          type="button"
          onClick={() => {
            setPalette(defaultColor);
            setSettings(defaultThemeSettings);
            setSaved(false);
          }}
        >
          Reset defaults
        </button>
      </aside>
      <div className="theme-workbench__stage" data-theme-preview style={style}>
        <div className="theme-workbench__stage-label">
          <span>Live preview</span>
          <span>
            {palette.name} / {dark ? "dark" : "light"}
          </span>
        </div>
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader>
              <Badge className="w-fit">Your workspace</Badge>
              <CardTitle>Small details. Big character.</CardTitle>
              <CardDescription>The same components and tokens you install.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSaved(true);
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="theme-project">Project name</Label>
                  <Input id="theme-project" defaultValue="My next idea" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="theme-updates">Email updates</Label>
                  <Switch id="theme-updates" defaultChecked />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Save project</Button>
                  <Button type="button" variant="neutral" disabled>
                    Disabled
                  </Button>
                </div>
                <output className="min-h-5 text-sm">
                  {saved
                    ? "Saved in this preview only."
                    : "Try the controls, then export your theme."}
                </output>
              </form>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">Outline</Button>
            <Button variant="reverse">Reverse</Button>
            <Button variant="noShadow">Flat</Button>
          </div>
        </div>
        <p className="theme-workbench__hint">
          Use the site theme toggle to compare light and dark surfaces.
        </p>
      </div>
      <section className="theme-workbench__export" aria-labelledby="theme-export-heading">
        <h2 id="theme-export-heading">Use this theme</h2>
        <p>
          The preset command installs the palette with its default radius, shadows, and weights. To
          keep your adjustments, copy the complete CSS below.
        </p>
        <Pre __rawstring__={`npx shadcn@latest add @neobrutal-ui/theme-${palette.name}`}>
          <code>{`npx shadcn@latest add @neobrutal-ui/theme-${palette.name}`}</code>
        </Pre>
        <p>
          Install the design-system base first. This stylesheet includes global tokens and base
          rules: review it before replacing existing CSS. Keep unrelated application styles.
        </p>
        <details>
          <summary>Customized CSS — light and dark included</summary>
          <Pre __rawstring__={css}>
            <code data-theme-css>{css}</code>
          </Pre>
        </details>
      </section>
    </section>
  );
}

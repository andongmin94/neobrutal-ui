"use client";

import { XIcon } from "lucide-react";
import { useLayoutEffect, useState } from "react";

import colors from "@/data/colors";

import { Pre } from "@/components/docs/pre";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

type ColorPalette = (typeof colors)[number];

function applyColorPalette(color: ColorPalette) {
  const root = document.documentElement;
  const isDarkMode = root.classList.contains("dark");

  root.style.setProperty("--background", isDarkMode ? color.darkBg : color.bg);
  root.style.setProperty("--main", isDarkMode ? color.darkMain : color.main);
  root.style.setProperty("--chart-1", isDarkMode ? color.darkChart1 : color.chart1);
  root.style.setProperty("--chart-2", isDarkMode ? color.darkChart2 : color.chart2);
  root.style.setProperty("--chart-3", isDarkMode ? color.darkChart3 : color.chart3);
  root.style.setProperty("--chart-4", isDarkMode ? color.darkChart4 : color.chart4);
  root.style.setProperty("--chart-5", isDarkMode ? color.darkChart5 : color.chart5);
}

export default function Styling() {
  const defaultColorPalette = colors[10];
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const [
    {
      bg,
      darkBg,
      darkMain,
      main,
      name,
      chart1,
      chart2,
      chart3,
      chart4,
      chart5,
      darkChart1,
      darkChart2,
      darkChart3,
      darkChart4,
      darkChart5,
    },
    setColor,
  ] = useState(defaultColorPalette);
  const [borderRadius, setBorderRadius] = useState(5);
  const [boxShadowLength, setBoxShadowLength] = useState([4, 4]);
  const [fontWeight, setFontWeight] = useState([700, 500]);

  useLayoutEffect(() => {
    const colorObj = JSON.parse(localStorage.getItem("color") as string);
    const borderRadius = Number(localStorage.getItem("borderRadius"));
    const boxShadow = localStorage.getItem("boxShadow")?.split(",");
    const fontWeight = localStorage.getItem("fontWeight")?.split(",");

    if (colorObj) {
      setColor(colorObj);
    }

    if (borderRadius) {
      setBorderRadius(borderRadius);
    }

    if (boxShadow) {
      setBoxShadowLength([+boxShadow[0], +boxShadow[1]]);
    }

    if (fontWeight) {
      setFontWeight([+fontWeight[0], +fontWeight[1]]);
    }
  }, []);

  useLayoutEffect(() => {
    const applyCurrentPalette = () =>
      applyColorPalette({
        bg,
        darkBg,
        darkMain,
        main,
        name,
        chart1,
        chart2,
        chart3,
        chart4,
        chart5,
        darkChart1,
        darkChart2,
        darkChart3,
        darkChart4,
        darkChart5,
      });

    applyCurrentPalette();
    window.addEventListener("neobrutal-ui:theme", applyCurrentPalette);

    return () => window.removeEventListener("neobrutal-ui:theme", applyCurrentPalette);
  }, [
    bg,
    darkBg,
    darkMain,
    main,
    name,
    chart1,
    chart2,
    chart3,
    chart4,
    chart5,
    darkChart1,
    darkChart2,
    darkChart3,
    darkChart4,
    darkChart5,
  ]);

  const updateColor = (value: string) => {
    const r = window.document.querySelector(":root") as HTMLElement;
    const color = colors.find((color) => color.name === value)!;

    setColor(color);

    localStorage.setItem("color", JSON.stringify(color));
    applyColorPalette(color);

    r.style.setProperty("--dark-background", color.darkBg);
    r.style.setProperty("--dark-main", color.darkMain);
    r.style.setProperty("--light-background", color.bg);
    r.style.setProperty("--light-main", color.main);
  };

  const updateBorderRadius = (value: number) => {
    const r = window.document.querySelector(":root") as HTMLElement;
    r.style.setProperty("--border-radius", `${value}px`);

    localStorage.setItem("borderRadius", value.toString());

    setBorderRadius(value);
  };

  const updateHorizontalBoxShadow = (value: number) => {
    const r = window.document.querySelector(":root") as HTMLElement;
    r.style.setProperty("--box-shadow-x", value + "px");

    setBoxShadowLength([value, boxShadowLength[1]]);

    localStorage.setItem("boxShadow", `${value},${boxShadowLength[1]}`);
  };

  const updateVerticalBoxShadow = (value: number) => {
    const r = window.document.querySelector(":root") as HTMLElement;
    r.style.setProperty("--box-shadow-y", value + "px");

    setBoxShadowLength([boxShadowLength[0], value]);

    localStorage.setItem("boxShadow", `${boxShadowLength[0]},${value}`);
  };

  const updateHeadingFontWeight = (value: number) => {
    const r = window.document.querySelector(":root") as HTMLElement;
    r.style.setProperty("--heading-font-weight", `${value}`);

    setFontWeight([value, fontWeight[1]]);

    localStorage.setItem("fontWeight", `${value},${fontWeight[1]}`);
  };

  const updateBaseFontWeight = (value: number) => {
    const r = window.document.querySelector(":root") as HTMLElement;
    r.style.setProperty("--base-font-weight", `${value}`);

    setFontWeight([fontWeight[0], value]);

    localStorage.setItem("fontWeight", `${fontWeight[0]},${value}`);
  };

  const resetStyling = () => {
    const r = window.document.querySelector(":root") as HTMLElement;

    updateColor(defaultColorPalette.name);

    r.style.setProperty("--border-radius", "5px");
    r.style.setProperty("--box-shadow-x", "4px");
    r.style.setProperty("--box-shadow-y", "4px");
    r.style.setProperty("--heading-font-weight", "700");
    r.style.setProperty("--base-font-weight", "500");

    setColor(defaultColorPalette);
    setBorderRadius(5);
    setBoxShadowLength([4, 4]);
    setFontWeight([700, 500]);

    localStorage.removeItem("color");
    localStorage.removeItem("borderRadius");
    localStorage.removeItem("boxShadow");
    localStorage.removeItem("fontWeight");
  };

  const styling = `@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: ${bg};
  --secondary-background: oklch(100% 0 0);
  --foreground: oklch(0% 0 0);
  --main-foreground: oklch(0% 0 0);
  --main: ${main};
  --border: oklch(0% 0 0);
  --ring: oklch(0% 0 0);
  --overlay: oklch(0% 0 0 / 0.8);
  --box-shadow-x: ${boxShadowLength[0]}px;
  --box-shadow-y: ${boxShadowLength[1]}px;
  --reverse-box-shadow-x: calc(0px - var(--box-shadow-x));
  --reverse-box-shadow-y: calc(0px - var(--box-shadow-y));
  --shadow: var(--box-shadow-x) var(--box-shadow-y) 0px 0px var(--border);
  --chart-1: ${chart1};
  --chart-2: ${chart2};
  --chart-3: ${chart3};
  --chart-4: ${chart4};
  --chart-5: ${chart5};
  --chart-active-dot: #000;
}

.dark {
  --background: ${darkBg};
  --secondary-background: oklch(23.93% 0 0);
  --foreground: oklch(92.49% 0 0);
  --main-foreground: oklch(0% 0 0);
  --main: ${darkMain};
  --border: oklch(0% 0 0);
  --ring: oklch(100% 0 0);
  --shadow: var(--box-shadow-x) var(--box-shadow-y) 0px 0px var(--border);
  --chart-1: ${darkChart1};
  --chart-2: ${darkChart2};
  --chart-3: ${darkChart3};
  --chart-4: ${darkChart4};
  --chart-5: ${darkChart5};
  --chart-active-dot: #fff;
}

@theme inline {
  --color-main: var(--main);
  --color-background: var(--background);
  --color-secondary-background: var(--secondary-background);
  --color-foreground: var(--foreground);
  --color-main-foreground: var(--main-foreground);
  --color-border: var(--border);
  --color-overlay: var(--overlay);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --spacing-boxShadowX: var(--box-shadow-x);
  --spacing-boxShadowY: var(--box-shadow-y);
  --spacing-reverseBoxShadowX: var(--reverse-box-shadow-x);
  --spacing-reverseBoxShadowY: var(--reverse-box-shadow-y);
  --spacing-pressX: calc(
    var(--box-shadow-x) - clamp(-1px, var(--box-shadow-x), 1px)
  );
  --spacing-pressY: calc(
    var(--box-shadow-y) - clamp(-1px, var(--box-shadow-y), 1px)
  );
  --radius-base: ${borderRadius}px;
  --shadow-shadow: var(--shadow);
  --shadow-press: clamp(-1px, var(--box-shadow-x), 1px)
    clamp(-1px, var(--box-shadow-y), 1px) 0px 0px var(--border);
  --font-weight-base: ${fontWeight[1]};
  --font-weight-heading: ${fontWeight[0]};
}
  
@layer base {
  body {
    @apply text-foreground font-base bg-background;
  }

  h1, h2, h3, h4, h5, h6{
    @apply font-heading;
  }
}`;

  return (
    <div className="flex items-center justify-center gap-4">
      <Sheet open={customizerOpen} onOpenChange={setCustomizerOpen}>
        <SheetTrigger asChild>
          <Button>Customize</Button>
        </SheetTrigger>
        <SheetContent showCloseButton={false}>
          <Button
            aria-label="Close customizer"
            className="absolute top-3 right-3"
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={() => setCustomizerOpen(false)}
          >
            <XIcon />
          </Button>
          <SheetHeader>
            <SheetTitle>Customize styling</SheetTitle>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min overflow-y-auto gap-4 px-4">
            <div className="grid gap-3">
              <Label htmlFor="color">Color</Label>
              <Select value={name} onValueChange={updateColor}>
                <SelectTrigger id="color" className="bg-secondary-background text-foreground">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent className="bg-secondary-background text-foreground">
                  {colors.map(({ name, main }) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-4 rounded-full border-2 border-border"
                          style={{ backgroundColor: main }}
                        />
                        {name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="border-radius">Border Radius</Label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 5, 10, 15].map((btn) => (
                  <Button
                    onClick={() => updateBorderRadius(btn)}
                    className={cn(
                      "h-8",
                      borderRadius === btn
                        ? "bg-main text-main-foreground"
                        : "bg-secondary-background text-foreground",
                    )}
                    key={btn}
                    variant="noShadow"
                  >
                    {`${btn} px`}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="border-radius">Horizontal Box Shadow</Label>
              <div className="grid grid-cols-5 gap-2">
                {[-4, -2, 0, 2, 4].map((btn) => (
                  <Button
                    onClick={() => updateHorizontalBoxShadow(btn)}
                    className={cn(
                      "h-8",
                      boxShadowLength[0] === btn
                        ? "bg-main text-main-foreground"
                        : "bg-secondary-background text-foreground",
                    )}
                    key={btn}
                    variant="noShadow"
                  >
                    {`${btn} px`}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="border-radius">Vertical Box Shadow</Label>
              <div className="grid grid-cols-5 gap-2">
                {[-4, -2, 0, 2, 4].map((btn) => (
                  <Button
                    onClick={() => updateVerticalBoxShadow(btn)}
                    className={cn(
                      "h-8",
                      boxShadowLength[1] === btn
                        ? "bg-main text-main-foreground"
                        : "bg-secondary-background text-foreground",
                    )}
                    key={btn}
                    variant="noShadow"
                  >
                    {`${btn} px`}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="border-radius">Heading Font Weight</Label>
              <div className="grid grid-cols-3 gap-2">
                {[700, 800, 900].map((btn) => (
                  <Button
                    onClick={() => updateHeadingFontWeight(btn)}
                    className={cn(
                      "h-8",
                      fontWeight[0] === btn
                        ? "bg-main text-main-foreground"
                        : "bg-secondary-background text-foreground",
                    )}
                    key={btn}
                    variant="noShadow"
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="border-radius">Base Font Weight</Label>
              <div className="grid grid-cols-3 gap-2">
                {[500, 600, 700].map((btn) => (
                  <Button
                    onClick={() => updateBaseFontWeight(btn)}
                    className={cn(
                      "h-8",
                      fontWeight[1] === btn
                        ? "bg-main text-main-foreground"
                        : "bg-secondary-background text-foreground",
                    )}
                    key={btn}
                    variant="noShadow"
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={() => setCustomizerOpen(false)}>Save changes</Button>
            <Button variant="neutral" onClick={resetStyling}>
              Reset
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="neutral">Copy</Button>
        </DialogTrigger>
        <DialogContent className="max-w-full">
          <DialogHeader>
            <DialogTitle>Theming</DialogTitle>
            <DialogDescription>Copy the styling to your globals.css file.</DialogDescription>
          </DialogHeader>
          <Pre
            wrapperClassName="w-full max-w-full text-white overflow-x-auto"
            __rawstring__={styling}
          >
            {styling}
          </Pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}

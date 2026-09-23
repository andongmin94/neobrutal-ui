"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { TooltipValueType } from "recharts";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;
const CHART_KEY_PATTERN = /^[a-zA-Z0-9_-]+$/;
const CHART_COLOR_PATTERN = /^[\w\s#(),.%+\-/]+$/;
const SAFE_COLOR_FUNCTIONS = new Set([
  "calc",
  "clamp",
  "color",
  "color-mix",
  "contrast-color",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "light-dark",
  "max",
  "min",
  "oklab",
  "oklch",
  "rgb",
  "rgba",
  "var",
]);

const INITIAL_DIMENSION = { width: 320, height: 200 } as const;
type TooltipNameType = number | string;

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  initialDimension?: {
    width: number;
    height: number;
  };
}) {
  const uniqueId = React.useId();
  const chartId = normalizeChartId(`chart-${id ?? uniqueId}`);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex min-w-[232px] aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick-value]:fill-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-[#80808080] [&_.recharts-curve.recharts-tooltip-cursor]:stroke-[#80808080] [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-bar-rectangle]:stroke-border [&_.recharts-bar-rectangle]:stroke-2 [&_.recharts-sector]:stroke-border [&_.recharts-sector]:stroke-2 [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-black [&_.recharts-polar-grid_[stroke='#ccc']]:dark:stroke-white [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-foreground/10 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-black [&_.recharts-reference-line_[stroke='#ccc']]:dark:stroke-white [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-border [&_.recharts-surface]:outline-hidden [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-ring",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer initialDimension={initialDimension}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const css = Object.entries(THEMES)
    .flatMap(([theme, prefix]) => {
      const variables = Object.entries(config).flatMap(([key, itemConfig]) => {
        if (!CHART_KEY_PATTERN.test(key)) {
          return [];
        }

        const color = itemConfig.theme?.[theme as keyof typeof THEMES] ?? itemConfig.color;

        if (!isSafeChartColor(color)) {
          return [];
        }

        return [`  --color-${key}: ${color.trim()};`];
      });

      if (!variables.length) {
        return [];
      }

      return [`${prefix} [data-chart="${normalizeChartId(id)}"] {\n${variables.join("\n")}\n}`];
    })
    .join("\n");

  if (!css) {
    return null;
  }

  return <style>{css}</style>;
};

function normalizeChartId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function isSafeChartColor(color: string | undefined): color is string {
  if (!color || color.length > 256 || !CHART_COLOR_PATTERN.test(color)) {
    return false;
  }

  for (const [, name] of color.matchAll(/([a-zA-Z-]+)\s*\(/g)) {
    if (!SAFE_COLOR_FUNCTIONS.has(name.toLowerCase())) {
      return false;
    }
  }

  return true;
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  Partial<RechartsPrimitive.TooltipContentProps<TooltipValueType, TooltipNameType>> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    viewBox?: { x?: number; y?: number; width?: number; height?: number };
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-base border-2 border-border bg-background px-2.5 py-1.5 text-xs font-base shadow-shadow",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color ?? item.payload?.fill ?? item.color;

            return (
              <div
                key={index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            },
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-foreground">{itemConfig?.label ?? item.name}</span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean;
  nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-foreground",
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
  ChartSelect,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

function ChartSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = React.useId();

  return (
    <div className="grid w-full min-w-0 gap-2 sm:w-auto sm:min-w-44 sm:max-w-72">
      <label htmlFor={id} className="text-xs font-heading">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} items={options}>
        <SelectTrigger
          id={id}
          className="h-11 min-w-0 bg-secondary-background font-heading text-foreground shadow-shadow data-popup-open:translate-x-0.5 data-popup-open:translate-y-0.5 data-popup-open:shadow-none [&>svg]:box-content [&>svg]:border-l-2 [&>svg]:border-border [&>svg]:py-1 [&>svg]:pl-3 [&>svg]:opacity-100"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="max-h-[min(20rem,var(--available-height))] w-(--anchor-width) max-w-(--available-width) bg-secondary-background p-1 text-foreground shadow-shadow [&_[data-slot=select-scroll-up-button]]:bg-secondary-background [&_[data-slot=select-scroll-down-button]]:bg-secondary-background"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-10 cursor-pointer py-2 data-highlighted:border-transparent data-highlighted:outline-2 data-highlighted:outline-solid data-highlighted:-outline-offset-4 data-highlighted:outline-foreground data-selected:data-highlighted:outline-main-foreground data-selected:bg-main data-selected:font-heading data-selected:text-main-foreground [&>span:first-child]:min-w-0 [&>span:first-child]:shrink [&>span:first-child]:whitespace-normal"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

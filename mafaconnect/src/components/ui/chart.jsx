import React, { useContext, useId, forwardRef } from "react";
import * as Recharts from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" };

const ChartContext = React.createContext(null);

export function useChart() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/*                            Chart Container Wrapper                         */
/* -------------------------------------------------------------------------- */
export const ChartContainer = forwardRef(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex aspect-video justify-center text-xs",
            "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
            "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
            "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
            "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
            "[&_.recharts-layer]:outline-none",
            "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
            "[&_.recharts-radial-bar-background-sector]:fill-muted",
            "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
            "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
            "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
            "[&_.recharts-sector]:outline-none",
            "[&_.recharts-surface]:outline-none",
            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <Recharts.ResponsiveContainer>{children}</Recharts.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

/* -------------------------------------------------------------------------- */
/*                               Chart Style Helper                           */
/* -------------------------------------------------------------------------- */
export function ChartStyle({ id, config }) {
  const colorConfig = Object.entries(config || {}).filter(
    ([, c]) => c?.theme || c?.color
  );

  if (!colorConfig.length) return null;

  const styles = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const colors = colorConfig
        .map(([key, item]) => {
          const color = item.theme?.[theme] || item.color;
          return color ? `  --color-${key}: ${color};` : "";
        })
        .join("\n");

      return `${prefix} [data-chart=${id}] {\n${colors}\n}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

/* -------------------------------------------------------------------------- */
/*                             Chart Tooltip Wrapper                          */
/* -------------------------------------------------------------------------- */
export const ChartTooltip = Recharts.Tooltip;

export const ChartTooltipContent = forwardRef(
  (
    {
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
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) return null;

    const tooltipLabel = (() => {
      if (hideLabel) return null;
      const [item] = payload;
      const key = labelKey || item.dataKey || item.name || "value";
      const itemConfig = getPayloadConfig(config, item, key);
      const value = itemConfig?.label || label;
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter ? labelFormatter(value, payload) : value}
        </div>
      );
    })();

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {tooltipLabel}
        <div className="grid gap-1.5">
          {payload.map((item, i) => {
            const key = nameKey || item.name || item.dataKey || "value";
            const itemConfig = getPayloadConfig(config, item, key);
            const indicatorColor = color || item.color || "#8884d8";

            return (
              <div
                key={item.dataKey || i}
                className="flex justify-between items-center"
              >
                {!hideIndicator && (
                  <span
                    className={cn(
                      "inline-block h-2.5 w-2.5 rounded-sm",
                      indicator === "line" && "h-[2px] w-3"
                    )}
                    style={{ backgroundColor: indicatorColor }}
                  />
                )}
                <span className="text-muted-foreground">
                  {itemConfig?.label || item.name}
                </span>
                <span className="font-mono font-medium text-foreground">
                  {item.value?.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

/* -------------------------------------------------------------------------- */
/*                              Chart Legend Wrapper                          */
/* -------------------------------------------------------------------------- */
export const ChartLegend = Recharts.Legend;

export const ChartLegendContent = forwardRef(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom" }, ref) => {
    const { config } = useChart();
    if (!payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item, i) => {
          const key = item.dataKey || "value";
          const itemConfig = getPayloadConfig(config, item, key);

          return (
            <div key={i} className="flex items-center gap-1.5">
              {!hideIcon && (
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: item.color || "#8884d8" }}
                />
              )}
              <span className="text-sm">
                {itemConfig?.label || item.value || key}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

/* -------------------------------------------------------------------------- */
/*                         Payload Config Helper Function                     */
/* -------------------------------------------------------------------------- */
function getPayloadConfig(config, payload, key) {
  if (!payload || typeof payload !== "object") return undefined;
  if (config && key in config) return config[key];
  return undefined;
}

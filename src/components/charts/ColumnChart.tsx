"use client";

import { useState } from "react";
import type { ChartPoint } from "@/src/types/management";
import { chartFrame, niceMax } from "@/src/utils/chartScale";
import { type AxisScale, formatAxis } from "@/src/utils/formatAxis";
import { ChartHotspots } from "./ChartHotspots";

export function ColumnChart({
  label,
  points,
  scale,
}: {
  label: string;
  points: ChartPoint[];
  scale: AxisScale;
}) {
  const [active, setActive] = useState<string | null>(null);
  const { width, height, left, top, plotWidth, plotHeight } = chartFrame;
  const max = niceMax(Math.max(...points.map((point) => point.value), 0));
  const step = plotWidth / Math.max(points.length, 1);
  const bar = Math.min(step * 0.6, 28);
  const focused = points.find((point) => point.key === active);
  return (
    <figure className="relative">
      <svg
        aria-label={label}
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line
              className="stroke-line"
              strokeWidth={1}
              x1={left}
              x2={width}
              y1={top + plotHeight * (1 - fraction)}
              y2={top + plotHeight * (1 - fraction)}
            />
            <text
              className="fill-muted text-[12px]"
              textAnchor="end"
              x={left - 6}
              y={top + plotHeight * (1 - fraction) + 3}
            >
              {formatAxis(scale, max * fraction)}
            </text>
          </g>
        ))}
        {points.map((point, index) => {
          const barHeight = max ? (point.value / max) * plotHeight : 0;
          const x = left + step * index + (step - bar) / 2;
          return (
            <g key={point.key}>
              <path
                className={
                  active === point.key ? "fill-brand-hover" : "fill-brand"
                }
                d={`M${x},${top + plotHeight} v${-Math.max(barHeight - 4, 0)} q0,-4 4,-4 h${bar - 8} q4,0 4,4 v${Math.max(barHeight - 4, 0)} z`}
              />
              <text
                className="fill-muted text-[12px]"
                textAnchor="middle"
                x={x + bar / 2}
                y={height - 6}
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartHotspots onActive={setActive} points={points} />
      {focused && (
        <figcaption className="border-line bg-surface pointer-events-none absolute top-0 right-0 rounded-lg border px-3 py-2 text-sm shadow-sm">
          <span className="text-muted block">{focused.label}</span>
          <span className="font-semibold tabular-nums">{focused.display}</span>
        </figcaption>
      )}
    </figure>
  );
}

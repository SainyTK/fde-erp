"use client";

import { useState } from "react";
import type { ChartPoint } from "@/src/types/management";
import { chartFrame } from "@/src/utils/chartScale";
import { type AxisScale, formatAxis } from "@/src/utils/formatAxis";
import { ChartHotspots } from "./ChartHotspots";

export function LineChart({
  label,
  points,
  min,
  max,
  scale,
}: {
  label: string;
  points: ChartPoint[];
  min: number;
  max: number;
  scale: AxisScale;
}) {
  const [active, setActive] = useState<string | null>(null);
  const { width, height, left, top, plotWidth, plotHeight } = chartFrame;
  const step = plotWidth / Math.max(points.length, 1);
  const x = (index: number) => left + step * index + step / 2;
  const y = (value: number) =>
    top + plotHeight * (1 - (value - min) / (max - min));
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
              {formatAxis(scale, min + (max - min) * fraction)}
            </text>
          </g>
        ))}
        <polyline
          className="stroke-brand"
          fill="none"
          points={points
            .map((point, index) => `${x(index)},${y(point.value)}`)
            .join(" ")}
          strokeLinejoin="round"
          strokeWidth={2}
        />
        {focused && (
          <line
            className="stroke-control"
            strokeDasharray="3 3"
            x1={x(points.indexOf(focused))}
            x2={x(points.indexOf(focused))}
            y1={top}
            y2={top + plotHeight}
          />
        )}
        {points.map((point, index) => (
          <g key={point.key}>
            <circle
              className="fill-brand stroke-surface"
              cx={x(index)}
              cy={y(point.value)}
              r={active === point.key ? 5 : 4}
              strokeWidth={2}
            />
            <text
              className="fill-muted text-[12px]"
              textAnchor="middle"
              x={x(index)}
              y={height - 6}
            >
              {point.label}
            </text>
          </g>
        ))}
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

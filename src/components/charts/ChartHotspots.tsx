import type { ChartPoint } from "@/src/types/management";
import { chartFrame } from "@/src/utils/chartScale";

export function ChartHotspots({
  points,
  onActive,
}: {
  points: ChartPoint[];
  onActive: (key: string | null) => void;
}) {
  const { width, height, left, top, plotWidth, plotHeight } = chartFrame;
  const step = plotWidth / Math.max(points.length, 1);
  return (
    <>
      {points.map((point, index) => (
        <button
          aria-label={`${point.label}: ${point.display}`}
          className="focus-visible:outline-brand absolute rounded-sm bg-transparent"
          key={point.key}
          onBlur={() => onActive(null)}
          onFocus={() => onActive(point.key)}
          onMouseEnter={() => onActive(point.key)}
          onMouseLeave={() => onActive(null)}
          style={{
            left: `${((left + step * index) / width) * 100}%`,
            top: `${(top / height) * 100}%`,
            width: `${(step / width) * 100}%`,
            height: `${(plotHeight / height) * 100}%`,
          }}
          type="button"
        />
      ))}
    </>
  );
}

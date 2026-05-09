import React, { useMemo } from "react";

export default function Sparkline({
  data = [],
  width = 88,
  height = 28,
  up = true,
  strokeWidth = 1.6,
}) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return [x, y];
    });
    const d = points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(" ");
    const fillD = `${d} L${width.toFixed(2)},${height} L0,${height} Z`;
    return { d, fillD };
  }, [data, width, height]);

  if (!path) return <div className="spark spark-empty" style={{ width, height }} />;

  const stroke = up ? "var(--up)" : "var(--down)";
  const fill = up
    ? "color-mix(in oklab, var(--up) 22%, transparent)"
    : "color-mix(in oklab, var(--down) 22%, transparent)";

  return (
    <svg
      className="spark"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="7d trend"
    >
      <path d={path.fillD} fill={fill} />
      <path
        d={path.d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

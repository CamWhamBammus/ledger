"use client";

import { useState } from "react";
import type { MonthlyStat } from "@/lib/api-client";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 12;
const PAD_RIGHT = 60;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Hand-rolled inline SVG — no charting dependency, consistent with the rest
 * of this project. Colors are moss (income) / amber (expense) rather than
 * this app's usual moss/clay pair — clay reads as visually indistinguishable
 * from moss to colorblind viewers when the two sit adjacent in a legend
 * (checked with the dataviz skill's validator), which only matters here,
 * not anywhere else amount colors are used one at a time.
 */
export function SpendingTrendChart({ data }: { data: MonthlyStat[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));

  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;
  const x = (i: number) => PAD_LEFT + stepX * i;
  const y = (v: number) => PAD_TOP + innerHeight - (v / maxValue) * innerHeight;

  const linePath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");

  const last = data[data.length - 1];
  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hoveredX = hoverIndex !== null ? x(hoverIndex) : null;

  return (
    <div className="relative">
      <div className="mb-2 flex items-center gap-4 text-xs text-charcoal-600/70">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-moss-600" />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Expense
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Income and expense over the last 6 months"
      >
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={PAD_TOP + innerHeight * (1 - g)}
            y2={PAD_TOP + innerHeight * (1 - g)}
            stroke="var(--walnut-500)"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}

        <path
          d={linePath(data.map((d) => d.income))}
          fill="none"
          stroke="var(--moss-600)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={linePath(data.map((d) => d.expense))}
          fill="none"
          stroke="var(--amber-500)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text x={x(data.length - 1) + 8} y={y(last.income) + 4} fontSize={11} fill="var(--moss-600)">
          {currency.format(last.income)}
        </text>
        <text x={x(data.length - 1) + 8} y={y(last.expense) + 4} fontSize={11} fill="var(--amber-500)">
          {currency.format(last.expense)}
        </text>

        {data.map((d, i) => (
          <text
            key={d.month}
            x={x(i)}
            y={HEIGHT - 8}
            fontSize={11}
            textAnchor="middle"
            fill="var(--charcoal-600)"
            opacity={0.6}
          >
            {d.label}
          </text>
        ))}

        {/* Hover hit-targets — a full column per month, wider than the 2px line itself. */}
        {data.map((d, i) => (
          <rect
            key={d.month}
            x={x(i) - Math.max(stepX, 24) / 2}
            y={PAD_TOP}
            width={Math.max(stepX, 24)}
            height={innerHeight}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}

        {hoveredX !== null && (
          <line
            x1={hoveredX}
            x2={hoveredX}
            y1={PAD_TOP}
            y2={PAD_TOP + innerHeight}
            stroke="var(--charcoal-600)"
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        )}
        {hoverIndex !== null && (
          <>
            <circle cx={x(hoverIndex)} cy={y(data[hoverIndex].income)} r={4} fill="var(--moss-600)" />
            <circle cx={x(hoverIndex)} cy={y(data[hoverIndex].expense)} r={4} fill="var(--amber-500)" />
          </>
        )}
      </svg>

      {hovered && hoveredX !== null && (
        <div
          className="pointer-events-none absolute top-2 rounded-md border border-walnut-500/15 bg-parchment-paper px-2.5 py-1.5 text-xs shadow-lifted"
          style={{ left: `${(hoveredX / WIDTH) * 100}%`, transform: "translateX(-50%)" }}
        >
          <p className="mb-1 font-medium text-charcoal-800">{hovered.label}</p>
          <p className="text-moss-600">Income {currency.format(hovered.income)}</p>
          <p className="text-amber-500">Expense {currency.format(hovered.expense)}</p>
        </div>
      )}
    </div>
  );
}

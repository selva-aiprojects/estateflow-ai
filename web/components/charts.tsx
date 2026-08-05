import { formatNumber } from "@/lib/format";

function niceMax(values: number[]) {
  const max = Math.max(...values);
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / magnitude) * magnitude;
}

export function CashFlowChart({ data }: { data: { month: string; inflow: number; outflow: number }[] }) {
  const W = 560;
  const H = 220;
  const P = { top: 16, right: 12, bottom: 28, left: 40 };
  const iw = W - P.left - P.right;
  const ih = H - P.top - P.bottom;
  const max = niceMax(data.flatMap((d) => [d.inflow, d.outflow])) * 1.1;
  const x = (i: number) => P.left + (i * iw) / (data.length - 1);
  const y = (v: number) => P.top + ih - (v / max) * ih;

  const inflowPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.inflow)}`).join(" ");
  const outflowPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.outflow)}`).join(" ");
  const area = `${inflowPath} L${x(data.length - 1)},${P.top + ih} L${x(0)},${P.top + ih} Z`;

  const gridLines = 4;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Cash flow forecast: monthly inflow vs outflow in crore rupees">
        <defs>
          <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(221 68% 34% / 0.18)" />
            <stop offset="100%" stopColor="hsl(221 68% 34% / 0.01)" />
          </linearGradient>
        </defs>
        {Array.from({ length: gridLines + 1 }).map((_, gi) => {
          const gy = P.top + (gi * ih) / gridLines;
          const label = max - (max / gridLines) * gi;
          return (
            <g key={gi}>
              <line x1={P.left} y1={gy} x2={W - P.right} y2={gy} stroke="hsl(var(--border))" strokeWidth="1" />
              <text x={P.left - 8} y={gy + 4} textAnchor="end" fontSize="10" fill="hsl(var(--text-subtle))">
                {label >= 1 ? `₹${label.toFixed(0)}Cr` : `₹${label.toFixed(1)}Cr`}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#inflowFill)" />
        <path d={inflowPath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={outflowPath} fill="none" stroke="hsl(var(--border-strong))" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={d.month}>
            <circle cx={x(i)} cy={y(d.inflow)} r="3.5" fill="hsl(var(--primary))" stroke="hsl(var(--surface))" strokeWidth="2" />
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="hsl(var(--text-subtle))">
              {d.month}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center gap-5 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-primary" /> Inflow
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded border-t-2 border-dashed border-border-strong" /> Outflow
        </span>
      </div>
    </div>
  );
}

export function BarChart({ data, color = "hsl(var(--primary))" }: { data: { month: string; units: number }[]; color?: string }) {
  const W = 480;
  const H = 200;
  const P = { top: 16, right: 12, bottom: 28, left: 32 };
  const iw = W - P.left - P.right;
  const ih = H - P.top - P.bottom;
  const max = niceMax(data.map((d) => d.units)) * 1.15;
  const barW = Math.min(iw / data.length * 0.5, 34);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Sales velocity: units sold per month">
      {Array.from({ length: 4 }).map((_, gi) => {
        const gy = P.top + (gi * ih) / 3;
        const label = Math.round(max - (max / 3) * gi);
        return (
          <g key={gi}>
            <line x1={P.left} y1={gy} x2={W - P.right} y2={gy} stroke="hsl(var(--border))" strokeWidth="1" />
            <text x={P.left - 6} y={gy + 4} textAnchor="end" fontSize="10" fill="hsl(var(--text-subtle))">
              {label}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const bw = barW;
        const bh = (d.units / max) * ih;
        const bx = P.left + i * (iw / data.length) + (iw / data.length - bw) / 2;
        const by = P.top + ih - bh;
        return (
          <g key={d.month}>
            <rect x={bx} y={by} width={bw} height={Math.max(bh, 2)} rx="4" fill={color} className="transition-opacity hover:opacity-80">
              <title>{`${d.month}: ${d.units} units`}</title>
            </rect>
            <text x={bx + bw / 2} y={by - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(var(--text-muted))">
              {d.units}
            </text>
            <text x={bx + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="hsl(var(--text-subtle))">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ segments, size = 160, thickness = 22 }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Inventory status distribution">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--surface-muted))" strokeWidth={thickness} />
          {segments.map((seg) => {
            const len = (seg.value / total) * c;
            const el = (
              <circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="round"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-text tabular-nums">{total}</span>
          <span className="text-xs text-text-muted">Units</span>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} aria-hidden />
              {seg.label}
            </span>
            <span className="font-medium text-text tabular-nums">
              {formatNumber(seg.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useMemo, useRef, useState } from 'react';

export type PlotSeries = {
  id: string;
  label: string;
  color: string;
  value: (x: number) => number;
  grad: (x: number) => number;
};

type Props = {
  series: PlotSeries[];
  xMin: number;
  xMax: number;
  xLabel: string;
  lossLabel: string;
  gradLabel: string;
  showGradient: boolean;
};

const W = 660;
const H = 400;
const N = 241;

const finite = (v: number) => Number.isFinite(v) && Math.abs(v) < 1e4;

function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const span = max - min;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + step * 1e-6; v += step) out.push(Math.abs(v) < 1e-9 ? 0 : v);
  return out;
}

function fmt(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 100 || a < 0.01) return v.toExponential(0);
  if (a >= 10) return v.toFixed(0);
  if (a >= 1) return v.toFixed(1);
  return v.toFixed(2);
}

export function LossPlot({
  series,
  xMin,
  xMax,
  xLabel,
  lossLabel,
  gradLabel,
  showGradient,
}: Props) {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const m = { l: 50, r: showGradient ? 50 : 20, t: 16, b: 42 };
  const innerW = W - m.l - m.r;
  const innerH = H - m.t - m.b;

  const xs = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < N; i++) arr.push(xMin + ((xMax - xMin) * i) / (N - 1));
    return arr;
  }, [xMin, xMax]);

  // sample every series
  const data = useMemo(() => {
    return series.map((s) => ({
      ...s,
      vals: xs.map((x) => s.value(x)),
      grads: xs.map((x) => s.grad(x)),
    }));
  }, [series, xs]);

  // y-ranges
  const lossRange = useMemo(() => {
    const v = data.flatMap((s) => s.vals).filter(finite);
    if (!v.length) return [0, 1];
    let lo = Math.min(...v, 0);
    let hi = Math.max(...v);
    if (lo === hi) hi = lo + 1;
    const pad = (hi - lo) * 0.06;
    return [lo - pad, hi + pad];
  }, [data]);

  const gradRange = useMemo(() => {
    if (!showGradient) return [0, 1];
    const v = data.flatMap((s) => s.grads).filter(finite);
    if (!v.length) return [-1, 1];
    let lo = Math.min(...v, 0);
    let hi = Math.max(...v, 0);
    if (lo === hi) hi = lo + 1;
    const pad = (hi - lo) * 0.06;
    return [lo - pad, hi + pad];
  }, [data, showGradient]);

  const sx = (x: number) => m.l + ((x - xMin) / (xMax - xMin)) * innerW;
  const syL = (v: number) =>
    m.t + (1 - (v - lossRange[0]) / (lossRange[1] - lossRange[0])) * innerH;
  const syR = (v: number) =>
    m.t + (1 - (v - gradRange[0]) / (gradRange[1] - gradRange[0])) * innerH;

  function pathFor(vals: number[], scale: (v: number) => number) {
    let d = '';
    let pen = false;
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i];
      if (!finite(v)) {
        pen = false;
        continue;
      }
      const X = sx(xs[i]);
      const Y = scale(v);
      d += `${pen ? 'L' : 'M'}${X.toFixed(2)} ${Y.toFixed(2)} `;
      pen = true;
    }
    return d.trim();
  }

  const xTicks = niceTicks(xMin, xMax, 6);
  const lossTicks = niceTicks(lossRange[0], lossRange[1], 5);
  const gradTicks = showGradient ? niceTicks(gradRange[0], gradRange[1], 5) : [];

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (px < m.l || px > W - m.r) {
      setHoverX(null);
      return;
    }
    const x = xMin + ((px - m.l) / innerW) * (xMax - xMin);
    setHoverX(x);
  }

  const hoverInfo =
    hoverX != null
      ? series.map((s) => ({
          id: s.id,
          label: s.label,
          color: s.color,
          v: s.value(hoverX),
          g: s.grad(hoverX),
        }))
      : null;

  return (
    <div>
      <svg
        ref={svgRef}
        className="loss-plot"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${lossLabel} vs ${xLabel}`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverX(null)}
      >
        {/* horizontal gridlines + left ticks */}
        {lossTicks.map((tv) => (
          <g key={`gl${tv}`}>
            <line className="gridline" x1={m.l} x2={W - m.r} y1={syL(tv)} y2={syL(tv)} />
            <text className="tick-label" x={m.l - 6} y={syL(tv) + 3} textAnchor="end">
              {fmt(tv)}
            </text>
          </g>
        ))}
        {/* x ticks */}
        {xTicks.map((tv) => (
          <text
            key={`xt${tv}`}
            className="tick-label"
            x={sx(tv)}
            y={H - m.b + 16}
            textAnchor="middle"
          >
            {fmt(tv)}
          </text>
        ))}
        {/* right (gradient) ticks */}
        {gradTicks.map((tv) => (
          <text
            key={`grt${tv}`}
            className="tick-label"
            x={W - m.r + 6}
            y={syR(tv) + 3}
            textAnchor="start"
          >
            {fmt(tv)}
          </text>
        ))}

        {/* axes */}
        <line className="axis" x1={m.l} x2={m.l} y1={m.t} y2={H - m.b} />
        <line className="axis" x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} />
        {/* zero line for loss axis if range crosses 0 */}
        {lossRange[0] < 0 && lossRange[1] > 0 && (
          <line className="gridline" x1={m.l} x2={W - m.r} y1={syL(0)} y2={syL(0)} />
        )}

        {/* gradient curves (right axis, dashed) underneath */}
        {showGradient &&
          data.map((s) => (
            <path
              key={`g-${s.id}`}
              className="curve grad"
              d={pathFor(s.grads, syR)}
              style={{ stroke: s.color }}
            />
          ))}

        {/* loss curves (left axis) */}
        {data.map((s) => (
          <path
            key={`v-${s.id}`}
            className="curve"
            d={pathFor(s.vals, syL)}
            style={{ stroke: s.color }}
          />
        ))}

        {/* hover cursor */}
        {hoverX != null && (
          <line
            className="cursor-line"
            x1={sx(hoverX)}
            x2={sx(hoverX)}
            y1={m.t}
            y2={H - m.b}
          />
        )}
        {hoverX != null &&
          data.map((s) => {
            const v = s.value(hoverX);
            return finite(v) ? (
              <circle
                key={`hv-${s.id}`}
                cx={sx(hoverX)}
                cy={syL(v)}
                r={3.2}
                style={{ fill: s.color }}
              />
            ) : null;
          })}

        {/* axis labels */}
        <text className="axis-label" x={m.l + innerW / 2} y={H - 4} textAnchor="middle">
          {xLabel}
        </text>
        <text
          className="axis-label"
          x={14}
          y={m.t + innerH / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${m.t + innerH / 2})`}
        >
          {lossLabel}
        </text>
        {showGradient && (
          <text
            className="axis-label"
            x={W - 12}
            y={m.t + innerH / 2}
            textAnchor="middle"
            transform={`rotate(90 ${W - 12} ${m.t + innerH / 2})`}
          >
            {gradLabel}
          </text>
        )}
      </svg>

      <div className="hover-readout">
        {hoverInfo
          ? `x=${fmt(hoverX!)}  ·  ` +
            hoverInfo
              .map(
                (h) =>
                  `${h.label}: ${finite(h.v) ? h.v.toFixed(2) : '∞'}` +
                  (showGradient ? ` (∇ ${finite(h.g) ? h.g.toFixed(2) : '∞'})` : ''),
              )
              .join('   ')
          : ''}
      </div>
    </div>
  );
}

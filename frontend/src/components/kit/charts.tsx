import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const axis = { fontSize: 11, fill: '#94a3b8' };

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line-soft bg-white px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-semibold text-ink-3">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 font-semibold text-ink">
          <span className="size-2 rounded-full" style={{ background: p.color || p.stroke }} />
          {p.name}: {p.value}
          {unit ? ` ${unit}` : ''}
        </p>
      ))}
    </div>
  );
}

export interface Series {
  key: string;
  name: string;
  color?: string;
}

export function TrendChart({
  data,
  xKey,
  series,
  height = 260,
  unit,
  domain,
  band,
  type = 'area',
}: {
  data: Record<string, any>[];
  xKey: string;
  series: Series[];
  height?: number;
  unit?: string;
  domain?: [number | 'auto', number | 'auto'];
  band?: { from: number; to: number; label?: string };
  type?: 'area' | 'line' | 'bar';
}) {
  const colors = ['#029c6b', '#0ea5e9', '#f59e0b', '#8b5cf6'];
  const common = (
    <>
      <CartesianGrid stroke="#eef2f6" vertical={false} />
      <XAxis dataKey={xKey} tick={axis} axisLine={false} tickLine={false} dy={8} />
      <YAxis tick={axis} axisLine={false} tickLine={false} width={40} domain={domain ?? ['auto', 'auto']} />
      <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: '#a7f0cf', strokeWidth: 1.5 }} />
      {band && <ReferenceArea y1={band.from} y2={band.to} fill="#029c6b" fillOpacity={0.06} stroke="none" />}
    </>
  );
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            {common}
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color ?? colors[i]} radius={[6, 6, 0, 0]} maxBarSize={28} />
            ))}
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            {common}
            {series.map((s, i) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? colors[i]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
            ))}
          </LineChart>
        ) : (
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              {series.map((s, i) => (
                <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color ?? colors[i]} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={s.color ?? colors[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {common}
            {series.map((s, i) => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? colors[i]} strokeWidth={2.5} fill={`url(#g-${s.key})`} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ data, color = '#029c6b', height = 36 }: { data: number[]; color?: string; height?: number }) {
  const rows = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sp-${color})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

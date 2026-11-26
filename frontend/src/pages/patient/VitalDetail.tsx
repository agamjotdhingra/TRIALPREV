import { useMemo, useState } from 'react';
import { Link, Redirect, useParams } from 'wouter';
import { CalendarDays, CheckCircle2, Download, Lightbulb, Stethoscope, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, Badge, Btn, Callout, Card, CardHeader, DataTable, Donut, Kpi, Modal, Page, PageHeader, Progress, Segmented, Field, Input } from '@/components/kit';
import { TrendChart } from '@/components/kit/charts';
import { SERIES } from '@/data/demo';
import { useAuth } from '@/auth/AuthContext';

type Range = 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';

interface Metric {
  title: string;
  subtitle: string;
  unit: string;
  series: { t: string; v: number }[];
  kpis: { label: string; value: string; sub: string; badge?: string }[];
  chartTitle: string;
  band?: { from: number; to: number };
  domain?: [number, number];
  legend: { label: string; color: string }[];
  readings: { time: string; value: string; status: string; source: string }[];
  donutTitle: string;
  donut: { label: string; sub: string; value: number; color: string }[];
  donutCenter: string;
  healthy: { title: string; body: string };
  insights: string[];
  tip?: string;
  note?: { by: string; body: string };
  goals?: boolean;
  dailyScale: number;
}

const M: Record<string, Metric> = {
  'heart-rate': {
    title: 'Heart Rate Details',
    subtitle: 'Track and analyze cardiovascular health and heart rate variability',
    unit: 'bpm',
    series: SERIES.heart,
    kpis: [
      { label: 'Avg. Heart Rate', value: '72', sub: 'Past 7 Days', badge: 'Normal' },
      { label: 'Highest Heart Rate', value: '128', sub: 'On 24 Jun, 6:45 PM' },
      { label: 'Lowest Heart Rate', value: '48', sub: 'On 22 Jun, 5:30 AM' },
    ],
    chartTitle: 'Heart Rate Trends',
    band: { from: 60, to: 100 },
    domain: [40, 140],
    legend: [
      { label: 'Resting (<60)', color: '#0ea5e9' },
      { label: 'Normal (60–100)', color: '#029c6b' },
      { label: 'Elevated (>100)', color: '#ef4444' },
    ],
    readings: [
      { time: '26 Jun, 10:00 PM', value: '70', status: 'Normal', source: 'Apple Watch' },
      { time: '26 Jun, 08:00 PM', value: '75', status: 'Normal', source: 'Apple Watch' },
      { time: '26 Jun, 06:45 PM', value: '128', status: 'Elevated', source: 'Apple Watch' },
      { time: '26 Jun, 04:00 PM', value: '88', status: 'Normal', source: 'Apple Watch' },
      { time: '26 Jun, 12:00 PM', value: '74', status: 'Normal', source: 'Apple Watch' },
    ],
    donutTitle: 'Heart Rate Zones',
    donut: [
      { label: 'Zone 1 (Resting)', sub: '50–60% max HR', value: 65, color: '#029c6b' },
      { label: 'Zone 2 (Fat Burn)', sub: '60–70% max HR', value: 20, color: '#34c38f' },
      { label: 'Zone 3 (Cardio)', sub: '70–85% max HR', value: 10, color: '#f59e0b' },
      { label: 'Zone 4 (Peak)', sub: '>85% max HR', value: 5, color: '#ef4444' },
    ],
    donutCenter: '65%',
    healthy: { title: 'Healthy Heart Rate', body: 'Your heart rate distribution is consistent with good cardiovascular health.' },
    insights: ['Heart rate recovery after exercise is within normal limits.', 'Resting heart rate indicates good cardiovascular fitness.', 'One elevated reading on 24 Jun coincided with a logged workout.'],
    note: { by: "Dr. Vivek Sharma's Note", body: 'Continue current cardiovascular routine. Heart rate variability looks stable. Keep monitoring post-workout peaks.' },
    dailyScale: 1,
  },
  activity: {
    title: 'Activity Level Details',
    subtitle: 'Track and analyze physical activity and calories burnt',
    unit: 'kcal',
    series: SERIES.activity,
    kpis: [
      { label: 'Avg. Calories Burnt', value: '482', sub: 'Past 7 Days', badge: 'Good' },
      { label: 'Highest (in a Day)', value: '612', sub: 'On 16 Aug, 6:00 PM' },
      { label: 'Lowest (in a Day)', value: '286', sub: 'On 13 Aug, 10:00 AM' },
    ],
    chartTitle: 'Calories Burnt Trends',
    domain: [0, 700],
    legend: [
      { label: 'Low (<200 kcal)', color: '#94a3b8' },
      { label: 'Moderate (200-400 kcal)', color: '#34c38f' },
      { label: 'Active (400-600 kcal)', color: '#029c6b' },
      { label: 'High (>600 kcal)', color: '#f59e0b' },
    ],
    readings: [
      { time: '10:00 PM', value: '312', status: 'Moderate', source: 'Fitbit' },
      { time: '08:00 PM', value: '426', status: 'Active', source: 'Fitbit' },
      { time: '06:00 PM', value: '612', status: 'High', source: 'Fitbit' },
      { time: '04:00 PM', value: '498', status: 'Active', source: 'Fitbit' },
      { time: '02:00 PM', value: '356', status: 'Moderate', source: 'Fitbit' },
    ],
    donutTitle: 'Activity Intensity (Past 7 Days)',
    donut: [
      { label: 'High Activity', sub: '(>600 kcal) • 2 days', value: 22, color: '#f59e0b' },
      { label: 'Active', sub: '(400-600 kcal) • 3 days', value: 48, color: '#029c6b' },
      { label: 'Moderate', sub: '(200-400 kcal) • 1 day', value: 24, color: '#34c38f' },
      { label: 'Low', sub: '(<200 kcal) • 1 day', value: 6, color: '#cbd5e1' },
    ],
    donutCenter: '70%',
    healthy: { title: 'Healthy Activity Level', body: 'Your activity level is consistent with recommended daily goals. Keep staying active!' },
    insights: ['Your daily calorie burn is within a healthy range.', 'Peak activity usually occurs in the evening.', 'Try to maintain 30–40 mins of active movement daily.', 'Higher activity days are linked to better sleep quality.'],
    tip: 'Short walks after meals can help increase calorie burn and improve overall health.',
    goals: true,
    dailyScale: 1,
  },
  temperature: {
    title: 'Body Temperature Details',
    subtitle: 'Monitor body temperature patterns and fever episodes',
    unit: '°F',
    series: SERIES.temp,
    kpis: [
      { label: 'Average Temperature', value: '98.9', sub: 'Past 7 Days', badge: 'Normal' },
      { label: 'Highest Temperature', value: '100.6', sub: 'On 15 Aug, 04:30 PM' },
      { label: 'Lowest Temperature', value: '97.1', sub: 'On 13 Aug, 06:20 PM' },
    ],
    chartTitle: 'Temperature Trends',
    band: { from: 97, to: 99.5 },
    domain: [96, 102],
    legend: [
      { label: 'Normal (97–99.5°F)', color: '#029c6b' },
      { label: 'Low-grade (99.5–100.4°F)', color: '#f59e0b' },
      { label: 'Fever (>100.4°F)', color: '#ef4444' },
    ],
    readings: [
      { time: '10:00 PM', value: '98.6', status: 'Normal', source: 'Smart Thermometer' },
      { time: '08:00 PM', value: '99.8', status: 'Low-grade', source: 'Smart Thermometer' },
      { time: '07:00 PM', value: '99.1', status: 'Normal', source: 'Smart Thermometer' },
      { time: '04:30 PM', value: '100.6', status: 'Fever', source: 'Smart Thermometer' },
      { time: '06:00 PM', value: '99.3', status: 'Normal', source: 'Smart Thermometer' },
    ],
    donutTitle: 'Temperature Range',
    donut: [
      { label: 'Normal', sub: '131 readings', value: 78, color: '#029c6b' },
      { label: 'Low-grade', sub: '27 readings', value: 16, color: '#f59e0b' },
      { label: 'Fever', sub: '10 readings', value: 6, color: '#ef4444' },
    ],
    donutCenter: '78%',
    healthy: { title: 'Healthy Range', body: 'Normal body temperature is 97°F – 99.5°F. Repeated readings above 100.4°F may need clinical attention.' },
    insights: ['Temperature stayed within normal range most of the time.', 'A single fever episode peaked at 100.6°F on 15 Aug afternoon.', 'No critical events detected in the selected period.'],
    tip: 'Stay hydrated and rest well; log symptoms if readings rise above 100.4°F again.',
    dailyScale: 1,
  },
  spo2: {
    title: 'SpO₂ Details',
    subtitle: 'Blood oxygen saturation trends from your wearable',
    unit: '%',
    series: SERIES.spo2,
    kpis: [
      { label: 'Average SpO₂', value: '98', sub: 'Past 7 Days', badge: 'Normal' },
      { label: 'Highest SpO₂', value: '99', sub: 'On 25 Jun, 02:00 PM' },
      { label: 'Lowest SpO₂', value: '93', sub: 'On 24 Jun, 04:10 AM' },
    ],
    chartTitle: 'SpO₂ Trends',
    band: { from: 95, to: 100 },
    domain: [88, 100],
    legend: [
      { label: 'Normal (≥95%)', color: '#029c6b' },
      { label: 'Below Normal (90–94%)', color: '#f59e0b' },
      { label: 'Low (<90%)', color: '#ef4444' },
    ],
    readings: [
      { time: '10:00 PM', value: '98', status: 'Normal', source: 'Pulse Oximeter' },
      { time: '08:00 PM', value: '98', status: 'Normal', source: 'Pulse Oximeter' },
      { time: '06:00 PM', value: '97', status: 'Normal', source: 'Pulse Oximeter' },
      { time: '04:00 AM', value: '93', status: 'Below Normal', source: 'Pulse Oximeter' },
      { time: '02:00 AM', value: '95', status: 'Normal', source: 'Pulse Oximeter' },
    ],
    donutTitle: 'SpO₂ Summary (Past 7 Days)',
    donut: [
      { label: 'Normal (≥95%)', sub: '131 readings', value: 78, color: '#029c6b' },
      { label: 'Below Normal', sub: '27 readings', value: 16, color: '#f59e0b' },
      { label: 'Low (<90%)', sub: '10 readings', value: 6, color: '#ef4444' },
    ],
    donutCenter: '98%',
    healthy: { title: 'Healthy Range', body: 'Normal SpO₂ range is 95% - 100%. Consistent low levels may need clinical attention.' },
    insights: ['SpO₂ levels are within normal range for most of the time.', 'Slight dip observed around early morning hours.', 'No critical events detected in the selected period.'],
    tip: 'Maintain good sleep posture and regular physical activity to support healthy oxygen levels.',
    dailyScale: 1,
  },
};

function aggregate(series: { t: string; v: number }[], range: Range) {
  if (range === 'Hourly') return series;
  const avg = series.reduce((a, x) => a + x.v, 0) / series.length;
  const labels = range === 'Daily' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : range === 'Weekly' ? ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return labels.map((t, i) => ({ t, v: Math.round((avg + Math.sin(i * 1.7) * avg * 0.06) * 10) / 10 }));
}

export default function VitalDetail() {
  const { metric } = useParams<{ metric: string }>();
  const { profile } = useAuth();
  const m = M[metric];
  const [range, setRange] = useState<Range>('Hourly');
  const [goalOpen, setGoalOpen] = useState(false);
  const [goal, setGoal] = useState(500);
  const [showAll, setShowAll] = useState(false);
  const data = useMemo(() => (m ? aggregate(m.series, range) : []), [m, range]);
  if (!m) return <Redirect to="/patient/health" />;

  const exportCsv = () => {
    const csv = ['Time,Value,Status,Source', ...m.readings.map((r) => [r.time, r.value, r.status, r.source].join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${metric}-readings.csv`;
    a.click();
    toast.success('Readings exported');
  };

  const readings = showAll ? [...m.readings, ...m.readings.map((r) => ({ ...r, time: r.time.replace('26 Jun', '25 Jun') }))] : m.readings;

  return (
    <Page>
      <PageHeader
        back={{ href: '/patient/health', label: 'Health Overview' }}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={profile?.full_name} size={44} />
            {m.title}
          </span>
        }
        subtitle={m.subtitle}
        actions={
          <>
            <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-medium text-ink-2">
              <CalendarDays className="size-4 text-ink-3" /> 20 June – 26 June 2026
            </span>
            <Btn variant="outline" size="sm" className="h-10" onClick={exportCsv} icon={<Download className="size-4" />}>
              Export
            </Btn>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6 min-w-0">
          <div className="grid gap-4 sm:grid-cols-3">
            {m.kpis.map((k) => (
              <Kpi key={k.label} label={k.label} value={k.value} unit={m.unit} sub={k.sub} badge={k.badge && <Badge tone="green">{k.badge}</Badge>} />
            ))}
          </div>

          <Card>
            <CardHeader title={m.chartTitle} action={<Segmented size="sm" className="w-auto" options={['Hourly', 'Daily', 'Weekly', 'Monthly'] as Range[]} value={range} onChange={setRange} />} />
            <div className="px-3 pt-5 sm:px-5">
              <TrendChart data={data} xKey="t" series={[{ key: 'v', name: m.chartTitle.replace(' Trends', '') }]} unit={m.unit} band={m.band} domain={m.domain} height={270} type={metric === 'activity' && range !== 'Hourly' ? 'bar' : 'area'} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line-soft px-6 py-4">
              {m.legend.map((l) => (
                <span key={l.label} className="inline-flex items-center gap-2 text-xs text-ink-3">
                  <span className="size-2.5 rounded-full" style={{ background: l.color }} /> {l.label}
                </span>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader title={metric === 'activity' ? 'Recent Activity Readings' : 'Recent Readings'} />
              <DataTable
                className="mt-4"
                rows={readings}
                rowKey={(_, i) => i}
                columns={[
                  { key: 't', header: 'Time', cell: (r) => <span className="whitespace-nowrap">{r.time}</span> },
                  { key: 'v', header: `Value (${m.unit})`, cell: (r) => <span className="num font-semibold text-ink">{r.value}</span> },
                  { key: 's', header: 'Status', cell: (r) => <Badge tone={/elevated|fever|high|below/i.test(r.status) ? 'amber' : 'green'}>{r.status}</Badge> },
                ]}
              />
              <button onClick={() => setShowAll((s) => !s)} className="w-full border-t border-line-soft py-3.5 text-[13px] font-semibold text-brand-700 transition-colors hover:bg-brand-50/50">
                {showAll ? 'Show fewer' : 'View All Readings'}
              </button>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-[15px] font-bold text-ink">{metric === 'activity' ? 'Activity Insights' : 'Clinical Insights'}</h3>
              <ul className="mt-4 space-y-3.5">
                {m.insights.map((i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500" /> {i}
                  </li>
                ))}
              </ul>
              {m.tip && (
                <Callout tone="amber" icon={<Lightbulb />} title="Tip" className="mt-6">
                  {m.tip}
                </Callout>
              )}
              {m.note && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-line-soft">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Stethoscope className="size-4 text-brand-600" /> {m.note.by}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{m.note.body}</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <h3 className="font-display text-[15px] font-bold text-ink">{m.donutTitle}</h3>
            <div className="mt-5 flex items-center gap-5">
              <Donut size={128} thickness={16} segments={m.donut.map((d) => ({ value: d.value, color: d.color, label: d.label }))}>
                <span className="num font-display text-xl font-bold text-ink">{m.donutCenter}</span>
              </Donut>
              <ul className="min-w-0 flex-1 space-y-3">
                {m.donut.map((d) => (
                  <li key={d.label} className="flex items-start justify-between gap-2">
                    <span className="flex min-w-0 items-start gap-2">
                      <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-ink">{d.label}</span>
                        <span className="block text-[11px] text-ink-3">{d.sub}</span>
                      </span>
                    </span>
                    <span className="num text-[13px] font-semibold text-ink-2">{d.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <Callout tone="green" icon={<CheckCircle2 />} title={m.healthy.title} className="mt-6">
              {m.healthy.body}
            </Callout>
          </Card>

          {m.goals && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[15px] font-bold text-ink">Daily Activity Goals</h3>
                <Btn size="xs" variant="secondary" onClick={() => setGoalOpen(true)} icon={<Target className="size-3.5" />}>
                  Set Goal
                </Btn>
              </div>
              <div className="mt-5 flex items-center gap-5">
                <Donut size={104} thickness={11} segments={[{ value: Math.min(482, goal), color: '#029c6b' }, { value: Math.max(goal - 482, 0), color: 'transparent' }]}>
                  <span className="num font-display text-lg font-bold text-ink">{Math.min(100, Math.round((482 / goal) * 100))}%</span>
                </Donut>
                <div>
                  <p className="text-xs text-ink-3">Goal for Today</p>
                  <p className="num font-display text-2xl font-bold text-ink">
                    482 <span className="text-sm font-medium text-ink-3">/ {goal} kcal</span>
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                {[
                  ['6,820', 'Steps'],
                  ['5.2 km', 'Distance'],
                  ['48 min', 'Active time'],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-slate-50 px-2 py-3">
                    <p className="num font-display text-[15px] font-bold text-ink">{v}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">{l}</p>
                  </div>
                ))}
              </div>
              <Progress value={(6820 / 10000) * 100} className="mt-5" tone="green" />
              <p className="mt-2 text-xs text-ink-3">68% of your 10,000 step goal</p>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="font-display text-[15px] font-bold text-ink">Other vitals</h3>
            <div className="mt-3 divide-y divide-line-soft">
              {Object.entries(M)
                .filter(([k]) => k !== metric)
                .map(([k, v]) => (
                  <Link key={k} href={`/patient/vitals/${k}`} className="flex items-center justify-between py-3 text-sm font-medium text-ink-2 hover:text-brand-700">
                    {v.title.replace(' Details', '')}
                    <span className="num text-ink-3">
                      {v.kpis[0].value} {v.unit}
                    </span>
                  </Link>
                ))}
            </div>
          </Card>
        </aside>
      </div>

      <Modal
        open={goalOpen}
        onClose={() => setGoalOpen(false)}
        title="Set daily calorie goal"
        description="We'll nudge you when you're close to hitting it."
        size="sm"
        footer={
          <>
            <Btn variant="outline" onClick={() => setGoalOpen(false)}>
              Cancel
            </Btn>
            <Btn
              onClick={() => {
                setGoalOpen(false);
                toast.success(`Daily goal set to ${goal} kcal`);
              }}
            >
              Save Goal
            </Btn>
          </>
        }
      >
        <Field label="Calories to burn per day">
          <Input type="number" min={100} max={2000} step={50} value={goal} onChange={(e) => setGoal(Math.max(100, Number(e.target.value) || 100))} />
        </Field>
      </Modal>
    </Page>
  );
}

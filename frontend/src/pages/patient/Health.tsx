import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Droplets, Footprints, HeartPulse, Moon, Salad, Thermometer } from 'lucide-react';
import { useGetPatientMe } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Card, CardHeader, InfoRow, Page, PageHeader, Progress, ScoreRing, Segmented, Badge } from '@/components/kit';
import { TrendChart } from '@/components/kit/charts';
import { ME, SERIES } from '@/data/demo';
import { cn } from '@/lib/utils';

const FACTORS = [
  { label: 'Physical Activity', value: 92, icon: Footprints },
  { label: 'Sleep Quality', value: 88, icon: Moon },
  { label: 'Nutrition', value: 75, icon: Salad },
];

const VITALS = [
  { key: 'heart-rate', label: 'Heart Rate', value: '72', unit: 'bpm', icon: HeartPulse, color: 'text-rose-500', spark: SERIES.heart.map((x) => x.v) },
  { key: 'spo2', label: 'SpO₂', value: '98', unit: '%', icon: Droplets, color: 'text-sky-500', spark: SERIES.spo2.map((x) => x.v) },
  { key: 'temperature', label: 'Temperature', value: '98.6', unit: '°F', icon: Thermometer, color: 'text-amber-500', spark: SERIES.temp.map((x) => x.v) },
  { key: 'activity', label: 'Activity', value: '482', unit: 'kcal', icon: Footprints, color: 'text-orange-500', spark: SERIES.activity.map((x) => x.v) },
];

export default function PatientHealth() {
  const { isDemo, profile } = useAuth();
  const me = useGetPatientMe();
  const p = isDemo ? null : me.data;
  const [range, setRange] = useState<'6M' | '1Y'>('6M');
  const score = p?.health_score ?? ME.score;
  const name = p?.full_name ?? profile?.full_name ?? ME.name;
  const height = p?.height ?? ME.height;
  const weight = p?.weight ?? ME.weight;
  const bmi = height && weight ? (weight / Math.pow(height / 100, 2)).toFixed(1) : '—';
  const trend = range === '6M' ? SERIES.score : [...['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((t, i) => ({ t, v: [64, 66, 69, 68, 71, 70][i] })), ...SERIES.score];

  return (
    <Page>
      <PageHeader title="Health Overview" subtitle="Your overall score, contributing factors and recent vitals in one place." back={{ href: '/patient/dashboard', label: 'Dashboard' }} />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="p-6 sm:p-7">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">Overall Health Score</p>
          <div className="mt-6 flex justify-center">
            <ScoreRing score={score} size={190} thickness={14} />
          </div>
          <div className="mt-4 text-center">
            <Badge tone={score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red'} dot>
              {score >= 80 ? 'Low Risk' : score >= 60 ? 'Moderate Risk' : 'High Risk'}
            </Badge>
          </div>
          <div className="mt-8 border-t border-line-soft pt-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-[15px] font-bold text-ink">Contributing Factors</h3>
              <span className="text-xs text-ink-3">Higher = healthier</span>
            </div>
            <div className="mt-5 space-y-5">
              {FACTORS.map((f) => (
                <div key={f.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-ink-2">
                      <f.icon className="size-4 text-brand-600" /> {f.label}
                    </span>
                    <span className="num font-semibold text-ink">{f.value}%</span>
                  </div>
                  <Progress value={f.value} tone={f.value >= 85 ? 'green' : 'amber'} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar name={name} size={88} ring />
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-ink">Patient Profile Details</h3>
                  <Link href="/patient/profile" className="text-[13px] font-semibold text-brand-700 hover:underline">
                    Edit
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-6">
                  <InfoRow label="Age" value={`${p?.age ?? ME.age} Yrs`} />
                  <InfoRow label="Gender" value={p?.gender ?? ME.gender} />
                  <InfoRow label="Blood Group" value={p?.blood_group ?? ME.bloodGroup} />
                  <InfoRow label="Height" value={`${height} cm`} />
                  <InfoRow label="Weight" value={`${weight} kg`} />
                  <InfoRow label="BMI" value={bmi} />
                </div>
              </div>
            </div>
          </Card>

          <div>
            <h3 className="mb-3 font-display text-base font-bold text-ink">Recent Vitals</h3>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {VITALS.map((v) => (
                <Link key={v.key} href={`/patient/vitals/${v.key}`} className="card group p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">{v.label}</span>
                    <v.icon className={cn('size-4', v.color)} />
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold text-ink num">
                    {v.value}
                    <span className="ml-1 text-xs font-medium text-ink-3">{v.unit}</span>
                  </p>
                  <div className="mt-3 flex h-8 items-end gap-[3px]">
                    {v.spark.map((n, i) => {
                      const min = Math.min(...v.spark);
                      const max = Math.max(...v.spark);
                      return <span key={i} className="flex-1 rounded-sm bg-brand-200 transition-colors group-hover:bg-brand-400" style={{ height: `${20 + ((n - min) / (max - min || 1)) * 80}%` }} />;
                    })}
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
                    Details <ArrowRight className="size-3" />
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader title="Health Score Trend" subtitle="Monthly average across all contributing factors" action={<Segmented size="sm" className="w-auto" options={['6M', '1Y']} value={range} onChange={setRange} />} />
            <div className="px-3 pb-5 pt-4 sm:px-5">
              <TrendChart data={trend} xKey="t" series={[{ key: 'v', name: 'Score' }]} height={220} domain={[50, 100]} />
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}

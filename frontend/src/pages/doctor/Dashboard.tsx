import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { Activity, Apple, Droplets, Dumbbell, FileText, FlaskConical, HeartPulse, Pill, Plus, Save, Sparkles, Stethoscope, Thermometer, Users, Video } from 'lucide-react';
import { useListAppointments } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, CapsuleTabs, Card, CardHeader, Donut, Progress, SearchInput, StatusPill, Textarea } from '@/components/kit';
import { TrendChart } from '@/components/kit/charts';
import { SERIES } from '@/data/demo';
import { mapAppt } from '@/data/mappers';
import { cn } from '@/lib/utils';

type Mode = 'Clinical' | 'Physiotherapy' | 'Nutrition';
interface QItem { id: string; name: string; age: number | string; gender?: string; reason: string; status: 'In Progress' | 'Scheduled' | 'Completed'; time: string; hid: string; patientId?: number }

const QUEUES: Record<Mode, QItem[]> = {
  Clinical: [
    { id: 'p1', name: 'Priya Sharma', age: 32, gender: 'F', reason: 'Routine follow-up', status: 'In Progress', time: '09:30 AM', hid: 'PRV-882-901' },
    { id: 'p2', name: 'Amit Patel', age: 45, gender: 'M', reason: 'Skin rash', status: 'Scheduled', time: '10:15 AM', hid: 'PRV-102-445' },
    { id: 'p3', name: 'Neha Reddy', age: 36, gender: 'F', reason: 'Thyroid review', status: 'Scheduled', time: '11:00 AM', hid: 'PRV-774-118' },
    { id: 'p4', name: 'Rajesh Kumar', age: 61, gender: 'M', reason: 'Prescription refill', status: 'Completed', time: '08:00 AM', hid: 'PRV-110-277' },
  ],
  Physiotherapy: [
    { id: 'f1', name: 'Sonu Sito wala', age: 45, gender: 'M', reason: 'Knee Rehab', status: 'In Progress', time: '09:00 AM', hid: 'PRV-551-002' },
    { id: 'f2', name: 'Amit Patel', age: 32, gender: 'M', reason: 'Shoulder Impingement', status: 'Scheduled', time: '10:30 AM', hid: 'PRV-102-445' },
    { id: 'f3', name: 'Priya Sharma', age: 58, gender: 'F', reason: 'Post-Stroke Gait', status: 'Scheduled', time: '12:00 PM', hid: 'PRV-882-901' },
  ],
  Nutrition: [
    { id: 'n1', name: 'Sonu Sito wala', age: 45, gender: 'M', reason: 'Knee Rehab · Weight', status: 'In Progress', time: '09:00 AM', hid: 'PRV-551-002' },
    { id: 'n2', name: 'Amit Patel', age: 52, gender: 'M', reason: 'Type 2 Diabetes', status: 'Scheduled', time: '10:00 AM', hid: 'PRV-102-445' },
    { id: 'n3', name: 'Priya Sharma', age: 29, gender: 'F', reason: 'PCOS & Weight Mgmt', status: 'Scheduled', time: '11:30 AM', hid: 'PRV-882-901' },
    { id: 'n4', name: 'Rajesh Sundaram', age: 61, gender: 'M', reason: 'Hypertension / Renal', status: 'Scheduled', time: '02:00 PM', hid: 'PRV-993-211' },
  ],
};

const KEY = 'prevntiv.doctor.mode';

export default function DoctorDashboard() {
  const { isDemo, profile } = useAuth();
  const [mode, setModeState] = useState<Mode>(() => (localStorage.getItem(KEY) as Mode) || 'Clinical');
  const setMode = (m: Mode) => {
    localStorage.setItem(KEY, m);
    setModeState(m);
    setActive(null);
  };
  const apptQ = useListAppointments();
  const liveQueue: QItem[] | null = useMemo(() => {
    if (isDemo || !apptQ.data?.length) return null;
    return apptQ.data.map(mapAppt).slice(0, 8).map((a, i) => ({ id: a.patientId ? String(a.patientId) : a.id, name: a.patient ?? 'Patient', age: '', reason: a.reason || 'Consultation', status: a.status === 'Completed' ? 'Completed' : i === 0 && a.status === 'Scheduled' ? 'In Progress' : 'Scheduled', time: a.time, hid: a.patientHid ?? '', patientId: a.patientId }));
  }, [apptQ.data, isDemo]);
  const queue = mode === 'Clinical' && liveQueue ? liveQueue : QUEUES[mode];
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const current = queue.find((x) => x.id === active) ?? queue[0];
  const visible = queue.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 animate-fade-up">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-ink-3">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="font-display text-[28px] font-bold text-ink">Good to see you, {profile?.full_name?.replace(/^Dr\.?\s*/, 'Dr. ').split(' ').slice(0, 2).join(' ')}</h1>
          <p className="mt-1 text-sm text-ink-3">
            {queue.filter((x) => x.status !== 'Completed').length} patients waiting · {queue.filter((x) => x.status === 'Completed').length} completed today
          </p>
        </div>
        <CapsuleTabs tabs={['Clinical', 'Physiotherapy', 'Nutrition'] as Mode[]} value={mode} onChange={setMode} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_1fr_330px]">
        {/* Queue */}
        <Card className="flex flex-col xl:max-h-[calc(100vh-13rem)]">
          <div className="border-b border-line-soft p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Today's Queue</h2>
              <Badge tone="green">{queue.length}</Badge>
            </div>
            <SearchInput value={q} onChange={setQ} placeholder="Search patients..." />
          </div>
          <div className="flex gap-2 overflow-x-auto p-3 xl:flex-1 xl:flex-col xl:overflow-y-auto">
            {visible.map((x) => (
              <button
                key={x.id}
                onClick={() => setActive(x.id)}
                className={cn('flex min-w-[220px] items-center gap-3 rounded-xl border p-3 text-left transition-all xl:min-w-0', current.id === x.id ? 'border-brand-300 bg-brand-50 shadow-sm' : 'border-transparent hover:bg-slate-50', x.status === 'Completed' && 'opacity-60')}
              >
                <Avatar name={x.name} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {x.name}
                    {x.age ? `, ${x.age}` : ''}
                  </span>
                  <span className="block truncate text-xs text-ink-3">{x.reason}</span>
                  <span className="mt-1 flex items-center gap-2 text-[11px]">
                    <StatusPill status={x.status} />
                    <span className="text-ink-4">{x.time}</span>
                  </span>
                </span>
              </button>
            ))}
            {!visible.length && <p className="p-4 text-center text-sm text-ink-3">No patients match.</p>}
          </div>
          <div className="hidden border-t border-line-soft p-4 xl:block">
            <Link href="/doctor/queue" className="flex items-center justify-center gap-2 text-[13px] font-semibold text-brand-700 hover:underline">
              <Users className="size-4" /> Open priority queue
            </Link>
          </div>
        </Card>

        {/* Center */}
        <div className="min-w-0 space-y-5">
          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <Avatar name={current.name} size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold text-ink">{current.name}</h2>
                <StatusPill status={current.status} />
              </div>
              <p className="text-sm text-ink-3">
                {current.hid} {current.age ? `· ${current.age} yrs` : ''} {current.gender ? `· ${current.gender === 'F' ? 'Female' : 'Male'}` : ''} · {current.reason}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(mode === 'Physiotherapy' ? ['Post-op Day 42', 'TKR Left'] : mode === 'Nutrition' ? ['BMI 24.2', 'Pre-diabetic'] : ['Hypertension', 'Penicillin Allergy']).map((t) => (
                  <Badge key={t} tone={/allerg/i.test(t) ? 'amber' : 'mint'}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Btn size="sm" variant="secondary" href={`/doctor/patients/${current.id}`} icon={<FileText className="size-4" />}>
                EHR
              </Btn>
              <Btn size="sm" href="/doctor/chat" icon={<Video className="size-4" />}>
                Start Consult
              </Btn>
            </div>
          </Card>

          {mode === 'Nutrition' ? <NutritionCenter /> : <VitalsAndTrend mode={mode} />}
          <Notes mode={mode} name={current.name} />
        </div>

        {/* Right */}
        <div className="space-y-5">{mode === 'Clinical' ? <RxPanel /> : mode === 'Physiotherapy' ? <RehabPanel /> : <DietPanel />}</div>
      </div>
    </div>
  );
}

function VitalsAndTrend({ mode }: { mode: Mode }) {
  const physio = mode === 'Physiotherapy';
  const vitals = physio
    ? [
        { l: 'Heart rate', v: '90', u: 'bpm', i: HeartPulse, c: 'text-rose-500 bg-rose-50' },
        { l: 'SpO₂', v: '98', u: '%', i: Droplets, c: 'text-sky-500 bg-sky-50' },
        { l: 'Temperature', v: '37', u: '°C', i: Thermometer, c: 'text-amber-500 bg-amber-50' },
        { l: 'Knee ROM', v: '132', u: '°', i: Activity, c: 'text-brand-600 bg-brand-50' },
      ]
    : [
        { l: 'Blood Pressure', v: '120/80', u: 'mmHg', i: Activity, c: 'text-violet-500 bg-violet-50' },
        { l: 'Heart Rate', v: '72', u: 'bpm', i: HeartPulse, c: 'text-rose-500 bg-rose-50' },
        { l: 'Temperature', v: '98.6', u: '°F', i: Thermometer, c: 'text-amber-500 bg-amber-50' },
        { l: 'SpO₂', v: '98', u: '%', i: Droplets, c: 'text-sky-500 bg-sky-50' },
      ];
  const mobility = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6'].map((t, i) => ({ t, v: [92, 104, 113, 121, 128, 132][i] }));
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {vitals.map((v) => (
          <Card key={v.l} className="p-4">
            <span className={cn('inline-flex size-8 items-center justify-center rounded-lg', v.c)}>
              <v.i className="size-4" />
            </span>
            <p className="mt-3 text-xs text-ink-3">{v.l}</p>
            <p className="num font-display text-xl font-bold text-ink">
              {v.v} <span className="text-xs font-medium text-ink-3">{v.u}</span>
            </p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title={physio ? 'Mobility Trend' : 'Health Score Trend'} subtitle={physio ? 'Knee flexion range of motion (degrees)' : 'Last 6 months'} />
        <div className="px-3 pb-5 pt-4 sm:px-5">
          <TrendChart data={physio ? mobility : SERIES.score} xKey="t" series={[{ key: 'v', name: physio ? 'ROM' : 'Score' }]} unit={physio ? '°' : undefined} height={220} domain={physio ? [80, 160] : [50, 100]} band={physio ? { from: 130, to: 160 } : undefined} />
        </div>
      </Card>
    </>
  );
}

function Notes({ mode, name }: { mode: Mode; name: string }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const assessments =
    mode === 'Physiotherapy'
      ? [
          { t: 'Quad strength (MMT)', v: '4/5', s: 'Improving' },
          { t: 'Pain score (VAS)', v: '3/10', s: 'Mild' },
        ]
      : mode === 'Nutrition'
        ? [
            { t: 'HbA1c', v: '6.1%', s: 'Pre-diabetic' },
            { t: 'Vitamin D', v: '18 ng/mL', s: 'Low' },
          ]
        : [
            { t: 'Blood Work', v: 'CBC', s: 'Normal' },
            { t: 'Lipid Profile', v: 'LDL 118', s: 'Borderline' },
          ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card className="p-5">
        <h3 className="mb-3 font-display text-[15px] font-bold text-ink">Professional Notes</h3>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter SOAP notes here..." className="min-h-[140px]" />
        <div className="mt-3 flex justify-end">
          <Btn
            size="sm"
            disabled={!note.trim()}
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => {
                setSaving(false);
                setNote('');
                toast.success(`Notes saved to ${name}'s record`);
              }, 600);
            }}
            icon={<Save className="size-3.5" />}
          >
            Save Notes
          </Btn>
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 font-display text-[15px] font-bold text-ink">{mode === 'Clinical' ? 'Recent Diagnostics' : 'Recent Assessments'}</h3>
        <div className="space-y-2.5">
          {assessments.map((a) => (
            <div key={a.t} className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
              <span className="flex items-center gap-2.5">
                <FlaskConical className="size-4 text-brand-600" />
                <span>
                  <span className="block text-sm font-semibold text-ink">{a.t}</span>
                  <span className="block text-xs text-ink-3">{a.v}</span>
                </span>
              </span>
              <Badge tone={/normal|improving|mild/i.test(a.s) ? 'green' : 'amber'}>{a.s}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AISummary({ text }: { text: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-brand-900 to-brand-700 p-5 text-white">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-200">
          <Sparkles className="size-3.5" /> AI Health Summary
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-white/90">{text}</p>
        <p className="mt-3 text-[10px] text-white/50">AI-generated from the patient's record. Verify before acting.</p>
      </div>
    </Card>
  );
}

function RxPanel() {
  const [meds, setMeds] = useState(['Amlodipine 5mg', 'Telmisartan 40mg']);
  return (
    <>
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[15px] font-bold text-ink">Rx & Orders</h3>
          <Pill className="size-4 text-brand-600" />
        </div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Current Active Medications</p>
        <div className="space-y-2">
          {meds.map((m) => (
            <div key={m} className="flex items-center justify-between rounded-xl border border-line-soft px-3.5 py-3">
              <span className="text-sm font-semibold text-ink">{m}</span>
              <button
                onClick={() => {
                  setMeds((x) => x.filter((y) => y !== m));
                  toast(`${m} marked for discontinuation`, { action: { label: 'Undo', onClick: () => setMeds((x) => [...x, m]) } });
                }}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Discontinue
              </button>
            </div>
          ))}
          {!meds.length && <p className="text-sm text-ink-3">No active medications.</p>}
        </div>
        <Btn block className="mt-4" href="/doctor/prescriptions/new" icon={<Plus className="size-4" />}>
          Create Prescription
        </Btn>
      </Card>
      <AISummary text="Patient exhibits controlled Stage 1 Hypertension with a positive response to Amlodipine. Recent lipid profile indicates a slight elevation in LDL; dietary intervention recommended. No new respiratory symptoms reported since last visit." />
    </>
  );
}

function RehabPanel() {
  const [ex, setEx] = useState([
    { n: 'Quad Sets (Isometric)', d: '3 × 15 reps · Daily' },
    { n: 'Heel Slides', d: '3 × 12 reps · Twice daily' },
    { n: 'Straight Leg Raise', d: '3 × 10 reps · Daily' },
  ]);
  return (
    <>
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[15px] font-bold text-ink">Rehab & Orders</h3>
          <Dumbbell className="size-4 text-brand-600" />
        </div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Current Active Exercises</p>
        <div className="space-y-2">
          {ex.map((e) => (
            <div key={e.n} className="rounded-xl border border-line-soft px-3.5 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{e.n}</p>
                <button onClick={() => setEx((x) => x.filter((y) => y.n !== e.n))} className="shrink-0 text-xs font-semibold text-red-600 hover:underline">
                  Discontinue
                </button>
              </div>
              <p className="text-xs text-ink-3">{e.d}</p>
            </div>
          ))}
        </div>
        <Btn block className="mt-4" href="/doctor/prescriptions/new" icon={<Plus className="size-4" />}>
          Create Prescription
        </Btn>
      </Card>
      <AISummary text="Patient demonstrates excellent post-op progress, exceeding the expected 130° ROM at this stage. Given the quad strength deficit (4/5) and mild pain warnings, consider introducing isometric holds at end-range extension rather than increasing dynamic load." />
      <EhrShortcut text="Access complete medical history, diagnostic timeline, lab trends, and discharge summaries." />
    </>
  );
}

function NutritionCenter() {
  const nutrients = [
    { l: 'Protein', v: 82, t: '96 g', c: 'green' as const },
    { l: 'Fiber', v: 48, t: '14 / 30 g', c: 'amber' as const },
    { l: 'Sodium', v: 92, t: '2.2 / 2.3 g', c: 'red' as const },
    { l: 'Hydration', v: 70, t: '2.1 / 3 L', c: 'blue' as const },
    { l: 'Carbs', v: 76, t: '228 g', c: 'green' as const },
    { l: 'Fats', v: 64, t: '58 g', c: 'green' as const },
  ];
  const weight = ['1 Jun', '6 Jun', '11 Jun', '16 Jun', '21 Jun', '26 Jun'].map((t, i) => ({ t, w: [81.4, 80.6, 80.1, 79.3, 78.8, 78.2][i], bmi: [25.2, 24.9, 24.8, 24.5, 24.4, 24.2][i] }));
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ['Avg Caloric Intake', '2,150', 'kcal'],
          ['BMI', '24.2', ''],
          ['Body Fat', '18.5', '%'],
          ['Weight', '78.2', 'kg'],
        ].map(([l, v, u]) => (
          <Card key={l} className="p-4">
            <p className="text-xs text-ink-3">{l}</p>
            <p className="num mt-1 font-display text-xl font-bold text-ink">
              {v} <span className="text-xs font-medium text-ink-3">{u}</span>
            </p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h3 className="mb-4 font-display text-[15px] font-bold text-ink">Daily Nutrient Targets</h3>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {nutrients.map((n) => (
            <div key={n.l}>
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span className="font-medium text-ink-2">{n.l}</span>
                <span className="num text-ink-3">{n.t}</span>
              </div>
              <Progress value={n.v} tone={n.c} height={6} />
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Weight & BMI Trend" subtitle="Last 30 days" />
        <div className="px-3 pb-5 pt-4 sm:px-5">
          <TrendChart type="line" data={weight} xKey="t" series={[{ key: 'w', name: 'Weight (kg)' }, { key: 'bmi', name: 'BMI', color: '#0ea5e9' }]} height={220} />
        </div>
      </Card>
    </>
  );
}

function DietPanel() {
  const [open, setOpen] = useState<string | null>(null);
  const meals = [
    { m: 'Breakfast', f: 'Oatmeal, chia seeds, almond milk, 2 boiled eggs', k: 420 },
    { m: 'Lunch', f: 'Grilled chicken breast / paneer bowl, brown rice, steamed broccoli', k: 610 },
    { m: 'Evening Snack', f: 'Greek yogurt (unsweetened), walnuts & pumpkin seeds', k: 240 },
    { m: 'Dinner', f: 'Clear lentil soup, sautéed spinach, grilled fish / tofu', k: 520 },
  ];
  return (
    <>
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[15px] font-bold text-ink">Nutrition Plans & Orders</h3>
          <Apple className="size-4 text-brand-600" />
        </div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Prescribed Meal Plan</p>
        <div className="space-y-2">
          {meals.map((m) => (
            <button key={m.m} onClick={() => setOpen(open === m.m ? null : m.m)} className="w-full rounded-xl border border-line-soft px-3.5 py-3 text-left transition-colors hover:bg-slate-50">
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{m.m}</span>
                <span className="num text-xs text-ink-3">{m.k} kcal</span>
              </span>
              <span className={cn('block text-xs text-ink-3', open !== m.m && 'line-clamp-1')}>{m.f}</span>
            </button>
          ))}
        </div>
        <Btn block size="sm" className="mt-4" href="/doctor/prescriptions/new?type=nutrition" icon={<Plus className="size-4" />}>
          Update Diet Plan
        </Btn>
      </Card>
      <Card className="p-5">
        <h3 className="mb-4 font-display text-[15px] font-bold text-ink">Macronutrient Split</h3>
        <div className="flex items-center gap-5">
          <Donut size={104} thickness={14} segments={[{ value: 50, color: '#029c6b', label: 'Carbs' }, { value: 25, color: '#0ea5e9', label: 'Protein' }, { value: 25, color: '#f59e0b', label: 'Fats' }]}>
            <span className="num font-display text-lg font-bold text-ink">60%</span>
            <span className="text-[9px] font-bold uppercase text-ink-3">Compliance</span>
          </Donut>
          <ul className="space-y-2 text-[13px]">
            {[
              ['Carbs', '50%', '#029c6b'],
              ['Protein', '25%', '#0ea5e9'],
              ['Fats', '25%', '#f59e0b'],
            ].map(([l, v, c]) => (
              <li key={l} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: c }} /> <span className="text-ink-2">{l}</span> <b className="num ml-auto font-semibold text-ink">{v}</b>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-5 space-y-2 rounded-xl bg-amber-50 p-3.5 text-[13px] text-amber-900">
          <p>
            <b>Caloric Compliance:</b> 60% of days within target.
          </p>
          <p>
            <b>Insight:</b> Fiber intake is consistently low.
          </p>
          <p>
            <b>Recommendation:</b> Add a fruit and a legume serving daily.
          </p>
        </div>
      </Card>
      <EhrShortcut text="Access surgical notes, orthopedic clearance, full lipid panels, and prescription sync." />
    </>
  );
}

function EhrShortcut({ text }: { text: string }) {
  return (
    <Link href="/doctor/patients" className="card flex items-start gap-3 p-5 transition-shadow hover:shadow-lift">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Stethoscope className="size-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">Patient EHR</span>
        <span className="block text-xs leading-relaxed text-ink-3">{text}</span>
      </span>
    </Link>
  );
}

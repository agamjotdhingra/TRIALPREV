import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Copy, Download, Footprints, HeartPulse, Mail, Plus, Share2, Sprout, Trash2, Watch, X } from 'lucide-react';
import { Btn, Checkbox, ChipGroup, Field, Input, Logo, Segmented, Select, Stepper, UnitToggle, inputCls } from '@/components/kit';
import { AuthFrame } from '@/pages/public/AuthFrame';
import { useAuth } from '@/auth/AuthContext';
import { patch, post } from '@/api/client';
import { supabase } from '@/api/supabase';
import { cn } from '@/lib/utils';

const STEPS = ['personal', 'assessment', 'history', 'sync', 'synced', 'done'] as const;
type Step = (typeof STEPS)[number];
const STEP_LABELS = ['Personal Details', 'Health Assessment', 'Health History', 'Sync Your Wearable'];

interface Draft {
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  height: string;
  heightUnit: 'cm' | 'ft';
  weight: string;
  weightUnit: 'kg' | 'lbs';
  email: string;
  conditions: string[];
  medications: { name: string; dose: string }[];
  family: string[];
  smoking: string;
  alcohol: string;
  sleep: number;
  previous: string[];
  chronic: string[];
  surgeries: { name: string; year: string }[];
  vaccinations: Record<string, { on: boolean; date: string }>;
  devices: string[];
}

const EMPTY: Draft = {
  fullName: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  height: '',
  heightUnit: 'cm',
  weight: '',
  weightUnit: 'kg',
  email: '',
  conditions: [],
  medications: [{ name: '', dose: '' }],
  family: [],
  smoking: 'Never',
  alcohol: 'None',
  sleep: 7,
  previous: [],
  chronic: [],
  surgeries: [{ name: '', year: '' }],
  vaccinations: { 'COVID-19 Booster': { on: false, date: '' }, 'Influenza (Flu)': { on: false, date: '' }, 'Tetanus (Tdap)': { on: false, date: '' }, 'Hepatitis B': { on: false, date: '' } },
  devices: [],
};

const KEY = 'prevntiv.onboarding';

function ageFrom(dob: string) {
  if (!dob) return '';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  return String(Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
}

function bmiOf(d: Draft) {
  const h = parseFloat(d.height);
  const w = parseFloat(d.weight);
  if (!h || !w) return null;
  const meters = d.heightUnit === 'cm' ? h / 100 : h * 0.3048;
  const kg = d.weightUnit === 'kg' ? w : w * 0.4536;
  return Math.round((kg / (meters * meters)) * 10) / 10;
}

function bmiLabel(b: number) {
  if (b < 18.5) return 'Underweight';
  if (b < 25) return 'Normal Weight';
  if (b < 30) return 'Overweight';
  return 'Obese';
}

export default function PatientOnboarding() {
  const params = useParams<{ step?: string }>();
  const step: Step = (STEPS as readonly string[]).includes(params.step ?? '') ? (params.step as Step) : 'personal';
  const [, setLocation] = useLocation();
  const [d, setD] = useState<Draft>(() => {
    try {
      return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(KEY) ?? '{}') };
    } catch {
      return EMPTY;
    }
  });
  useEffect(() => {
    sessionStorage.setItem(KEY, JSON.stringify(d));
  }, [d]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const go = (s: Step) => setLocation(`/onboarding/${s}`);
  const idx = STEPS.indexOf(step);

  return (
    <AuthFrame footer={false} right={<span />} className="sm:items-start sm:pt-6">
      <div className="w-full max-w-[680px]">
        {step === 'personal' && <Personal d={d} set={set} next={() => go('assessment')} />}
        {step === 'assessment' && <Assessment d={d} set={set} back={() => go('personal')} next={() => go('history')} />}
        {step === 'history' && <History d={d} set={set} back={() => go('assessment')} next={() => go('sync')} />}
        {step === 'sync' && <Sync d={d} set={set} back={() => go('history')} next={() => go(d.devices.length ? 'synced' : 'done')} />}
        {step === 'synced' && <Synced d={d} next={() => go('done')} />}
        {step === 'done' && <Done d={d} />}
        {idx < 4 && <p className="mt-6 text-center text-xs text-ink-3">Your answers are saved on this device as you go. You can update them later from your profile.</p>}
      </div>
    </AuthFrame>
  );
}

function Shell({ step, title, subtitle, children, footer }: { step: number; title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_24px_60px_-24px_rgb(1_92_61/0.22)] backdrop-blur-xl sm:p-10 animate-fade-up">
      <div className="text-center">
        <Logo size="sm" />
        <h1 className="mt-5 font-display text-[28px] font-bold text-brand-700 sm:text-[32px]">{title}</h1>
        <p className="mt-1.5 text-sm text-ink-2">{subtitle}</p>
      </div>
      <Stepper steps={STEP_LABELS} current={step} className="mx-auto mt-8 max-w-lg" />
      <div className="mt-9">{children}</div>
      <div className="mt-10 flex items-center justify-between gap-3 border-t border-line-soft pt-6">{footer}</div>
    </div>
  );
}

type StepProps = { d: Draft; set: <K extends keyof Draft>(k: K, v: Draft[K]) => void; next: () => void; back?: () => void };

function Personal({ d, set, next }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = () => {
    const e: Record<string, string> = {};
    if (d.fullName.trim().length < 2) e.fullName = 'Please enter your full name.';
    if (!d.dob) e.dob = 'Date of birth is required.';
    else if (new Date(d.dob) > new Date()) e.dob = 'Date of birth cannot be in the future.';
    if (!d.gender) e.gender = 'Select a gender.';
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter a valid email address.';
    setErrors(e);
    if (!Object.keys(e).length) next();
  };
  return (
    <Shell
      step={0}
      title="Personal Details"
      subtitle="Let's start by getting to know you better to tailor your health ecosystem."
      footer={
        <>
          <span />
          <Btn onClick={submit} iconRight={<ArrowRight className="size-4" />}>
            Continue
          </Btn>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" className="sm:col-span-2" error={errors.fullName} required>
          <Input placeholder="John Doe" value={d.fullName} onChange={(e) => set('fullName', e.target.value)} invalid={!!errors.fullName} autoFocus />
        </Field>
        <Field label="Date of Birth" error={errors.dob} required>
          <Input type="date" max={new Date().toISOString().slice(0, 10)} value={d.dob} onChange={(e) => set('dob', e.target.value)} invalid={!!errors.dob} />
        </Field>
        <Field label={<>Age <span className="text-xs font-normal text-ink-3">(Auto-calculated)</span></>}>
          <Input readOnly value={ageFrom(d.dob) || '-'} tabIndex={-1} />
        </Field>
        <Field label="Gender" error={errors.gender} required>
          <Select placeholder="Select Gender" value={d.gender} onChange={(e) => set('gender', e.target.value)} options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} />
        </Field>
        <Field
          label={
            <span className="inline-flex items-center gap-1">
              Blood Group <CircleHelp className="size-3.5 text-ink-4" aria-label="If unsure, leave blank — your doctor or lab can add it later." />
            </span>
          }
        >
          <Select placeholder="Select Type" value={d.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "Don't know"]} />
        </Field>
        <Field label="Height">
          <Input inputMode="decimal" placeholder="0" value={d.height} onChange={(e) => set('height', e.target.value.replace(/[^\d.]/g, ''))} right={<UnitToggle units={['cm', 'ft']} value={d.heightUnit} onChange={(u) => set('heightUnit', u)} />} />
        </Field>
        <Field label="Weight">
          <Input inputMode="decimal" placeholder="0" value={d.weight} onChange={(e) => set('weight', e.target.value.replace(/[^\d.]/g, ''))} right={<UnitToggle units={['kg', 'lbs']} value={d.weightUnit} onChange={(u) => set('weightUnit', u)} />} />
        </Field>
        <Field label={<>Email <span className="font-normal text-ink-3">(Optional)</span></>} className="sm:col-span-2" error={errors.email}>
          <Input type="email" placeholder="hello@example.com" leftIcon={<Mail />} value={d.email} onChange={(e) => set('email', e.target.value)} invalid={!!errors.email} />
        </Field>
      </div>
    </Shell>
  );
}

function Assessment({ d, set, next, back }: StepProps) {
  const bmi = bmiOf(d);
  return (
    <Shell
      step={1}
      title="Health Assessment"
      subtitle="A few quick questions so your care team sees the full picture."
      footer={
        <>
          <Btn variant="ghost" onClick={back} icon={<ArrowLeft className="size-4" />}>
            Back
          </Btn>
          <Btn onClick={next} iconRight={<ArrowRight className="size-4" />}>
            Continue
          </Btn>
        </>
      }
    >
      <div className="flex items-center justify-between rounded-2xl bg-brand-50 px-5 py-4 ring-1 ring-brand-100">
        <div>
          <p className="font-display text-base font-bold text-ink">Calculated BMI</p>
          <p className="text-xs text-ink-3">Based on previous step</p>
        </div>
        <div className="text-right">
          <p className="num font-display text-4xl font-extrabold text-brand-700">{bmi ?? '—'}</p>
          <p className="text-xs font-semibold text-brand-600">{bmi ? bmiLabel(bmi) : 'Add height & weight'}</p>
        </div>
      </div>

      <Section title="Existing Conditions & Allergies">
        <ChipGroup options={['Hypertension', 'Diabetes Type 2', 'Asthma', 'Penicillin Allergy', 'Sulfa Drugs', 'Latex', 'None']} value={d.conditions} onChange={(v) => set('conditions', v)} allowCustom />
      </Section>

      <Section title="Current Medications">
        <div className="space-y-3">
          {d.medications.map((m, i) => (
            <div key={i} className="flex gap-2.5">
              <input className={cn(inputCls, 'flex-[1.4]')} placeholder="Medicine (e.g. Lisinopril)" value={m.name} onChange={(e) => set('medications', d.medications.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              <input className={cn(inputCls, 'flex-1')} placeholder="Dose (e.g. 10mg Daily)" value={m.dose} onChange={(e) => set('medications', d.medications.map((x, j) => (j === i ? { ...x, dose: e.target.value } : x)))} />
              <button type="button" aria-label="Remove medication" onClick={() => set('medications', d.medications.length > 1 ? d.medications.filter((_, j) => j !== i) : [{ name: '', dose: '' }])} className="shrink-0 rounded-xl px-2 text-ink-3 hover:bg-slate-100 hover:text-ink">
                <X className="size-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('medications', [...d.medications, { name: '', dose: '' }])} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline">
            <Plus className="size-4" /> Add another medication
          </button>
        </div>
      </Section>

      <Section title="Family Medical History">
        <ChipGroup options={['Heart Disease', 'Cancer', 'Stroke', 'Diabetes', 'None']} value={d.family} onChange={(v) => set('family', v)} />
      </Section>

      <Section title="Lifestyle & Habits">
        <div className="space-y-5">
          <Field label="Smoking Status">
            <Segmented options={['Never', 'Former', 'Current']} value={d.smoking} onChange={(v) => set('smoking', v)} />
          </Field>
          <Field label="Alcohol Consumption">
            <Segmented options={['None', 'Light', 'Moderate/Heavy']} value={d.alcohol} onChange={(v) => set('alcohol', v)} />
          </Field>
          <Field label="Average Sleep Hours" aside={<span className="num text-sm font-bold text-brand-700">{d.sleep} hrs</span>}>
            <input type="range" min={3} max={12} step={0.5} value={d.sleep} onChange={(e) => set('sleep', Number(e.target.value))} className="mt-2 w-full accent-brand-700" aria-label="Average sleep hours" />
          </Field>
        </div>
      </Section>
    </Shell>
  );
}

function History({ d, set, next, back }: StepProps) {
  const vac = Object.entries(d.vaccinations);
  return (
    <Shell
      step={2}
      title="Health History"
      subtitle="You're almost done mapping your health journey."
      footer={
        <>
          <Btn variant="ghost" onClick={back} icon={<ArrowLeft className="size-4" />}>
            Back
          </Btn>
          <Btn onClick={next} iconRight={<CheckCircle2 className="size-4" />}>
            Finish Setup
          </Btn>
        </>
      }
    >
      <Section title="Previous Conditions" first>
        <ChipGroup options={['Asthma', 'Hypertension', 'Migraines', 'Anemia']} value={d.previous} onChange={(v) => set('previous', v)} allowCustom />
      </Section>
      <Section title="Chronic Diseases">
        <ChipGroup options={['Diabetes Type 1', 'Diabetes Type 2', 'Arthritis', 'Thyroid Disorder']} value={d.chronic} onChange={(v) => set('chronic', v)} allowCustom />
      </Section>
      <Section
        title="Surgeries"
        action={
          <button type="button" onClick={() => set('surgeries', [...d.surgeries, { name: '', year: '' }])} className="text-[13px] font-semibold text-brand-700 hover:underline">
            + Add Surgery
          </button>
        }
      >
        <div className="space-y-2.5">
          {d.surgeries.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2 ring-1 ring-line-soft">
              <input className="h-10 flex-1 rounded-lg bg-transparent px-3 text-sm outline-none placeholder:text-ink-4" placeholder="Procedure Name" value={s.name} onChange={(e) => set('surgeries', d.surgeries.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              <input className="h-10 w-24 rounded-lg border border-line bg-white px-3 text-center text-sm outline-none focus:border-brand-500" placeholder="Year" inputMode="numeric" maxLength={4} value={s.year} onChange={(e) => set('surgeries', d.surgeries.map((x, j) => (j === i ? { ...x, year: e.target.value.replace(/\D/g, '') } : x)))} />
              <button type="button" aria-label="Remove surgery" onClick={() => set('surgeries', d.surgeries.length > 1 ? d.surgeries.filter((_, j) => j !== i) : [{ name: '', year: '' }])} className="rounded-lg p-2 text-ink-4 hover:bg-white hover:text-red-600">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Recent Vaccinations">
        <div className="divide-y divide-line-soft rounded-2xl border border-line-soft bg-white shadow-card">
          {vac.map(([name, v]) => (
            <div key={name} className="flex items-center justify-between gap-3 px-4 py-3">
              <Checkbox checked={v.on} onChange={(on) => set('vaccinations', { ...d.vaccinations, [name]: { ...v, on } })} label={name} />
              {v.on && <input type="month" value={v.date} onChange={(e) => set('vaccinations', { ...d.vaccinations, [name]: { ...v, date: e.target.value } })} className="h-9 rounded-lg border border-line px-2 text-xs text-ink-2 outline-none focus:border-brand-500" aria-label={`${name} date`} />}
            </div>
          ))}
        </div>
      </Section>
    </Shell>
  );
}

const DEVICES = [
  { name: 'Apple Health', desc: 'iPhone & Apple Watch', color: 'from-rose-400 to-pink-500' },
  { name: 'Google Fit', desc: 'Android & Wear OS', color: 'from-sky-400 to-emerald-400' },
  { name: 'Fitbit', desc: 'All Fitbit trackers', color: 'from-teal-400 to-cyan-500' },
  { name: 'Garmin', desc: 'Garmin Connect', color: 'from-slate-600 to-slate-800' },
  { name: 'Oura', desc: 'Oura Ring', color: 'from-zinc-400 to-zinc-600' },
];

function Sync({ d, set, next, back }: StepProps) {
  const [connecting, setConnecting] = useState(false);
  return (
    <Shell
      step={3}
      title="Connect Your Devices"
      subtitle="Sync a wearable so vitals flow into Prevntiv automatically — no manual logging."
      footer={
        <>
          <Btn variant="ghost" onClick={back} icon={<ArrowLeft className="size-4" />}>
            Back
          </Btn>
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => { set('devices', []); next(); }}>
              Skip for now
            </Btn>
            <Btn
              disabled={!d.devices.length}
              loading={connecting}
              onClick={() => {
                setConnecting(true);
                setTimeout(() => {
                  setConnecting(false);
                  next();
                }, 1200);
              }}
              iconRight={<ArrowRight className="size-4" />}
            >
              Connect {d.devices.length ? `(${d.devices.length})` : ''}
            </Btn>
          </div>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {DEVICES.map((dev) => {
          const on = d.devices.includes(dev.name);
          return (
            <button
              key={dev.name}
              type="button"
              onClick={() => set('devices', on ? d.devices.filter((x) => x !== dev.name) : [...d.devices, dev.name])}
              className={cn(
                'flex items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                on ? 'border-brand-400 bg-brand-50 ring-4 ring-brand-100' : 'border-line bg-white hover:border-brand-300 hover:shadow-card',
              )}
            >
              <span className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', dev.color)}>
                <Watch className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{dev.name}</span>
                <span className="block text-xs text-ink-3">{dev.desc}</span>
              </span>
              <span className={cn('inline-flex size-5 items-center justify-center rounded-full border-2', on ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300')}>{on && <CheckCircle2 className="size-4" />}</span>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function Synced({ d, next }: { d: Draft; next: () => void }) {
  const [hr, setHr] = useState(72);
  useEffect(() => {
    const t = setInterval(() => setHr(68 + Math.round(Math.random() * 8)), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-[28px] border border-white bg-white/90 p-8 text-center shadow-[0_24px_60px_-24px_rgb(1_92_61/0.22)] sm:p-12 animate-fade-up">
      <Stepper steps={STEP_LABELS} current={4} className="mx-auto max-w-lg" />
      <span className="mx-auto mt-10 inline-flex size-20 items-center justify-center rounded-full bg-brand-100 text-brand-700 ring-8 ring-brand-50">
        <CheckCircle2 className="size-10" />
      </span>
      <h1 className="mt-6 font-display text-[28px] font-bold text-ink">{d.devices.join(' & ')} connected</h1>
      <p className="mt-2 text-sm text-ink-2">Your vitals are now syncing in real time.</p>
      <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line-soft bg-white p-4 text-left shadow-card">
          <HeartPulse className="size-5 text-rose-500" />
          <p className="mt-3 text-xs text-ink-3">Heart Rate</p>
          <p className="num font-display text-2xl font-bold text-ink">
            {hr} <span className="text-sm font-medium text-ink-3">bpm</span>
          </p>
        </div>
        <div className="rounded-2xl border border-line-soft bg-white p-4 text-left shadow-card">
          <Footprints className="size-5 text-brand-600" />
          <p className="mt-3 text-xs text-ink-3">Steps today</p>
          <p className="num font-display text-2xl font-bold text-ink">6,820</p>
        </div>
      </div>
      <Btn className="mt-9" size="lg" onClick={next} iconRight={<ArrowRight className="size-4" />}>
        Continue
      </Btn>
    </div>
  );
}

function Done({ d }: { d: Draft }) {
  const { session, enterDemo } = useAuth();
  const [, setLocation] = useLocation();
  const [saving, setSaving] = useState(false);
  const id = useMemo(() => `PRV-${String(Math.floor(10000 + Math.random() * 89999))}`, []);
  const name = d.fullName || 'Alex Johnson';

  const [acct, setAcct] = useState({ email: d.email, mobile: '', password: '' });
  const [acctErr, setAcctErr] = useState('');
  const csv = (a: string[]) => a.filter(Boolean).join(', ') || undefined;

  async function finish() {
    setAcctErr('');
    if (session) {
      setSaving(true);
      try {
        await patch('/patients/me', {
          full_name: d.fullName || undefined,
          date_of_birth: d.dob || undefined,
          gender: d.gender || undefined,
          blood_group: d.bloodGroup || undefined,
          height: d.height ? Number(d.height) : undefined,
          weight: d.weight ? Number(d.weight) : undefined,
          smoking_status: d.smoking,
          alcohol_consumption: d.alcohol,
          existing_diseases: csv(d.conditions),
          chronic_diseases: csv(d.chronic),
          family_medical_history: csv(d.family),
        });
      } catch {
        toast.error('We could not save your health details yet. You can finish them from your profile.');
      } finally {
        setSaving(false);
      }
    } else {
      // No session yet (e.g. SMS sign-in unavailable): create the account with email + password.
      if (!/^\S+@\S+\.\S+$/.test(acct.email)) return setAcctErr('Enter a valid email address.');
      if (acct.mobile.replace(/\D/g, '').length < 10) return setAcctErr('Enter a valid 10-digit mobile number.');
      if (acct.password.length < 8) return setAcctErr('Password must be at least 8 characters.');
      setSaving(true);
      try {
        await post('/auth/register/patient', {
          email: acct.email,
          password: acct.password,
          fullName: d.fullName || 'Prevntiv Member',
          mobile: acct.mobile.replace(/\D/g, ''),
          dateOfBirth: d.dob,
          gender: d.gender,
          bloodGroup: d.bloodGroup || 'Unknown',
          height: d.height ? Number(d.height) : undefined,
          weight: d.weight ? Number(d.weight) : undefined,
          existingDiseases: csv(d.conditions),
          currentMedications: csv(d.medications.map((m) => [m.name, m.dose].filter(Boolean).join(' '))),
          familyMedicalHistory: csv(d.family),
          smokingStatus: d.smoking,
          alcoholConsumption: d.alcohol,
          previousConditions: csv(d.previous),
          chronicDiseases: csv(d.chronic),
          surgeries: csv(d.surgeries.map((x) => [x.name, x.year].filter(Boolean).join(' '))),
          vaccinations: csv(Object.entries(d.vaccinations).filter(([, v]) => v.on).map(([k, v]) => `${k}${v.date ? ` (${v.date})` : ''}`)),
        });
        const { error } = await supabase.auth.signInWithPassword({ email: acct.email, password: acct.password });
        if (error) throw error;
      } catch (e: any) {
        setSaving(false);
        return setAcctErr(e?.message === 'DEMO_MODE' ? 'Exit the demo to create a real account.' : e?.message || 'Could not create your account.');
      }
      setSaving(false);
    }
    sessionStorage.removeItem(KEY);
    setLocation(session ? '/patient/dashboard' : '/');
  }

  function exploreDemo() {
    enterDemo('patient');
    sessionStorage.removeItem(KEY);
    setLocation('/patient/dashboard');
  }

  function saveId() {
    const svg = document.getElementById('prevntiv-qr');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${id}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function share() {
    const text = `My Prevntiv ID: ${id}`;
    if (navigator.share) await navigator.share({ title: 'Prevntiv ID', text }).catch(() => {});
    else {
      await navigator.clipboard.writeText(text);
      toast.success('ID copied to clipboard');
    }
  }

  return (
    <div className="mx-auto max-w-md text-center animate-fade-up">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <Sprout className="size-6" />
      </span>
      <h1 className="mt-4 font-display text-[32px] font-bold text-ink">You're all set!</h1>
      <p className="mt-1 text-sm text-ink-2">Your Patient ID is ready to use.</p>
      <div className="mt-8 rounded-[24px] border border-white bg-white p-6 shadow-[0_24px_60px_-24px_rgb(1_92_61/0.25)]">
        <div className="mx-auto inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 font-display text-2xl font-bold text-brand-800 ring-4 ring-white shadow-card">
          {name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
        </div>
        <p className="mt-3 text-lg font-semibold text-ink">{name}</p>
        <div className="mt-5 border-t border-line-soft pt-5">
          <div className="flex items-center justify-between rounded-xl bg-slate-100/80 px-4 py-3 text-left">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Patient ID</p>
              <p className="font-mono text-lg font-bold tracking-wider text-brand-700">{id}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(id);
                toast.success('Patient ID copied');
              }}
              className="rounded-lg p-2 text-brand-700 hover:bg-white"
              aria-label="Copy ID"
            >
              <Copy className="size-4" />
            </button>
          </div>
          <div className="mx-auto mt-5 inline-flex rounded-2xl border border-line-soft bg-white p-4 shadow-card">
            <QRCodeSVG id="prevntiv-qr" value={`prevntiv://patient/${id}`} size={132} fgColor="#014d33" level="M" />
          </div>
          <p className="mx-auto mt-3 max-w-[220px] text-xs text-ink-3">Show this QR code to any professional within the Prevntiv ecosystem.</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Btn variant="outline" shape="rounded" onClick={saveId} icon={<Download className="size-4" />}>
          Save ID
        </Btn>
        <Btn variant="outline" shape="rounded" onClick={share} icon={<Share2 className="size-4" />}>
          Share
        </Btn>
      </div>
      {!session && (
        <div className="mt-6 rounded-2xl border border-line-soft bg-white p-5 text-left shadow-card">
          <p className="font-display text-[15px] font-bold text-ink">Secure your account</p>
          <p className="mt-0.5 text-xs text-ink-3">Set a password so you can sign in from any device.</p>
          <div className="mt-4 space-y-3">
            <Input type="email" placeholder="Email address" value={acct.email} onChange={(e) => setAcct({ ...acct, email: e.target.value })} aria-label="Email" />
            <Input inputMode="tel" placeholder="Mobile number" value={acct.mobile} onChange={(e) => setAcct({ ...acct, mobile: e.target.value })} aria-label="Mobile number" />
            <Input type="password" placeholder="Password (min. 8 characters)" value={acct.password} onChange={(e) => setAcct({ ...acct, password: e.target.value })} aria-label="Password" autoComplete="new-password" />
          </div>
          {acctErr && <p className="mt-3 text-xs font-medium text-red-600">{acctErr}</p>}
        </div>
      )}
      <Btn block size="lg" shape="rounded" className="mt-6" loading={saving} onClick={finish} iconRight={<ArrowRight className="size-4" />}>
        {session ? 'Go to My Dashboard' : 'Create Account & Go to Dashboard'}
      </Btn>
      {!session && (
        <button onClick={exploreDemo} className="mt-4 text-[13px] font-semibold text-brand-700 hover:underline">
          Skip — explore with sample data
        </button>
      )}
    </div>
  );
}

function Section({ title, children, action, first }: { title: string; children: React.ReactNode; action?: React.ReactNode; first?: boolean }) {
  return (
    <section className={cn(!first && 'mt-8')}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { BadgeCheck, Copy, Lock, Mail, Save } from 'lucide-react';
import { useGetPatientMe, useUpdatePatientMe } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, CapsuleTabs, Card, Field, Input, Page, PageHeader, ScoreRing, Segmented, Select, Skeleton, Textarea } from '@/components/kit';
import { ME } from '@/data/demo';

type Tab = 'Personal' | 'Vitals & Lifestyle' | 'Medical History';

const FIELDS = ['full_name', 'mobile', 'date_of_birth', 'gender', 'blood_group', 'height', 'weight', 'smoking_status', 'alcohol_consumption', 'existing_diseases', 'allergies', 'current_medications', 'chronic_diseases', 'family_medical_history', 'surgeries', 'vaccinations'] as const;
type Form = Record<(typeof FIELDS)[number], string>;

const DEMO_FORM: Form = {
  full_name: ME.name,
  mobile: ME.mobile,
  date_of_birth: ME.dob,
  gender: ME.gender,
  blood_group: ME.bloodGroup,
  height: String(ME.height),
  weight: String(ME.weight),
  smoking_status: ME.smoking,
  alcohol_consumption: ME.alcohol,
  existing_diseases: ME.conditions.join(', '),
  allergies: ME.allergies.join(', '),
  current_medications: ME.medications.map((m) => `${m.name} ${m.dose}`).join(', '),
  chronic_diseases: '',
  family_medical_history: ME.family.join(', '),
  surgeries: 'Appendectomy (2015)',
  vaccinations: 'COVID-19 Booster (Oct 2023), Influenza (Nov 2023)',
};

export default function PatientProfile() {
  const { isDemo, user } = useAuth();
  const me = useGetPatientMe();
  const update = useUpdatePatientMe();
  const [tab, setTab] = useState<Tab>('Personal');
  const [form, setForm] = useState<Form>(DEMO_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const p = isDemo ? null : me.data;

  useEffect(() => {
    if (p) setForm(Object.fromEntries(FIELDS.map((k) => [k, Array.isArray(p[k]) ? p[k].join(', ') : p[k] == null ? '' : String(p[k])])) as Form);
  }, [p]);

  const up = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const h = parseFloat(form.height);
  const w = parseFloat(form.weight);
  const bmi = h && w ? (w / Math.pow(h / 100, 2)).toFixed(1) : '—';
  const healthId = p?.health_id ?? 'H-9921-X3';
  const score = p?.health_score ?? ME.score;
  const risk = p?.risk_level ?? 'Low';

  async function save() {
    const e: Record<string, string> = {};
    if (form.full_name.trim().length < 2) e.full_name = 'Name is required.';
    if (form.mobile.replace(/\D/g, '').length < 10) e.mobile = 'Enter a valid 10-digit mobile number.';
    if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required.';
    setErrors(e);
    if (Object.keys(e).length) {
      setTab('Personal');
      return;
    }
    if (isDemo) return toast.success('Profile saved');
    try {
      await update.mutateAsync({ ...form, height: h || null, weight: w || null });
      toast.success('Profile updated — your health score has been recalculated');
    } catch (err: any) {
      toast.error(err.message ?? 'Could not save profile');
    }
  }

  if (!isDemo && me.isLoading) {
    return (
      <Page>
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <Skeleton className="h-[520px] rounded-2xl" />
          <Skeleton className="h-[520px] rounded-2xl" />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-6">
          <Card className="p-6 text-center">
            <Avatar name={form.full_name} size={88} ring className="mx-auto" />
            <h2 className="mt-4 font-display text-xl font-bold text-ink">{form.full_name || 'Your name'}</h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(healthId);
                toast.success('Health ID copied');
              }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-ink-2 hover:bg-brand-50 hover:text-brand-800"
            >
              <BadgeCheck className="size-3.5 text-brand-600" /> {healthId} <Copy className="size-3" />
            </button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-ink-3">
              <Mail className="size-3.5" /> {user?.email ?? ME.email}
            </p>
            <div className="mt-3">
              <Badge tone={/low/i.test(risk) ? 'green' : /moderate/i.test(risk) ? 'amber' : 'red'} dot>
                {/risk/i.test(risk) ? risk : `${risk} Risk`}
              </Badge>
            </div>
            <div className="mt-6 flex items-center justify-around border-t border-line-soft pt-6">
              <ScoreRing score={score} size={110} thickness={10} />
              <div className="rounded-2xl border border-line-soft p-2">
                <QRCodeSVG value={`prevntiv://patient/${healthId}`} size={84} fgColor="#014d33" />
              </div>
            </div>
          </Card>
          <Card className="flex gap-3 p-5">
            <Lock className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-ink">End-to-End Encrypted</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-3">Your personal health information is encrypted and HIPAA-compliant. Prevntiv never shares your data without your explicit consent.</p>
            </div>
          </Card>
        </aside>

        <Card className="p-6 sm:p-8">
          <PageHeader className="mb-6!" title="Update Profile" subtitle="Manage your personal information and health records." />
          <CapsuleTabs tabs={['Personal', 'Vitals & Lifestyle', 'Medical History'] as Tab[]} value={tab} onChange={setTab} />
          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            {tab === 'Personal' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" required error={errors.full_name}>
                  <Input value={form.full_name} onChange={(e) => up('full_name', e.target.value)} invalid={!!errors.full_name} />
                </Field>
                <Field label="Mobile Number" required error={errors.mobile}>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-line bg-slate-50 px-3 text-sm font-semibold text-ink-2">+91</span>
                    <Input className="rounded-l-none" inputMode="tel" value={form.mobile} onChange={(e) => up('mobile', e.target.value)} invalid={!!errors.mobile} />
                  </div>
                </Field>
                <Field label="Date of Birth" required error={errors.date_of_birth}>
                  <Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.date_of_birth?.slice(0, 10)} onChange={(e) => up('date_of_birth', e.target.value)} />
                </Field>
                <Field label="Gender" required>
                  <Select value={form.gender} onChange={(e) => up('gender', e.target.value)} options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} />
                </Field>
                <Field label="Blood Group">
                  <Select placeholder="Select" value={form.blood_group} onChange={(e) => up('blood_group', e.target.value)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
                </Field>
                <Field label="BMI" hint="Calculated from height & weight">
                  <Input readOnly value={bmi} />
                </Field>
              </div>
            )}
            {tab === 'Vitals & Lifestyle' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Height (cm)">
                  <Input inputMode="decimal" value={form.height} onChange={(e) => up('height', e.target.value.replace(/[^\d.]/g, ''))} />
                </Field>
                <Field label="Weight (kg)">
                  <Input inputMode="decimal" value={form.weight} onChange={(e) => up('weight', e.target.value.replace(/[^\d.]/g, ''))} />
                </Field>
                <Field label="Smoking Status" className="sm:col-span-2">
                  <Segmented options={['Never', 'Former', 'Current']} value={form.smoking_status || 'Never'} onChange={(v) => up('smoking_status', v)} />
                </Field>
                <Field label="Alcohol Consumption" className="sm:col-span-2">
                  <Segmented options={['None', 'Light', 'Moderate/Heavy']} value={form.alcohol_consumption || 'None'} onChange={(v) => up('alcohol_consumption', v)} />
                </Field>
              </div>
            )}
            {tab === 'Medical History' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {(
                  [
                    ['existing_diseases', 'Existing Conditions'],
                    ['allergies', 'Allergies'],
                    ['current_medications', 'Current Medications'],
                    ['chronic_diseases', 'Chronic Diseases'],
                    ['family_medical_history', 'Family Medical History'],
                    ['surgeries', 'Surgeries'],
                  ] as const
                ).map(([k, l]) => (
                  <Field key={k} label={l} hint="Separate items with commas">
                    <Textarea className="min-h-[84px]" value={form[k]} onChange={(e) => up(k, e.target.value)} />
                  </Field>
                ))}
                <Field label="Vaccinations" className="sm:col-span-2">
                  <Textarea className="min-h-[72px]" value={form.vaccinations} onChange={(e) => up('vaccinations', e.target.value)} />
                </Field>
              </div>
            )}
            <div className="mt-8 flex justify-end border-t border-line-soft pt-6">
              <Btn type="submit" loading={update.isPending} icon={<Save className="size-4" />}>
                Save Changes
              </Btn>
            </div>
          </form>
        </Card>
      </div>
    </Page>
  );
}

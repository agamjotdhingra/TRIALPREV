import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Award, BadgeCheck, Briefcase, Lock, Plus, Save, Trash2, Users } from 'lucide-react';
import { useGetDoctorMe, useUpdateDoctorMe } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, Card, Field, Input, Page, PageHeader, Select, Skeleton, Textarea, inputCls } from '@/components/kit';
import { DOCTOR } from '@/data/demo';
import { cn } from '@/lib/utils';

export default function DoctorProfile() {
  const { isDemo } = useAuth();
  const q = useGetDoctorMe();
  const update = useUpdateDoctorMe();
  const d = isDemo ? null : q.data;
  const [form, setForm] = useState({ name: DOCTOR.name, qualification: DOCTOR.qualification, specialization: DOCTOR.specialization, license: DOCTOR.license, fee: String(DOCTOR.fee), mobile: DOCTOR.mobile, email: DOCTOR.email, bio: DOCTOR.bio, years: String(DOCTOR.years), title: DOCTOR.title });
  const [exp, setExp] = useState(DOCTOR.experience);

  useEffect(() => {
    if (d)
      setForm({
        name: d.full_name ?? '',
        qualification: d.qualification ?? '',
        specialization: d.specialization ?? '',
        license: d.license_number ?? '',
        fee: d.consultation_fees != null ? String(d.consultation_fees) : '',
        mobile: d.mobile ?? '',
        email: d.email ?? '',
        bio: d.bio ?? '',
        years: d.years_of_experience != null ? String(d.years_of_experience) : '',
        title: d.specialization ? `${d.specialization} Specialist` : 'Doctor',
      });
  }, [d]);

  const up = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const locked = !isDemo; // identity fields are managed by platform verification

  async function save() {
    if (!form.license.trim()) return toast.error('License number is required.');
    if (form.fee && Number.isNaN(Number(form.fee.replace(/,/g, '')))) return toast.error('Consultation fee must be a number.');
    try {
      if (!isDemo) await update.mutateAsync({ bio: form.bio, license_number: form.license, consultation_fees: form.fee ? Number(form.fee.replace(/,/g, '')) : null });
      toast.success('Profile saved');
    } catch (e: any) {
      toast.error(e.message ?? 'Could not save');
    }
  }

  if (!isDemo && q.isLoading)
    return (
      <Page>
        <Skeleton className="h-[600px] rounded-2xl" />
      </Page>
    );

  return (
    <Page>
      <PageHeader title="Doctor Profile" subtitle="How patients and care teams see you across Prevntiv." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden text-center">
            <div className="h-20 btn-gradient" />
            <div className="-mt-11 px-6 pb-6">
              <Avatar name={form.name} size={88} ring className="mx-auto" />
              <h2 className="mt-3 flex items-center justify-center gap-1.5 font-display text-xl font-bold text-ink">
                {form.name} <BadgeCheck className="size-5 text-brand-500" />
              </h2>
              <p className="text-sm text-ink-3">{form.title}</p>
              <Badge tone="mint" className="mt-3">
                {form.years || '—'}+ Years Experience
              </Badge>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 py-3">
                  <p className="num font-display text-xl font-bold text-ink">{DOCTOR.patients}</p>
                  <p className="text-[11px] font-medium text-ink-3">Total Patients</p>
                </div>
                <div className="rounded-xl bg-slate-50 py-3">
                  <p className="num font-display text-xl font-bold text-ink">{DOCTOR.consultations}</p>
                  <p className="text-[11px] font-medium text-ink-3">Consultations</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="flex gap-3 p-5 text-xs leading-relaxed text-ink-3">
            <Lock className="mt-0.5 size-4 shrink-0 text-brand-600" />
            Your personal and professional information is securely encrypted. Name, qualification and specialization are verified by Prevntiv — contact support to change them.
          </Card>
        </aside>

        <Card className="p-6 sm:p-8">
          <Section title="Personal Details" icon={<Users className="size-4" />}>
            <Field label="Full Name">
              <Input value={form.name} readOnly={locked} onChange={(e) => up('name', e.target.value)} />
            </Field>
            <Field label="Qualification/Degree">
              <Input value={form.qualification} readOnly={locked} onChange={(e) => up('qualification', e.target.value)} />
            </Field>
          </Section>

          <Section title="Professional Details" icon={<Award className="size-4" />}>
            <Field label="Specialization">
              <Select disabled={locked} value={form.specialization} onChange={(e) => up('specialization', e.target.value)} options={Array.from(new Set([form.specialization, 'Cardiology', 'General Practice', 'Dermatology', 'Endocrinology', 'Neurology', 'Pediatrics', 'Physiotherapy', 'Clinical Nutrition'].filter(Boolean)))} />
            </Field>
            <Field label="License Number" required>
              <Input value={form.license} onChange={(e) => up('license', e.target.value.toUpperCase())} />
            </Field>
            <Field label="Consultation Fees (INR)" hint="In-Person Visit">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-3">₹</span>
                <Input className="pl-8" inputMode="numeric" value={form.fee} onChange={(e) => up('fee', e.target.value.replace(/[^\d,]/g, ''))} />
              </div>
            </Field>
          </Section>

          <div className="mb-9">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <span className="text-brand-600"><Briefcase className="size-4" /></span> Experience
              </h3>
              <button type="button" onClick={() => setExp([...exp, { role: '', institution: '', start: '', end: '' }])} className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline">
                <Plus className="size-4" /> Add Experience
              </button>
            </div>
            <div className="space-y-3">
              {exp.map((x, i) => (
                <div key={i} className="grid gap-2.5 rounded-2xl border border-line-soft bg-slate-50/50 p-4 sm:grid-cols-[1.3fr_1.3fr_90px_90px_auto]">
                  {(['role', 'institution', 'start', 'end'] as const).map((k) => (
                    <input key={k} aria-label={k} className={cn(inputCls, 'bg-white')} placeholder={{ role: 'Role/Title', institution: 'Institution', start: 'Start Year', end: 'End Year' }[k]} value={x[k]} onChange={(e) => setExp(exp.map((y, j) => (j === i ? { ...y, [k]: e.target.value } : y)))} />
                  ))}
                  <button type="button" onClick={() => setExp(exp.filter((_, j) => j !== i))} className="justify-self-end rounded-lg p-2.5 text-ink-4 hover:bg-red-50 hover:text-red-600" aria-label="Remove experience">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Section title="Contact Information" icon={<Users className="size-4" />}>
            <Field label="Mobile Number">
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-line bg-slate-50 px-3 text-sm font-semibold text-ink-2">+91</span>
                <Input className="rounded-l-none" readOnly={locked} value={form.mobile} onChange={(e) => up('mobile', e.target.value)} />
              </div>
            </Field>
            <Field label="Email Address">
              <Input type="email" readOnly={locked} value={form.email} onChange={(e) => up('email', e.target.value)} />
            </Field>
          </Section>

          <Field label="Professional Biography" hint={`${form.bio.length}/600`}>
            <Textarea maxLength={600} className="min-h-[140px]" value={form.bio} onChange={(e) => up('bio', e.target.value)} />
          </Field>

          <div className="mt-8 flex justify-end border-t border-line-soft pt-6">
            <Btn loading={update.isPending} onClick={save} icon={<Save className="size-4" />}>
              Save Changes
            </Btn>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink">
        <span className="text-brand-600">{icon}</span> {title}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

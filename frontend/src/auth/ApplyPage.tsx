import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileCheck2, Hourglass, Mail, ShieldCheck, X } from 'lucide-react';
import { post } from '@/api/client';
import { Badge, Btn, Callout, Field, Input, Select, Stepper, UploadZone } from '@/components/kit';
import { AuthFrame } from '@/pages/public/AuthFrame';
import { cn } from '@/lib/utils';

type Kind = 'professional' | 'hospital' | 'lab';

const DOCS: Record<Kind, string[]> = {
  professional: ['Registration Certificate', 'Medical Degree / Government ID'],
  hospital: ['Healthcare Facility License', 'NABH/JCI Accreditation', 'Authorized Signatory Proof'],
  lab: ['Healthcare Facility License', 'GST Registration ID', 'Authorized Signatory Proof'],
};

const SPECIALIZATIONS = ['Cardiology', 'General Practice', 'Dermatology', 'Endocrinology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Pulmonology', 'Gynecology', 'Psychiatry', 'Physiotherapy', 'Clinical Nutrition', 'Internal Medicine', 'Oncology'];

export default function ApplyPage() {
  const params = useParams<{ kind?: string }>();
  const kind: Kind = params.kind === 'hospital' || params.kind === 'lab' ? params.kind : 'professional';
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({ practice: 'Doctor' });
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const up = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const isFacility = kind !== 'professional';
  const facilityLabel = kind === 'hospital' ? 'Hospital' : 'Lab';
  const steps = isFacility ? [`${facilityLabel} Details`, 'Verification', 'Under Review'] : ['Your Details', 'Credentials', 'Under Review'];

  function validateDetails() {
    const e: Record<string, string> = {};
    const req = (k: string, msg: string) => !form[k]?.trim() && (e[k] = msg);
    if (isFacility) {
      req('orgName', 'Enter the official registered name.');
      req('registrationNumber', 'Registration number is required.');
      req('category', 'Select a category.');
      req('address', 'Enter the primary address.');
      req('city', 'Required');
      req('state', 'Required');
      req('fullName', 'Enter the contact person.');
    } else {
      req('fullName', 'Enter your full name as per records.');
      req('qualification', 'Select your highest qualification.');
      req('specialization', 'Select a specialization.');
      if (form.years === undefined || form.years === '') e.years = 'Required';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email ?? '')) e.email = 'Enter a valid email address.';
    if ((form.mobile ?? '').replace(/\D/g, '').length < 10) e.mobile = 'Enter a valid 10-digit number.';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit() {
    const e: Record<string, string> = {};
    if (!isFacility && !form.licenseNumber?.trim()) e.licenseNumber = 'License number is required.';
    DOCS[kind].forEach((d) => !files[d] && (e[d] = 'Please upload this document.'));
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitError('');
    setLoading(true);
    const base = { fullName: form.fullName, email: form.email, mobile: form.mobile.replace(/\D/g, '') };
    const address = [form.address, form.city, form.state].filter(Boolean).join(', ');
    const body =
      kind === 'professional'
        ? { role: 'doctor', ...base, specialization: form.specialization, qualification: form.qualification, yearsOfExperience: parseInt(form.years) || 0, licenseNumber: form.licenseNumber, bio: `${form.practice}` }
        : kind === 'lab'
          ? { role: 'lab_admin', ...base, labName: form.orgName, registrationNumber: form.registrationNumber, address }
          : { role: 'hospital_admin', ...base, hospitalName: form.orgName, registrationNumber: form.registrationNumber, address, totalBeds: form.beds ? parseInt(form.beds) : undefined };
    try {
      await post('/auth/apply', body);
      setStep(2);
    } catch (err: any) {
      setSubmitError(err.message === 'DEMO_MODE' ? 'Exit the demo to submit a real application.' : err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame back={step === 0 ? { href: `/auth/login?role=${kind === 'professional' ? 'doctor' : kind}`, label: 'Back to login' } : undefined} right={step > 0 ? <span /> : undefined}>
      <div className="w-full max-w-[720px] rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_24px_60px_-24px_rgb(1_92_61/0.22)] backdrop-blur-xl sm:p-10 animate-fade-up">
        <Stepper steps={steps} current={step} className="mx-auto max-w-md" />

        {step === 0 && (
          <form
            className="mt-10"
            onSubmit={(e) => {
              e.preventDefault();
              if (validateDetails()) setStep(1);
            }}
          >
            <h1 className="font-display text-[26px] font-bold text-ink">{isFacility ? `${facilityLabel} Details` : 'Professional Sign Up'}</h1>
            <p className="mt-1.5 text-sm text-ink-3">{isFacility ? 'Please provide the primary information for your healthcare facility.' : 'Join the Prevntiv care network. Applications are verified within 24–48 hours.'}</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {isFacility ? (
                <>
                  <Field label={kind === 'hospital' ? 'Hospital/Organisation Name' : 'Organisation Name'} className="sm:col-span-2" error={errors.orgName} required>
                    <Input placeholder="Enter official registered name" value={form.orgName ?? ''} onChange={(e) => up('orgName', e.target.value)} invalid={!!errors.orgName} />
                  </Field>
                  <Field label="Registration Number" error={errors.registrationNumber} required>
                    <Input placeholder="e.g. REG-12345678" value={form.registrationNumber ?? ''} onChange={(e) => up('registrationNumber', e.target.value.toUpperCase())} invalid={!!errors.registrationNumber} />
                  </Field>
                  <Field label="Category" error={errors.category} required>
                    <Select
                      placeholder="Select category"
                      value={form.category ?? ''}
                      onChange={(e) => up('category', e.target.value)}
                      options={kind === 'hospital' ? ['Multi-speciality Hospital', 'Super-speciality Hospital', 'Clinic / Nursing Home', 'Government Hospital', 'Maternity Centre'] : ['Pathology Lab', 'Diagnostic Imaging Centre', 'Collection Centre', 'Reference Laboratory']}
                    />
                  </Field>
                  <Field label="Primary Address" className="sm:col-span-2" error={errors.address} required>
                    <Input placeholder="Street address" value={form.address ?? ''} onChange={(e) => up('address', e.target.value)} invalid={!!errors.address} />
                  </Field>
                  <Field label="City" error={errors.city} required>
                    <Input placeholder="City" value={form.city ?? ''} onChange={(e) => up('city', e.target.value)} invalid={!!errors.city} />
                  </Field>
                  <Field label="State/Province" error={errors.state} required>
                    <Input placeholder="State or Province" value={form.state ?? ''} onChange={(e) => up('state', e.target.value)} invalid={!!errors.state} />
                  </Field>
                  <Field label="Contact Person" error={errors.fullName} required>
                    <Input placeholder="Full name" value={form.fullName ?? ''} onChange={(e) => up('fullName', e.target.value)} invalid={!!errors.fullName} />
                  </Field>
                  <Field label="Phone Number" error={errors.mobile} required>
                    <Input inputMode="tel" placeholder="+91 98765 43210" value={form.mobile ?? ''} onChange={(e) => up('mobile', e.target.value)} invalid={!!errors.mobile} />
                  </Field>
                  <Field label="Official Email" error={errors.email} required className={kind === 'hospital' ? '' : 'sm:col-span-2'}>
                    <Input type="email" placeholder="admin@facility.in" value={form.email ?? ''} onChange={(e) => up('email', e.target.value)} invalid={!!errors.email} />
                  </Field>
                  {kind === 'hospital' && (
                    <Field label="Total Beds">
                      <Input inputMode="numeric" placeholder="e.g. 250" value={form.beds ?? ''} onChange={(e) => up('beds', e.target.value.replace(/\D/g, ''))} />
                    </Field>
                  )}
                </>
              ) : (
                <>
                  <Field label="I practise as" className="sm:col-span-2">
                    <div className="grid grid-cols-3 gap-2">
                      {['Doctor', 'Physiotherapist', 'Nutritionist'].map((p) => (
                        <button key={p} type="button" onClick={() => up('practice', p)} className={cn('h-11 rounded-xl border text-sm font-semibold transition-all', form.practice === p ? 'border-brand-500 bg-brand-50 text-brand-800 ring-4 ring-brand-100' : 'border-line bg-white text-ink-2 hover:border-brand-300')}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Full Name (as per records)" className="sm:col-span-2" error={errors.fullName} required>
                    <Input placeholder="Dr. Jane Doe" value={form.fullName ?? ''} onChange={(e) => up('fullName', e.target.value)} invalid={!!errors.fullName} />
                  </Field>
                  <Field label="Professional Email" error={errors.email} required>
                    <Input type="email" placeholder="jane.doe@clinic.com" value={form.email ?? ''} onChange={(e) => up('email', e.target.value)} invalid={!!errors.email} />
                  </Field>
                  <Field label="Mobile Number" error={errors.mobile} required>
                    <Input inputMode="tel" placeholder="+91 98765 43210" value={form.mobile ?? ''} onChange={(e) => up('mobile', e.target.value)} invalid={!!errors.mobile} />
                  </Field>
                  <Field label="Highest Qualification" error={errors.qualification} required>
                    <Select placeholder="Select qualification" value={form.qualification ?? ''} onChange={(e) => up('qualification', e.target.value)} options={['MBBS', 'MBBS, MD', 'MBBS, MS', 'MBBS, DM / MCh', 'BDS / MDS', 'BPT / MPT', 'M.Sc Clinical Nutrition', 'BAMS / BHMS']} />
                  </Field>
                  <Field label="Years of Experience" error={errors.years} required>
                    <Input inputMode="numeric" placeholder="e.g. 8" value={form.years ?? ''} onChange={(e) => up('years', e.target.value.replace(/\D/g, '').slice(0, 2))} invalid={!!errors.years} />
                  </Field>
                  <Field label="Specialization" className="sm:col-span-2" error={errors.specialization} required>
                    <Input list="specializations" placeholder="Search specialization..." value={form.specialization ?? ''} onChange={(e) => up('specialization', e.target.value)} invalid={!!errors.specialization} />
                    <datalist id="specializations">
                      {SPECIALIZATIONS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </Field>
                </>
              )}
            </div>
            <div className="mt-10 flex justify-end border-t border-line-soft pt-6">
              <Btn type="submit" iconRight={<ArrowRight className="size-4" />}>
                Continue
              </Btn>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="mt-10">
            <button onClick={() => setStep(0)} className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-brand-700">
              <ArrowLeft className="size-4" /> Back to step 1
            </button>
            <h1 className="font-display text-[26px] font-bold text-ink">{isFacility ? 'Document Verification' : 'Upload Credentials'}</h1>
            <p className="mt-1.5 text-sm text-ink-3">
              {isFacility
                ? 'Please provide the necessary documentation to verify your facility. Files should be in PDF or JPEG format, max 5MB each.'
                : 'Please provide your medical license number and upload the required documentation to verify your professional status.'}
            </p>
            {!isFacility && (
              <Field label={<span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3">Medical license number</span>} className="mt-8" error={errors.licenseNumber} required>
                <Input placeholder="e.g. MD-12345678" value={form.licenseNumber ?? ''} onChange={(e) => up('licenseNumber', e.target.value.toUpperCase())} invalid={!!errors.licenseNumber} />
              </Field>
            )}
            <div className={cn('mt-6 grid gap-4', DOCS[kind].length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
              {DOCS[kind].map((doc) => (
                <div key={doc}>
                  <p className="mb-2 text-[13px] font-semibold text-ink-2">{doc}</p>
                  {files[doc] ? (
                    <div className="flex h-[148px] flex-col items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center">
                      <FileCheck2 className="size-7 text-brand-600" />
                      <p className="w-full truncate text-xs font-semibold text-ink">{files[doc]!.name}</p>
                      <button onClick={() => setFiles((f) => ({ ...f, [doc]: undefined }))} className="inline-flex items-center gap-1 text-xs font-medium text-ink-3 hover:text-red-600">
                        <X className="size-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <UploadZone
                      compact
                      accept=".pdf,.jpg,.jpeg,.png"
                      title="Upload or drop file"
                      hint="PDF or JPEG, max 5MB"
                      onFiles={([f]) => {
                        if (f.size > 5 * 1024 * 1024) return setErrors((e) => ({ ...e, [doc]: 'File is larger than 5MB.' }));
                        setErrors((e) => ({ ...e, [doc]: '' }));
                        setFiles((x) => ({ ...x, [doc]: f }));
                      }}
                    />
                  )}
                  {errors[doc] && <p className="mt-1.5 text-xs font-medium text-red-600">{errors[doc]}</p>}
                </div>
              ))}
            </div>
            <Callout tone="green" icon={<ShieldCheck />} className="mt-6">
              Documents are encrypted in transit and only visible to the Prevntiv verification team.
            </Callout>
            {submitError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{submitError}</p>}
            <div className="mt-10 flex justify-between border-t border-line-soft pt-6">
              <Btn variant="ghost" onClick={() => setStep(0)} icon={<ArrowLeft className="size-4" />}>
                Back
              </Btn>
              <Btn onClick={submit} loading={loading} iconRight={<ArrowRight className="size-4" />}>
                Submit for Verification
              </Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-10 text-center">
            <span className="relative mx-auto inline-flex size-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/60">
              <Hourglass className="size-9 animate-[spin_4s_ease-in-out_infinite]" />
            </span>
            <div className="mt-6">
              <Badge tone="amber" dot upper>
                Under Review
              </Badge>
            </div>
            <h1 className="mt-4 font-display text-[26px] font-bold text-ink">Application submitted</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-2">
              Thanks, {form.fullName?.split(' ')[0] || 'there'}. Our verification team is reviewing your {isFacility ? 'facility documents' : 'credentials'}. This usually takes 24–48 hours.
            </p>
            <div className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl bg-slate-50 p-5 text-left ring-1 ring-line-soft">
              {[
                { icon: CheckCircle2, t: 'Application received', s: 'Just now', done: true },
                { icon: Clock3, t: 'Credential & document verification', s: 'In progress', done: false },
                { icon: Mail, t: `Login details sent to ${form.email}`, s: 'After approval', done: false },
              ].map((r) => (
                <div key={r.t} className="flex items-start gap-3">
                  <r.icon className={cn('mt-0.5 size-5 shrink-0', r.done ? 'text-brand-600' : 'text-ink-4')} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.t}</p>
                    <p className="text-xs text-ink-3">{r.s}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Btn variant="outline" href="/welcome">
                Back to Home
              </Btn>
              <Btn href="/role?intent=login">Explore Prevntiv</Btn>
            </div>
            <p className="mt-6 text-xs text-ink-3">
              Questions? <a href="mailto:verify@prevntiv.in" className="font-semibold text-brand-700 hover:underline">verify@prevntiv.in</a>
            </p>
          </div>
        )}
      </div>
      <span className="sr-only">
        <Link href="/welcome">Home</Link>
      </span>
    </AuthFrame>
  );
}

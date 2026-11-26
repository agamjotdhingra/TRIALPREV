import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, FlaskConical, Home, Info, MapPin, Search, X } from 'lucide-react';
import { useListLabs } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Btn, Callout, Card, Field, Input, Page, PageHeader, Segmented, Select, Textarea, UploadZone } from '@/components/kit';
import { cn } from '@/lib/utils';

const TESTS = [
  { name: 'Complete Blood Count (CBC)', price: 350, tat: '6 hrs' },
  { name: 'Lipid Profile', price: 650, tat: '12 hrs', fasting: true },
  { name: 'HbA1c', price: 550, tat: '12 hrs' },
  { name: 'Thyroid Panel (T3, T4, TSH)', price: 700, tat: '24 hrs' },
  { name: 'Liver Function Test', price: 800, tat: '24 hrs' },
  { name: 'Kidney Function Test', price: 750, tat: '24 hrs' },
  { name: 'Vitamin D (25-OH)', price: 1200, tat: '48 hrs' },
  { name: 'Full Body Checkup (72 tests)', price: 2999, tat: '48 hrs', fasting: true },
];
const SLOTS = ['07:00 AM', '08:00 AM', '09:30 AM', '11:00 AM', '01:00 PM', '04:00 PM'];
const DEMO_LABS = ['Apollo Diagnostics — Jubilee Hills', 'Dr. Lal PathLabs — Connaught Place', 'Metropolis Healthcare — Worli'];

export default function BookLab() {
  const { isDemo } = useAuth();
  const labsQ = useListLabs();
  const labs: string[] = !isDemo && labsQ.data?.length ? labsQ.data.map((l: any) => l.name) : DEMO_LABS;
  const [lab, setLab] = useState('');
  const [q, setQ] = useState('');
  const [tests, setTests] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [mode, setMode] = useState<'Home Collection' | 'In-Lab Visit'>('Home Collection');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const matches = useMemo(() => TESTS.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) && !tests.includes(t.name)), [q, tests]);
  const chosen = TESTS.filter((t) => tests.includes(t.name));
  const fee = mode === 'Home Collection' ? 99 : 0;
  const total = chosen.reduce((a, t) => a + t.price, 0) + fee;
  const today = new Date().toISOString().slice(0, 10);

  function confirm() {
    const e: Record<string, string> = {};
    if (!lab) e.lab = 'Select a laboratory.';
    if (!tests.length) e.tests = 'Add at least one test or package.';
    if (!date) e.date = 'Pick a date.';
    if (!slot) e.slot = 'Pick a time slot.';
    if (mode === 'Home Collection' && address.trim().length < 10) e.address = 'Enter your full address for collection.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(`LAB-${Math.floor(100000 + Math.random() * 899999)}`);
    }, 900);
  }

  if (done) {
    return (
      <Page width="md">
        <Card className="p-8 text-center sm:p-12">
          <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 ring-8 ring-brand-50">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink">Booking confirmed</h1>
          <p className="mt-2 text-sm text-ink-2">
            {chosen.length} test{chosen.length > 1 ? 's' : ''} at {lab.split(' — ')[0]} on {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}, {slot}.
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-brand-700">Booking ID {done}</p>
          <Callout tone="green" icon={<Info />} className="mx-auto mt-6 max-w-md text-left">
            {mode === 'Home Collection' ? 'A certified phlebotomist will be assigned and will call you 30 minutes before arrival.' : 'Please carry a photo ID and arrive 10 minutes early.'}
          </Callout>
          <div className="mt-8 flex justify-center gap-3">
            <Btn variant="outline" href="/patient/appointments">
              My Appointments
            </Btn>
            <Btn href="/patient/dashboard">Back to Dashboard</Btn>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page width="lg">
      <PageHeader back={{ href: '/patient/appointments', label: 'Appointments' }} title="Book a Lab Appointment" subtitle="Schedule your tests easily. Home collection or in-lab visits available." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-6 p-6 sm:p-8">
          <Field label="Select Laboratory" required error={errors.lab}>
            <Select placeholder="Choose a partnered lab..." value={lab} onChange={(e) => setLab(e.target.value)} options={labs} />
          </Field>

          <Field label="Test or Health Package" required error={errors.tests}>
            <div className="relative">
              <Input leftIcon={<Search />} placeholder="Search tests (e.g., Complete Blood Count, Full Body Checkup)" value={q} onChange={(e) => setQ(e.target.value)} />
              {q && (
                <div className="absolute inset-x-0 top-full z-10 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-line-soft bg-white p-1.5 shadow-lift">
                  {matches.length === 0 && <p className="px-3 py-4 text-center text-sm text-ink-3">No matching tests</p>}
                  {matches.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => {
                        setTests((x) => [...x, t.name]);
                        setQ('');
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-brand-50"
                    >
                      <span className="font-medium text-ink">{t.name}</span>
                      <span className="num text-ink-3">₹{t.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {tests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tests.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 py-1 pl-3 pr-1.5 text-xs font-semibold text-brand-800">
                    {t}
                    <button onClick={() => setTests((x) => x.filter((y) => y !== t))} className="rounded-full p-0.5 hover:bg-brand-200" aria-label={`Remove ${t}`}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Upload Prescription (Optional)" hint="Accepted formats: PDF, JPEG, PNG.">
            {file ? (
              <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <FileText className="size-4 text-brand-600" /> {file.name}
                </span>
                <button onClick={() => setFile(null)} className="text-xs font-semibold text-ink-3 hover:text-red-600">
                  Remove
                </button>
              </div>
            ) : (
              <UploadZone compact accept=".pdf,.jpg,.jpeg,.png" title="Choose File or drag it here" onFiles={([f]) => setFile(f)} />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Appointment Date" required error={errors.date}>
              <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Collection Type">
              <Segmented options={['Home Collection', 'In-Lab Visit']} value={mode} onChange={setMode} />
            </Field>
          </div>

          <Field label="Preferred Time Slot" required error={errors.slot}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SLOTS.map((s) => (
                <button key={s} type="button" onClick={() => setSlot(s)} className={cn('h-10 rounded-xl border text-[13px] font-semibold transition-all', slot === s ? 'border-brand-600 bg-brand-700 text-white' : 'border-line bg-white text-ink-2 hover:border-brand-300')}>
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {mode === 'Home Collection' && (
            <Field label="Delivery Address (for Home Collection)" required error={errors.address}>
              <Textarea className="min-h-[84px]" placeholder="Enter your full address for collection..." value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
          )}
          <Field label="Special Instructions (Optional)">
            <Input placeholder="e.g., Fasting for 12 hours..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <Callout tone="blue" icon={<Info />}>
            A certified phlebotomist will be assigned once your booking is confirmed.
          </Callout>
        </Card>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h3 className="font-display text-[15px] font-bold text-ink">Booking Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-start gap-2 text-ink-2">
                <FlaskConical className="mt-0.5 size-4 shrink-0 text-brand-600" /> {lab || 'No lab selected'}
              </p>
              <p className="flex items-start gap-2 text-ink-2">
                {mode === 'Home Collection' ? <Home className="mt-0.5 size-4 shrink-0 text-brand-600" /> : <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />} {mode}
              </p>
            </div>
            <div className="mt-5 divide-y divide-line-soft border-y border-line-soft">
              {chosen.length === 0 && <p className="py-4 text-center text-xs text-ink-3">Add tests to see pricing</p>}
              {chosen.map((t) => (
                <div key={t.name} className="flex justify-between gap-3 py-3 text-[13px]">
                  <span className="text-ink-2">
                    {t.name}
                    {t.fasting && <span className="block text-[11px] text-amber-600">Fasting required</span>}
                  </span>
                  <span className="num font-semibold text-ink">₹{t.price}</span>
                </div>
              ))}
              {fee > 0 && chosen.length > 0 && (
                <div className="flex justify-between py-3 text-[13px]">
                  <span className="text-ink-2">Home collection fee</span>
                  <span className="num font-semibold text-ink">₹{fee}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink-2">Total</span>
              <span className="num font-display text-2xl font-bold text-ink">₹{chosen.length ? total.toLocaleString('en-IN') : 0}</span>
            </div>
            <Btn block size="lg" className="mt-6" loading={loading} onClick={confirm} iconRight={<ArrowRight className="size-4" />}>
              Confirm Booking
            </Btn>
          </Card>
        </aside>
      </div>
    </Page>
  );
}

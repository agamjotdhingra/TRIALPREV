import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { toast } from 'sonner';
import { Apple, FlaskConical, Pill, Plus, Send, Trash2 } from 'lucide-react';
import { useCreatePrescription, useListPatients } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Btn, Card, Field, Input, Page, PageHeader, Segmented, Select, Textarea, inputCls } from '@/components/kit';
import { MY_PATIENTS } from '@/data/demo';
import { cn } from '@/lib/utils';

type Kind = 'Medical Rx' | 'Nutrition Rx';
type Row = Record<string, string>;

const MED_COLS = [
  { k: 'name', p: 'Medicine (e.g. Amlodipine 5mg)', w: 'flex-[2]' },
  { k: 'dose', p: 'Dosage (e.g. 1 tab)', w: 'flex-1' },
  { k: 'freq', p: 'Frequency (e.g. Twice daily)', w: 'flex-[1.3]' },
  { k: 'duration', p: 'Duration (e.g. 30 days)', w: 'flex-1' },
];
const MEAL_COLS = [
  { k: 'meal', p: 'e.g., Breakfast', w: 'flex-1' },
  { k: 'foods', p: 'e.g., Oatmeal with berries', w: 'flex-[2]' },
  { k: 'portion', p: 'e.g., 1 cup, 8:00 AM', w: 'flex-1' },
];

function Rows({ title, icon, cols, rows, setRows, addLabel }: { title: string; icon: React.ReactNode; cols: { k: string; p: string; w: string }[]; rows: Row[]; setRows: (r: Row[]) => void; addLabel: string }) {
  const empty = Object.fromEntries(cols.map((c) => [c.k, '']));
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
        <span className="text-brand-600">{icon}</span> {title}
      </h3>
      <div className="space-y-2.5">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl bg-slate-50/70 p-2 ring-1 ring-line-soft sm:flex-row sm:items-center sm:bg-transparent sm:p-0 sm:ring-0">
            {cols.map((c) => (
              <input key={c.k} aria-label={c.p} className={cn(inputCls, c.w)} placeholder={c.p} value={r[c.k]} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, [c.k]: e.target.value } : x)))} />
            ))}
            <button type="button" aria-label="Remove row" onClick={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [empty])} className="self-end rounded-lg p-2.5 text-ink-4 transition-colors hover:bg-red-50 hover:text-red-600 sm:self-auto">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows([...rows, empty])} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline">
        <Plus className="size-4" /> {addLabel}
      </button>
    </section>
  );
}

export default function CreatePrescription() {
  const { isDemo } = useAuth();
  const [, setLocation] = useLocation();
  const initial: Kind = new URLSearchParams(useSearch()).get('type') === 'nutrition' ? 'Nutrition Rx' : 'Medical Rx';
  const [kind, setKind] = useState<Kind>(initial);
  const patientsQ = useListPatients();
  const create = useCreatePrescription();
  const patients: { id: string; label: string }[] = isDemo || !patientsQ.data ? MY_PATIENTS.map((p) => ({ id: p.id, label: `${p.name} — ${p.healthId}` })) : patientsQ.data.map((p: any) => ({ id: String(p.id), label: `${p.full_name} — ${p.health_id}` }));
  const [patient, setPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [meds, setMeds] = useState<Row[]>([{ name: '', dose: '', freq: '', duration: '' }]);
  const [tests, setTests] = useState<Row[]>([{ test: '', notes: '' }]);
  const [meals, setMeals] = useState<Row[]>([{ meal: 'Breakfast', foods: '', portion: '' }, { meal: 'Lunch', foods: '', portion: '' }]);
  const [supps, setSupps] = useState<Row[]>([{ name: '', dosage: '' }]);
  const [instructions, setInstructions] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit() {
    const e: Record<string, string> = {};
    if (!patient) e.patient = 'Select a patient.';
    if (!diagnosis.trim()) e.diagnosis = kind === 'Medical Rx' ? 'Enter the primary diagnosis.' : 'Enter dietary goals or diagnosis.';
    const items =
      kind === 'Medical Rx'
        ? meds.filter((m) => m.name.trim()).map((m) => [m.name, m.dose, m.freq, m.duration].map((x) => x.trim()).join(' | '))
        : [...meals.filter((m) => m.foods.trim()).map((m) => [`${m.meal}: ${m.foods}`, m.portion, '', ''].join(' | ')), ...supps.filter((s) => s.name.trim()).map((s) => [s.name, s.dosage, '', ''].join(' | '))];
    if (!items.length) e.items = kind === 'Medical Rx' ? 'Add at least one medicine.' : 'Add at least one meal or supplement.';
    if (followUp && new Date(followUp) < new Date(new Date().toDateString())) e.followUp = 'Follow-up date must be in the future.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const labOrders = tests.filter((t) => t.test.trim()).map((t) => `${t.test}${t.notes ? ` (${t.notes})` : ''}`);
    const notes = [instructions.trim(), labOrders.length ? `Lab tests ordered: ${labOrders.join('; ')}` : ''].filter(Boolean).join('\n\n');
    try {
      if (!isDemo) await create.mutateAsync({ patientId: Number(patient), diagnosis: kind === 'Nutrition Rx' ? `[Nutrition] ${diagnosis}` : diagnosis, medicines: items, instructions: notes || undefined, followUpDate: followUp || undefined });
      toast.success(`Prescription issued to ${patients.find((p) => p.id === patient)?.label.split(' — ')[0]}`);
      setLocation('/doctor/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Could not submit prescription');
    }
  }

  return (
    <Page width="lg">
      <PageHeader eyebrow="Clinical Care" title="Create Prescription" subtitle="Issue a new clinical prescription for your patient." />
      <Card className="p-6 sm:p-8">
        <Segmented className="mb-8 max-w-sm" options={['Medical Rx', 'Nutrition Rx'] as Kind[]} value={kind} onChange={setKind} />
        <div className="space-y-9">
          <section className="grid gap-5 sm:grid-cols-2">
            <Field label="Select Patient" required error={errors.patient}>
              <Select placeholder={patientsQ.isLoading && !isDemo ? 'Loading patients…' : 'Choose patient'} value={patient} onChange={(e) => setPatient(e.target.value)} options={patients.map((p) => ({ value: p.id, label: p.label }))} />
            </Field>
            <Field label={kind === 'Medical Rx' ? 'Diagnosis' : 'Dietary Goals / Diagnosis'} required error={errors.diagnosis}>
              <Input placeholder={kind === 'Medical Rx' ? 'Enter primary diagnosis (e.g., Acute Bronchitis)' : 'e.g., Hypertension Management, Low Sodium'} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} invalid={!!errors.diagnosis} />
            </Field>
          </section>

          {kind === 'Medical Rx' ? (
            <>
              <Rows title="Medications" icon={<Pill className="size-4" />} cols={MED_COLS} rows={meds} setRows={setMeds} addLabel="Add Medicine" />
              <Rows title="Order Lab Tests (Optional)" icon={<FlaskConical className="size-4" />} cols={[{ k: 'test', p: 'Test Name (e.g. Complete Blood Count)', w: 'flex-[2]' }, { k: 'notes', p: 'Notes (Optional) (e.g. fasting required)', w: 'flex-[1.5]' }]} rows={tests} setRows={setTests} addLabel="Add Test" />
            </>
          ) : (
            <>
              <Rows title="Meal Plan" icon={<Apple className="size-4" />} cols={MEAL_COLS} rows={meals} setRows={setMeals} addLabel="Add Meal Row" />
              <Rows title="Supplements" icon={<Pill className="size-4" />} cols={[{ k: 'name', p: 'Supplement Name (e.g., Vitamin D3)', w: 'flex-[1.5]' }, { k: 'dosage', p: 'Dosage/Notes (e.g., 2000 IU daily)', w: 'flex-[1.5]' }]} rows={supps} setRows={setSupps} addLabel="Add Supplement" />
            </>
          )}
          {errors.items && <p className="-mt-6 text-xs font-medium text-red-600">{errors.items}</p>}

          <section className="grid gap-5 sm:grid-cols-[1fr_240px]">
            <Field label={kind === 'Medical Rx' ? 'Special Instructions' : 'Special Dietary Instructions'}>
              <Textarea placeholder={kind === 'Medical Rx' ? 'Add any clinical notes, dietary advice, or specific instructions for the patient...' : 'Enter detailed clinical instructions, contraindications, or specific cooking methods...'} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            </Field>
            <Field label="Follow-Up Date" error={errors.followUp}>
              <Input type="date" min={new Date().toISOString().slice(0, 10)} value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
            </Field>
          </section>
        </div>
        <div className="mt-10 flex justify-end gap-3 border-t border-line-soft pt-6">
          <Btn variant="outline" onClick={() => history.back()}>
            Cancel
          </Btn>
          <Btn loading={create.isPending} onClick={submit} icon={<Send className="size-4" />}>
            Submit Prescription
          </Btn>
        </div>
      </Card>
    </Page>
  );
}

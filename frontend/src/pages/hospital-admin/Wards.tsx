import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Building, Minus, Plus } from 'lucide-react';
import { useCreateWard, useListWards } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Badge, Btn, Card, EmptyState, Field, Input, Modal, Page, PageHeader, Progress, SearchInput, Select, Skeleton } from '@/components/kit';
import { WARDS } from '@/data/demo';
import { useSource } from '@/data/source';

type W = { id: string; name: string; type: string; occupied: number; capacity: number };
const status = (p: number) => (p >= 90 ? 'Critical' : p >= 75 ? 'Warning' : 'Safe');
const TYPES = ['General Medical', 'Surgical', 'Intensive Care', 'Pediatric', 'Maternity', 'Emergency', 'Oncology', 'Cardiology'];

export default function HospitalWards() {
  const { isDemo } = useAuth();
  const src = useSource(useListWards(), WARDS, (w: any): W => ({ id: String(w.id), name: w.name, type: w.ward_type ?? 'General', occupied: w.occupied_beds ?? 0, capacity: w.total_beds ?? 0 }));
  const create = useCreateWard();
  const [added, setAdded] = useState<W[]>([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [st, setSt] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'General Medical', beds: 10 });
  const [err, setErr] = useState('');

  const all = [...added, ...src.rows];
  const rows = useMemo(() => all.filter((w) => (w.name + w.type).toLowerCase().includes(q.toLowerCase()) && (!type || w.type === type) && (!st || status(w.capacity ? (w.occupied / w.capacity) * 100 : 0) === st)), [all, q, type, st]);

  async function submit() {
    if (form.name.trim().length < 2) return setErr('Ward name is required.');
    if (form.beds < 1) return setErr('Capacity must be at least 1 bed.');
    setErr('');
    try {
      if (!isDemo) await create.mutateAsync({ name: form.name.trim(), ward_type: form.type, total_beds: form.beds, occupied_beds: 0, available_beds: form.beds });
      else setAdded((a) => [{ id: `w-${Date.now()}`, name: form.name.trim(), type: form.type, occupied: 0, capacity: form.beds }, ...a]);
      toast.success(`${form.name} created with ${form.beds} beds`);
      setForm({ name: '', type: 'General Medical', beds: 10 });
      setOpen(false);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <Page>
      <PageHeader title="Ward Management" subtitle="Monitor occupancy and manage hospital beds" actions={<Btn onClick={() => setOpen(true)} icon={<Plus className="size-4" />}>Create Ward</Btn>} />
      <Card className="mb-6 flex flex-col gap-3 p-3 md:flex-row">
        <SearchInput className="flex-1" value={q} onChange={setQ} placeholder="Search wards by name or type..." />
        <Select className="h-10 md:w-48" placeholder="All Types" value={type} onChange={(e) => setType(e.target.value)} options={Array.from(new Set(all.map((w) => w.type)))} />
        <Select className="h-10 md:w-44" placeholder="All Status" value={st} onChange={(e) => setSt(e.target.value)} options={['Safe', 'Warning', 'Critical']} />
      </Card>
      {src.error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{src.error}</p>}
      {src.loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={<Building />} title="No wards found" description="Create your first ward to start allocating beds." action={<Btn size="sm" onClick={() => setOpen(true)}>Create Ward</Btn>} />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((w) => {
            const p = w.capacity ? Math.round((w.occupied / w.capacity) * 100) : 0;
            const s = status(p);
            return (
              <Card key={w.id} className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">{w.name}</h3>
                    <p className="text-[13px] text-ink-3">{w.type}</p>
                  </div>
                  <Badge tone={s === 'Critical' ? 'red' : s === 'Warning' ? 'amber' : 'green'} dot>
                    {s}
                  </Badge>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-ink-3">Occupancy</p>
                    <p className="num font-display text-xl font-bold text-ink">
                      {w.occupied}/{w.capacity} <span className="text-xs font-medium text-ink-3">Beds</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-3">Available</p>
                    <p className={`num font-display text-xl font-bold ${w.capacity - w.occupied <= 2 ? 'text-red-600' : 'text-brand-700'}`}>{w.capacity - w.occupied}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-ink-3">Occupancy %</span>
                    <span className="num font-semibold text-ink">{p}%</span>
                  </div>
                  <Progress value={p} />
                </div>
                <Btn variant="outline" size="sm" block className="mt-6" href="/hospital/beds">
                  View beds
                </Btn>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create New Ward"
        footer={
          <>
            <Btn variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn loading={create.isPending} onClick={submit}>
              Create Ward
            </Btn>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Ward Name" required error={err && !form.name ? err : undefined}>
            <Input autoFocus placeholder="e.g. Oncology Wing West" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Ward Type/Specialization">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPES} />
          </Field>
          <Field label="Initial Bed Capacity">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm({ ...form, beds: Math.max(1, form.beds - 1) })} className="inline-flex size-11 items-center justify-center rounded-xl border border-line text-ink-2 hover:bg-slate-50" aria-label="Decrease">
                <Minus className="size-4" />
              </button>
              <Input className="w-24 text-center num" inputMode="numeric" value={form.beds} onChange={(e) => setForm({ ...form, beds: Math.min(500, Number(e.target.value.replace(/\D/g, '')) || 0) })} />
              <button type="button" onClick={() => setForm({ ...form, beds: Math.min(500, form.beds + 1) })} className="inline-flex size-11 items-center justify-center rounded-xl border border-line text-ink-2 hover:bg-slate-50" aria-label="Increase">
                <Plus className="size-4" />
              </button>
            </div>
          </Field>
          {err && form.name && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">{err}</p>}
        </div>
      </Modal>
    </Page>
  );
}

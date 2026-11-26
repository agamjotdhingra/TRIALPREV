import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BedDouble, Plus, RefreshCw, User, Wrench } from 'lucide-react';
import { useCreateBed, useListBeds, useListWards, useUpdateBed } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Btn, Card, Drawer, EmptyState, Field, InfoRow, Input, Modal, Page, PageHeader, SearchInput, Segmented, Select, Skeleton, StatusPill } from '@/components/kit';
import { BEDS, WARDS, type Bed } from '@/data/demo';
import { useSource } from '@/data/source';
import { cn } from '@/lib/utils';

type Filter = 'Hospital-Wide' | 'Available' | 'Occupied' | 'Maintenance';
const STYLE: Record<Bed['status'], { card: string; dot: string }> = {
  Available: { card: 'border-brand-200 bg-brand-50/50 hover:border-brand-400', dot: 'bg-brand-500' },
  Occupied: { card: 'border-sky-200 bg-sky-50/60 hover:border-sky-400', dot: 'bg-sky-500' },
  Maintenance: { card: 'border-amber-200 bg-amber-50/60 hover:border-amber-400', dot: 'bg-amber-500' },
};

export default function HospitalBeds() {
  const { isDemo, entityId } = useAuth();
  const src = useSource(useListBeds(), BEDS, (b: any): Bed & { wardId?: string } => ({ id: String(b.id), code: b.bed_number, room: b.room_number ?? '—', ward: b.wards?.name ?? 'Ward', wardId: String(b.ward_id), status: ((b.status ?? 'available').replace(/^./, (c: string) => c.toUpperCase()) as Bed['status']) }));
  const wardsQ = useListWards();
  const wards: { id: string; name: string }[] = isDemo || !wardsQ.data ? WARDS.map((w) => ({ id: w.id, name: w.name })) : wardsQ.data.map((w: any) => ({ id: String(w.id), name: w.name }));
  const update = useUpdateBed();
  const create = useCreateBed();
  const [local, setLocal] = useState<Record<string, Bed['status']>>({});
  const [added, setAdded] = useState<Bed[]>([]);
  const [filter, setFilter] = useState<Filter>('Hospital-Wide');
  const [ward, setWard] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Bed | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ ward: '', bed: '', room: '' });
  const [synced, setSynced] = useState(new Date());

  const all = useMemo(() => [...added, ...src.rows].map((b) => ({ ...b, status: local[b.id] ?? b.status })), [src.rows, local, added]);
  const rows = all.filter((b) => (filter === 'Hospital-Wide' || b.status === filter) && (!ward || b.ward === ward) && (b.code + b.room).toLowerCase().includes(q.toLowerCase()));
  const count = (s: Bed['status']) => all.filter((b) => b.status === s).length;
  const wardNames = Array.from(new Set(all.map((b) => b.ward)));

  async function setStatus(b: Bed, status: Bed['status']) {
    try {
      if (!isDemo && !b.id.startsWith('new-')) await update.mutateAsync({ id: b.id, status: status.toLowerCase() });
      setLocal((l) => ({ ...l, [b.id]: status }));
      setSel(null);
      toast.success(`${b.code} marked ${status.toLowerCase()}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function addBed() {
    if (!form.ward || !form.bed.trim()) return toast.error('Ward and bed number are required.');
    const w = wards.find((x) => x.id === form.ward);
    try {
      if (!isDemo) await create.mutateAsync({ hospital_id: entityId, ward_id: Number(form.ward), bed_number: form.bed.trim(), room_number: form.room.trim() || null, status: 'available' });
      else setAdded((a) => [{ id: `new-${Date.now()}`, code: form.bed.trim().toUpperCase(), room: form.room || '—', ward: w?.name ?? 'Ward', status: 'Available' }, ...a]);
      toast.success(`Bed ${form.bed} added to ${w?.name}`);
      setForm({ ward: '', bed: '', room: '' });
      setAddOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <Page width="full">
      <PageHeader
        title="Bed Roster"
        subtitle={
          <span className="inline-flex items-center gap-2">
            Real-time bed availability monitoring. Last synced: {Math.max(0, Math.round((Date.now() - synced.getTime()) / 60000))} minutes ago.
            <button onClick={() => { setSynced(new Date()); src.isDemo || toast.success('Refreshed'); }} className="rounded-full p-1 text-ink-3 hover:bg-slate-100 hover:text-brand-700" aria-label="Refresh">
              <RefreshCw className="size-3.5" />
            </button>
          </span>
        }
        actions={
          <Btn onClick={() => setAddOpen(true)} icon={<Plus className="size-4" />}>
            Add Bed
          </Btn>
        }
      />
      <div className="mb-5 grid grid-cols-3 gap-3 sm:max-w-xl">
        {(['Available', 'Occupied', 'Maintenance'] as const).map((s) => (
          <div key={s} className="card flex items-center gap-3 px-4 py-3">
            <span className={cn('size-2.5 rounded-full', STYLE[s].dot)} />
            <div>
              <p className="num font-display text-xl font-bold text-ink">{count(s)}</p>
              <p className="text-[11px] font-medium text-ink-3">{s}</p>
            </div>
          </div>
        ))}
      </div>
      <Card className="mb-5 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <SearchInput className="lg:w-72" value={q} onChange={setQ} placeholder="Search by bed or room number..." />
        <Select className="h-10 lg:w-52" value={ward} onChange={(e) => setWard(e.target.value)} placeholder="All Wards" options={wardNames} />
        <Segmented className="lg:ml-auto lg:max-w-lg" size="sm" options={['Hospital-Wide', 'Available', 'Occupied', 'Maintenance'] as Filter[]} value={filter} onChange={setFilter} />
      </Card>
      {src.error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{src.error}</p>}
      {src.loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">{Array.from({ length: 16 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={<BedDouble />} title="No beds match" description="Adjust filters or add beds to a ward." />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {rows.map((b) => (
            <button key={b.id} onClick={() => setSel(b)} className={cn('group flex flex-col rounded-2xl border p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card', STYLE[b.status].card)}>
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-bold text-ink">{b.code}</span>
                <span className={cn('size-2 rounded-full', STYLE[b.status].dot)} />
              </div>
              <span className="mt-1 text-[11px] text-ink-3">{b.room}</span>
              <span className="text-[11px] font-medium text-ink-2">{b.ward}</span>
              <span className="mt-3 flex items-center gap-1 truncate text-[11px] font-semibold text-ink-2">
                {b.status === 'Occupied' ? <><User className="size-3" /> {b.patient ?? 'Occupied'}</> : b.status === 'Maintenance' ? <><Wrench className="size-3" /> Maintenance</> : 'Ready'}
              </span>
            </button>
          ))}
        </div>
      )}

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel ? `Bed ${sel.code}` : ''}
        subtitle={sel ? `${sel.room} · ${sel.ward}` : ''}
        footer={
          sel && (
            <>
              {sel.status !== 'Maintenance' && sel.status !== 'Occupied' && (
                <Btn variant="outline" onClick={() => setStatus(sel, 'Maintenance')} icon={<Wrench className="size-4" />}>
                  Flag maintenance
                </Btn>
              )}
              {sel.status === 'Maintenance' && <Btn onClick={() => setStatus(sel, 'Available')}>Mark available</Btn>}
              {sel.status === 'Available' && <Btn href="/hospital/admissions?new=1">Admit patient</Btn>}
              {sel.status === 'Occupied' && <Btn href="/hospital/admissions">View admission</Btn>}
            </>
          )
        }
      >
        {sel && (
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Status" value={<StatusPill status={sel.status} />} />
            <InfoRow label="Ward" value={sel.ward} />
            <InfoRow label="Room" value={sel.room} />
            <InfoRow label="Patient" value={sel.patient ?? '—'} />
          </div>
        )}
      </Drawer>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Bed"
        size="sm"
        footer={
          <>
            <Btn variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Btn>
            <Btn loading={create.isPending} onClick={addBed}>
              Add Bed
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Ward" required>
            <Select placeholder="Select ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} options={wards.map((w) => ({ value: w.id, label: w.name }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bed Number" required>
              <Input placeholder="e.g. G-105" value={form.bed} onChange={(e) => setForm({ ...form, bed: e.target.value })} />
            </Field>
            <Field label="Room">
              <Input placeholder="e.g. Room 103" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

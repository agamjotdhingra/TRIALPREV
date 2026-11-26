import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Moon, Sun, Sunrise, Sunset, UserPlus, Users } from 'lucide-react';
import { useCreateStaff, useListStaff } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, Card, DataTable, EmptyState, Field, Input, Modal, Page, PageHeader, Pagination, SearchInput, Select, usePaged } from '@/components/kit';
import { STAFF } from '@/data/demo';
import { useSource } from '@/data/source';

type S = (typeof STAFF)[number];
const SHIFTS: Record<string, { t: string; i: typeof Sun; tone: 'amber' | 'blue' | 'violet' | 'gray' }> = {
  Morning: { t: '8:00 AM - 4:00 PM', i: Sunrise, tone: 'amber' },
  Evening: { t: '4:00 PM - 12:00 AM', i: Sunset, tone: 'violet' },
  Night: { t: '12:00 AM - 8:00 AM', i: Moon, tone: 'blue' },
  General: { t: '9:00 AM - 5:00 PM', i: Sun, tone: 'gray' },
};
const ROLES = ['Doctor', 'Nurse', 'Admin', 'Pharmacist', 'Technician', 'Support'];

export default function HospitalStaff() {
  const { isDemo } = useAuth();
  const src = useSource(useListStaff(), STAFF, (s: any): S => {
    const shift = (s.assigned_shift ?? 'General').replace(/^./, (c: string) => c.toUpperCase());
    return { id: String(s.id), name: s.full_name, qual: s.qualification ?? '', emp: s.employee_id ?? '—', role: (s.role ?? '').replace(/^./, (c: string) => c.toUpperCase()), shift, shiftTime: SHIFTS[shift]?.t ?? '—' };
  });
  const create = useCreateStaff();
  const [added, setAdded] = useState<S[]>([]);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [shift, setShift] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', qual: '', role: 'Nurse', shift: 'Morning', mobile: '', email: '' });
  const [err, setErr] = useState('');
  const all = [...added, ...src.rows];
  const rows = useMemo(() => all.filter((s) => (s.name + s.emp + s.role).toLowerCase().includes(q.toLowerCase()) && (!role || s.role === role) && (!shift || s.shift === shift)), [all, q, role, shift]);
  const paged = usePaged(rows, 8);

  async function submit() {
    if (form.name.trim().length < 2) return setErr('Full name is required.');
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setErr('Enter a valid email.');
    setErr('');
    const emp = `EMP-${Math.floor(6000 + Math.random() * 3999)}`;
    try {
      if (!isDemo) await create.mutateAsync({ full_name: form.name.trim(), employee_id: emp, role: form.role.toLowerCase(), qualification: form.qual || null, assigned_shift: form.shift.toLowerCase(), mobile: form.mobile || null, email: form.email || null });
      else setAdded((a) => [{ id: `s-${Date.now()}`, name: form.name.trim(), qual: form.qual, emp, role: form.role, shift: form.shift, shiftTime: SHIFTS[form.shift].t }, ...a]);
      toast.success(`${form.name} added as ${form.role}`);
      setForm({ name: '', qual: '', role: 'Nurse', shift: 'Morning', mobile: '', email: '' });
      setOpen(false);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <Page>
      <PageHeader title="Staff Registry" subtitle="Manage clinical and administrative staff across all wards." actions={<Btn onClick={() => setOpen(true)} icon={<UserPlus className="size-4" />}>Add Staff Member</Btn>} />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line-soft p-4 md:flex-row">
          <SearchInput className="flex-1" value={q} onChange={setQ} placeholder="Search by name, ID, or role..." />
          <Select className="h-10 md:w-40" placeholder="All roles" value={role} onChange={(e) => setRole(e.target.value)} options={ROLES} />
          <Select className="h-10 md:w-40" placeholder="All shifts" value={shift} onChange={(e) => setShift(e.target.value)} options={Object.keys(SHIFTS)} />
        </div>
        {src.error && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-[13px] text-red-700">{src.error}</p>}
        <DataTable
          loading={src.loading}
          rows={paged.slice}
          rowKey={(r) => r.id}
          empty={<EmptyState icon={<Users />} title="No staff found" description="Add doctors, nurses and administrators to manage shifts." />}
          columns={[
            { key: 'n', header: 'Staff Member', cell: (s) => <div className="flex items-center gap-3"><Avatar name={s.name} size={36} /><div><p className="font-semibold text-ink">{s.name}</p><p className="text-xs text-ink-3">{s.qual || '—'}</p></div></div> },
            { key: 'e', header: 'Employee ID', cell: (s) => <span className="font-mono text-xs font-semibold">{s.emp}</span> },
            { key: 'r', header: 'Role', cell: (s) => <Badge tone={s.role === 'Doctor' ? 'green' : s.role === 'Nurse' ? 'blue' : 'gray'}>{s.role}</Badge> },
            { key: 't', header: 'Shift Time', hideOnMobile: true, cell: (s) => <span className="whitespace-nowrap">{s.shiftTime}</span> },
            { key: 's', header: 'Shift', cell: (s) => { const x = SHIFTS[s.shift] ?? SHIFTS.General; return <Badge tone={x.tone}><x.i className="size-3" /> {s.shift}</Badge>; } },
          ]}
        />
        {rows.length > 0 && <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} onPage={paged.setPage} />}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Staff Member"
        size="lg"
        footer={
          <>
            <Btn variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Btn>
            <Btn loading={create.isPending} onClick={submit}>
              Add Staff
            </Btn>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full Name" required>
            <Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kavita Sharma" />
          </Field>
          <Field label="Qualification">
            <Input value={form.qual} onChange={(e) => setForm({ ...form, qual: e.target.value })} placeholder="e.g. B.Sc Nursing" />
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={ROLES} />
          </Field>
          <Field label="Shift">
            <Select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} options={Object.entries(SHIFTS).map(([k, v]) => ({ value: k, label: `${k} (${v.t})` }))} />
          </Field>
          <Field label="Mobile">
            <Input inputMode="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>
        {err && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">{err}</p>}
      </Modal>
    </Page>
  );
}

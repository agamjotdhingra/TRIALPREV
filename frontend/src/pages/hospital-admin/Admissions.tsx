import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { toast } from 'sonner';
import { BedDouble, Check, FileText, UserPlus } from 'lucide-react';
import { useCreateAdmission, useListAdmissions, useListBeds, useListPatients, useListStaff, useListWards } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Btn, CapsuleTabs, Card, DataTable, EmptyState, Field, Input, Modal, Page, PageHeader, Pagination, SearchInput, Select, StatusPill, Textarea, usePaged } from '@/components/kit';
import { ADMISSIONS, BEDS, STAFF, WARDS, type Admission } from '@/data/demo';
import { fmtDate, useSource } from '@/data/source';

export function mapAdmission(a: any): Admission & { patientId?: number } {
  const st = (a.status ?? 'admitted').toLowerCase();
  return {
    id: String(a.id),
    date: fmtDate(a.admission_date, { day: '2-digit', month: 'short', year: 'numeric' }),
    time: a.admission_date ? new Date(a.admission_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
    patient: a.patients?.full_name ?? 'Patient',
    pid: a.patients?.health_id ?? '—',
    reason: a.admission_reason ?? '—',
    dept: a.wards?.name ?? (st === 'discharged' ? '—' : 'Ward'),
    bed: st === 'discharged' ? 'Discharged' : a.beds?.bed_number ? `Bed ${a.beds.bed_number}` : '—',
    physician: a.doctors?.full_name ?? '—',
    status: st === 'icu' ? 'ICU' : st.replace(/^./, (c: string) => c.toUpperCase()),
    scoreIn: 0,
    scoreNow: a.patients?.health_score ?? 0,
    patientId: a.patient_id,
  };
}

export default function HospitalAdmissions() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const src = useSource(useListAdmissions(), ADMISSIONS, mapAdmission);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'Current' | 'Discharged' | 'All'>('Current');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(search).get('new')) setOpen(true);
  }, [search]);

  const rows = useMemo(
    () => src.rows.filter((a) => (tab === 'All' || (tab === 'Discharged' ? a.status === 'Discharged' : a.status !== 'Discharged')) && (a.patient + a.reason + a.pid).toLowerCase().includes(q.toLowerCase())),
    [src.rows, q, tab],
  );
  const paged = usePaged(rows, 8);

  return (
    <Page>
      <PageHeader
        title="Patient Admissions"
        subtitle="Census of everyone currently admitted, with discharge actions."
        actions={
          <>
            <SearchInput className="w-full sm:w-72" value={q} onChange={setQ} placeholder="Search by patient name or reason..." />
            <Btn onClick={() => setOpen(true)} icon={<UserPlus className="size-4" />}>
              New Admission
            </Btn>
          </>
        }
      />
      <CapsuleTabs className="mb-5" tabs={['Current', 'Discharged', 'All']} value={tab} onChange={setTab} />
      <Card className="overflow-hidden">
        {src.error && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-[13px] text-red-700">{src.error}</p>}
        <DataTable
          loading={src.loading}
          rows={paged.slice}
          rowKey={(r) => r.id}
          empty={<EmptyState icon={<BedDouble />} title="No admissions" description="Admitted patients will appear here." />}
          columns={[
            { key: 'd', header: 'Admission Date', cell: (a) => <><p className="whitespace-nowrap font-semibold text-ink">{a.date}</p><p className="text-xs text-ink-3">{a.time}</p></> },
            { key: 'p', header: 'Patient', cell: (a) => <div className="flex items-center gap-3"><Avatar name={a.patient} size={36} /><div className="min-w-0"><p className="font-semibold text-ink">{a.patient}</p><p className="truncate text-xs text-ink-3">{a.reason}</p></div></div> },
            { key: 'w', header: 'Department / Bed', hideOnMobile: true, cell: (a) => <><p className="text-ink-2">{a.dept}</p><p className="text-xs font-semibold text-brand-700">{a.bed}</p></> },
            { key: 'ph', header: 'Primary Physician', hideOnMobile: true, cell: (a) => a.physician },
            { key: 's', header: 'Status', cell: (a) => <StatusPill status={a.status} /> },
            {
              key: 'x',
              header: 'Action',
              align: 'right',
              cell: (a) =>
                a.status === 'Discharged' ? (
                  <Btn size="xs" variant="ghost" href={`/hospital/summary/${a.id}`} icon={<FileText className="size-3.5" />}>
                    Summary
                  </Btn>
                ) : (
                  <Btn size="xs" variant="secondary" onClick={() => setLocation(`/hospital/admissions/${a.id}/discharge`)}>
                    Discharge
                  </Btn>
                ),
            },
          ]}
        />
        {rows.length > 0 && <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} onPage={paged.setPage} noun="patients" />}
      </Card>
      <NewAdmission open={open} onClose={() => setOpen(false)} />
    </Page>
  );
}

function NewAdmission({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isDemo } = useAuth();
  const [form, setForm] = useState({ hid: '', ward: '', bed: '', doctor: '', date: new Date().toISOString().slice(0, 16), reason: '', status: 'admitted' });
  const [err, setErr] = useState('');
  const dq = useDeferredValue(form.hid);
  const patientsQ = useListPatients(dq.length >= 3 ? { search: dq } : {});
  const wardsQ = useListWards();
  const bedsQ = useListBeds(form.ward ? { wardId: form.ward } : {});
  const staffQ = useListStaff();
  const create = useCreateAdmission();

  const wards = isDemo || !wardsQ.data ? WARDS.map((w) => ({ id: w.id, name: w.name })) : wardsQ.data.map((w: any) => ({ id: String(w.id), name: w.name }));
  const beds = isDemo || !bedsQ.data ? BEDS.filter((b) => b.status === 'Available').map((b) => ({ id: b.id, name: `${b.code} · ${b.room}` })) : bedsQ.data.filter((b: any) => b.status === 'available').map((b: any) => ({ id: String(b.id), name: `${b.bed_number} · ${b.room_number ?? ''}` }));
  const doctors = isDemo || !staffQ.data ? STAFF.filter((s) => s.role === 'Doctor').map((s) => ({ id: s.id, name: s.name })) : staffQ.data.filter((s: any) => s.role === 'doctor').map((s: any) => ({ id: String(s.id), name: s.full_name }));
  const match = !isDemo && dq.length >= 3 ? patientsQ.data?.[0] : null;

  async function submit() {
    if (!form.hid.trim() || !form.ward || !form.bed || !form.reason.trim()) return setErr('Patient, ward, bed and reason are required.');
    if (!isDemo && !match) return setErr('No patient found for that Health ID or name.');
    setErr('');
    try {
      if (!isDemo) await create.mutateAsync({ patientId: match.id, wardId: Number(form.ward), bedId: Number(form.bed), primaryDoctorId: form.doctor ? Number(form.doctor) : undefined, admissionDate: new Date(form.date).toISOString(), admissionReason: form.reason, status: form.status });
      toast.success(`Admitted ${match?.full_name ?? form.hid} to ${wards.find((w: any) => w.id === form.ward)?.name}`);
      onClose();
    } catch (e: any) {
      setErr(e.message ?? 'Admission failed');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Admission"
      description="Admit a patient and allocate a bed."
      size="lg"
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn loading={create.isPending} onClick={submit} icon={<Check className="size-4" />}>
            Admit Patient
          </Btn>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Patient Health ID or name" required className="sm:col-span-2" hint={match ? `Found: ${match.full_name} (${match.health_id})` : isDemo ? 'e.g. PRV-882-901' : 'Type at least 3 characters'}>
          <Input value={form.hid} onChange={(e) => setForm({ ...form, hid: e.target.value })} placeholder="PRV-000-000" />
        </Field>
        <Field label="Ward" required>
          <Select placeholder="Select ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value, bed: '' })} options={wards.map((w: any) => ({ value: w.id, label: w.name }))} />
        </Field>
        <Field label="Bed" required>
          <Select placeholder={beds.length ? 'Select available bed' : 'No beds available'} value={form.bed} onChange={(e) => setForm({ ...form, bed: e.target.value })} options={beds.map((b: any) => ({ value: b.id, label: b.name }))} />
        </Field>
        <Field label="Primary Physician">
          <Select placeholder="Assign doctor" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} options={doctors.map((d: any) => ({ value: d.id, label: d.name }))} />
        </Field>
        <Field label="Admission Date & Time">
          <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="Initial Status">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'admitted', label: 'Admitted' }, { value: 'icu', label: 'ICU' }, { value: 'observation', label: 'Observation' }]} />
        </Field>
        <Field label="Reason for admission" required className="sm:col-span-2">
          <Textarea className="min-h-[80px]" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Acute Gastroenteritis" />
        </Field>
      </div>
      {err && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">{err}</p>}
    </Modal>
  );
}

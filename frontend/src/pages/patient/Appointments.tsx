import { useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';
import { toast } from 'sonner';
import { CalendarPlus, FlaskConical, MessageSquare, User, Video } from 'lucide-react';
import { useCreateAppointment, useGetPatientMe, useListAppointments, useListDoctors, useUpdateAppointmentStatus } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Btn, CapsuleTabs, Card, DataTable, Drawer, EmptyState, Field, InfoRow, Input, Modal, Page, PageHeader, Pagination, Select, StatusPill, Textarea, usePaged } from '@/components/kit';
import { APPOINTMENTS, type Appt } from '@/data/demo';
import { mapAppt } from '@/data/mappers';
import { fmtDate, useSource } from '@/data/source';
import { cn } from '@/lib/utils';

const TYPE_ICON = { Video: Video, Chat: MessageSquare, 'In-Person': User } as const;
const SLOTS = ['09:00 AM', '09:30 AM', '10:30 AM', '11:00 AM', '12:15 PM', '02:15 PM', '03:00 PM', '04:30 PM', '05:45 PM'];
const DEMO_DOCTORS = [
  { id: 1, full_name: 'Dr. Sarah Chen', specialization: 'Cardiology', consultation_fees: 1500 },
  { id: 2, full_name: 'Dr. Amit Patel', specialization: 'Dermatology', consultation_fees: 1200 },
  { id: 3, full_name: 'Dr. Emily Jones', specialization: 'General Practice', consultation_fees: 800 },
  { id: 4, full_name: 'Dr. Rajesh Kumar', specialization: 'Pulmonology', consultation_fees: 900 },
];

export default function PatientAppointments() {
  const { isDemo } = useAuth();
  const search = useSearch();
  const src = useSource(useListAppointments(), APPOINTMENTS, mapAppt);
  const [local, setLocal] = useState<Appt[]>([]);
  const [cancelled, setCancelled] = useState<Record<string, boolean>>({});
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [tab, setTab] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [bookOpen, setBookOpen] = useState(false);
  const [notes, setNotes] = useState<Appt | null>(null);
  const update = useUpdateAppointmentStatus();

  useEffect(() => {
    if (new URLSearchParams(search).get('book')) setBookOpen(true);
  }, [search]);

  const rows = useMemo(() => {
    const all = [...local, ...src.rows].map((a) => (cancelled[a.id] ? { ...a, status: 'Cancelled' as const } : a));
    return all.filter((a) => tab === 'All' || (tab === 'Upcoming' ? a.status === 'Scheduled' : a.status === tab));
  }, [local, src.rows, cancelled, tab]);
  const paged = usePaged(rows, 8);

  async function cancel(a: Appt) {
    setCancelling(a.id);
    try {
      if (!isDemo && !a.id.startsWith('local-')) await update.mutateAsync({ id: a.id, status: 'cancelled' });
      else await new Promise((r) => setTimeout(r, 700));
      setCancelled((c) => ({ ...c, [a.id]: true }));
      toast.success(`Appointment with ${a.doctor} cancelled`);
    } catch (e: any) {
      toast.error(e.message ?? 'Could not cancel appointment');
    } finally {
      setCancelling(null);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Your Appointments"
        subtitle="Manage your upcoming and past consultations."
        actions={
          <>
            <Btn variant="outline" href="/patient/appointments/book-lab" icon={<FlaskConical className="size-4" />}>
              Book Lab Test
            </Btn>
            <Btn onClick={() => setBookOpen(true)} icon={<CalendarPlus className="size-4" />}>
              Book Appointment
            </Btn>
          </>
        }
      />
      <CapsuleTabs className="mb-5" tabs={['All', 'Upcoming', 'Completed', 'Cancelled']} value={tab} onChange={setTab} />
      <Card className="overflow-hidden">
        {src.error && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-[13px] text-red-700">{src.error}</p>}
        <DataTable
          loading={src.loading}
          rows={paged.slice}
          rowKey={(r) => r.id}
          empty={<EmptyState icon={<CalendarPlus />} title="No appointments here" description="Book a consultation with a Prevntiv doctor in a few taps." action={<Btn size="sm" onClick={() => setBookOpen(true)}>Book Appointment</Btn>} />}
          columns={[
            {
              key: 'dt',
              header: 'Date & Time',
              cell: (a) => (
                <div>
                  <p className="font-semibold text-ink">{fmtDate(a.date)}</p>
                  <p className="text-xs text-ink-3">{a.time}</p>
                </div>
              ),
            },
            { key: 'doc', header: 'Doctor', cell: (a) => <div className="flex items-center gap-3"><Avatar name={a.doctor} size={34} /><div><p className="font-semibold text-ink">{a.doctor}</p><p className="text-xs text-ink-3">{a.specialty}</p></div></div> },
            {
              key: 'type',
              header: 'Consultation Type',
              hideOnMobile: true,
              cell: (a) => {
                const Icon = TYPE_ICON[a.type as keyof typeof TYPE_ICON] ?? User;
                return (
                  <span className="inline-flex items-center gap-2 text-ink-2">
                    <Icon className="size-4 text-ink-3" /> {a.type}
                  </span>
                );
              },
            },
            { key: 'status', header: 'Status', cell: (a) => <StatusPill status={a.status} /> },
            { key: 'reason', header: 'Reason', hideOnMobile: true, cell: (a) => <span className="line-clamp-1 max-w-[220px]">{a.reason || '—'}</span> },
            {
              key: 'act',
              header: 'Actions',
              align: 'right',
              cell: (a) =>
                a.status === 'Scheduled' ? (
                  <Btn size="xs" variant="danger-soft" loading={cancelling === a.id} onClick={() => cancel(a)}>
                    {cancelling === a.id ? 'Canceling...' : 'Cancel'}
                  </Btn>
                ) : a.status === 'Completed' ? (
                  <Btn size="xs" variant="secondary" onClick={() => setNotes(a)}>
                    View Notes
                  </Btn>
                ) : (
                  <span className="text-xs text-ink-4">—</span>
                ),
            },
          ]}
        />
        {rows.length > 0 && <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} onPage={paged.setPage} noun="appointments" />}
      </Card>

      <BookAppointment
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={(a) => {
          setLocal((l) => [a, ...l]);
          setTab('All');
        }}
      />

      <Drawer open={!!notes} onClose={() => setNotes(null)} title="Consultation Notes" subtitle={notes ? `${notes.doctor} · ${fmtDate(notes.date)}` : ''}>
        {notes && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
              <InfoRow label="Specialty" value={notes.specialty} />
              <InfoRow label="Type" value={notes.type} />
              <InfoRow label="Reason" value={notes.reason} />
              <InfoRow label="Status" value={<StatusPill status={notes.status} />} />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-4">Summary</p>
              <p className="text-sm leading-relaxed text-ink-2">Patient reviewed for {notes.reason.toLowerCase()}. Vitals stable. Current medication continued with no dose change. Advised hydration and 30 minutes of daily walking.</p>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-4">Next steps</p>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
                <li>Repeat lipid profile in 8 weeks</li>
                <li>Follow-up consultation after results</li>
              </ul>
            </div>
            <Btn variant="secondary" href="/patient/prescriptions" block>
              View linked prescription
            </Btn>
          </div>
        )}
      </Drawer>
    </Page>
  );
}

export function BookAppointment({ open, onClose, onBooked }: { open: boolean; onClose: () => void; onBooked: (a: Appt) => void }) {
  const { isDemo } = useAuth();
  const doctorsQ = useListDoctors();
  const me = useGetPatientMe();
  const create = useCreateAppointment();
  const doctors: any[] = isDemo || !doctorsQ.data?.length ? DEMO_DOCTORS : doctorsQ.data;
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', type: 'video', reason: '' });
  const [err, setErr] = useState('');
  const doctor = doctors.find((d) => String(d.id) === form.doctorId);
  const today = new Date().toISOString().slice(0, 10);

  async function submit() {
    if (!form.doctorId || !form.date || !form.time) return setErr('Choose a doctor, date and time slot.');
    setErr('');
    const appt: Appt = {
      id: `local-${Date.now()}`,
      date: form.date,
      time: form.time,
      doctor: doctor?.full_name ?? 'Doctor',
      specialty: doctor?.specialization ?? '',
      type: form.type === 'video' ? 'Video' : form.type === 'chat' ? 'Chat' : 'In-Person',
      status: 'Scheduled',
      reason: form.reason || 'Consultation',
    };
    try {
      if (!isDemo) {
        await create.mutateAsync({ patientId: me.data?.id, doctorId: Number(form.doctorId), scheduledDate: form.date, scheduledTime: form.time, consultationType: form.type, reason: form.reason || undefined });
      } else onBooked(appt);
      toast.success(`Booked with ${appt.doctor} on ${fmtDate(form.date, { day: 'numeric', month: 'short' })} at ${form.time}`);
      setForm({ doctorId: '', date: '', time: '', type: 'video', reason: '' });
      onClose();
    } catch (e: any) {
      setErr(e.message ?? 'Booking failed');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Book an Appointment"
      description="Pick a doctor and a time that suits you."
      size="lg"
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn onClick={submit} loading={create.isPending}>
            Confirm Booking {doctor?.consultation_fees ? `· ₹${doctor.consultation_fees}` : ''}
          </Btn>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Doctor" required className="sm:col-span-2">
          <Select placeholder="Select a doctor" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} options={doctors.map((d) => ({ value: String(d.id), label: `${d.full_name} — ${d.specialization ?? ''}` }))} />
        </Field>
        <Field label="Date" required>
          <Input type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="Consultation Type">
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'video', label: 'Video' }, { value: 'in-person', label: 'In-Person' }, { value: 'chat', label: 'Chat' }]} />
        </Field>
        <Field label="Available Slots" required className="sm:col-span-2">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {SLOTS.map((s) => (
              <button key={s} type="button" disabled={!form.date} onClick={() => setForm({ ...form, time: s })} className={cn('h-10 rounded-xl border text-[13px] font-semibold transition-all disabled:opacity-40', form.time === s ? 'border-brand-600 bg-brand-700 text-white' : 'border-line bg-white text-ink-2 hover:border-brand-300')}>
                {s}
              </button>
            ))}
          </div>
          {!form.date && <p className="text-xs text-ink-3">Choose a date to see open slots.</p>}
        </Field>
        <Field label="Reason for visit" className="sm:col-span-2">
          <Textarea className="min-h-[80px]" placeholder="Briefly describe your symptoms or reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </Field>
      </div>
      {err && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">{err}</p>}
    </Modal>
  );
}

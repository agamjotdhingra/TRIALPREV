import { useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CalendarClock, Pill, Printer } from 'lucide-react';
import { useListPrescriptions } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, Card, Drawer, EmptyState, InfoRow, LogoMark, Page, PageHeader, SearchInput, Skeleton } from '@/components/kit';
import { PRESCRIPTIONS, type Rx } from '@/data/demo';
import { mapRx } from '@/data/mappers';
import { fmtDate, useSource } from '@/data/source';

export default function PatientPrescriptions() {
  const src = useSource(useListPrescriptions(), PRESCRIPTIONS, mapRx);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Rx | null>(null);
  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return src.rows.filter((r) => !s || [r.diagnosis, r.doctor, r.specialty, ...r.medicines.map((m) => m.name)].join(' ').toLowerCase().includes(s));
  }, [src.rows, q]);

  return (
    <Page>
      <PageHeader title="Your Prescriptions" subtitle="Manage your current and past medication records." actions={<SearchInput className="w-full sm:w-80" value={q} onChange={setQ} placeholder="Search diagnosis or doctor..." />} />
      {src.error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{src.error}</p>}
      <div className="space-y-4">
        {src.loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        {!src.loading && rows.length === 0 && (
          <Card>
            <EmptyState icon={<Pill />} title={q ? 'No prescriptions match your search' : 'No prescriptions yet'} description={q ? 'Try a different medicine, diagnosis or doctor name.' : 'Prescriptions issued by your Prevntiv doctors will appear here.'} />
          </Card>
        )}
        {rows.map((rx) => {
          const active = rx.followUp && new Date(rx.followUp) >= new Date('2026-06-01');
          return (
            <Card key={rx.id} className="grid gap-5 p-5 transition-shadow hover:shadow-lift sm:p-6 md:grid-cols-[150px_1.2fr_1fr_1.6fr_140px_auto] md:items-center">
              <InfoRow label="Date Issued" value={fmtDate(rx.date)} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-4">Prescribed By</p>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <Avatar name={rx.doctor} size={32} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{rx.doctor}</p>
                    <p className="truncate text-xs text-ink-3">{rx.specialty}</p>
                  </div>
                </div>
              </div>
              <InfoRow label="Diagnosis" value={rx.diagnosis} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-4">Medicines</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {rx.medicines.map((m) => (
                    <Badge key={m.name} tone="mint">
                      <Pill className="size-3" /> {m.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-4">Follow-up Date</p>
                <p className="mt-1 text-sm font-semibold text-ink">{rx.followUp ? fmtDate(rx.followUp) : '—'}</p>
                {active && <p className="text-[11px] font-semibold text-brand-600">Active</p>}
              </div>
              <Btn size="sm" variant="secondary" onClick={() => setOpen(rx)}>
                View
              </Btn>
            </Card>
          );
        })}
      </div>
      <RxDrawer rx={open} onClose={() => setOpen(null)} />
    </Page>
  );
}

export function RxDrawer({ rx, onClose, patientName }: { rx: Rx | null; onClose: () => void; patientName?: string }) {
  const { profile } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({ contentRef: ref, documentTitle: rx ? `Prescription-${rx.id}` : 'Prescription' });
  return (
    <Drawer
      open={!!rx}
      onClose={onClose}
      title="Prescription"
      subtitle={rx ? `${rx.doctor} · ${fmtDate(rx.date)}` : ''}
      footer={
        <Btn onClick={() => print()} icon={<Printer className="size-4" />}>
          Print / Save PDF
        </Btn>
      }
    >
      {rx && (
        <div ref={ref} className="space-y-6 bg-white print:p-10">
          <div className="flex items-center justify-between border-b border-line-soft pb-4">
            <span className="flex items-center gap-2 font-display text-lg font-extrabold italic text-brand-700">
              <LogoMark className="size-5 text-brand-500" /> PREVNTIV
            </span>
            <span className="text-xs text-ink-3">Digital Prescription · #{rx.id}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Patient" value={patientName ?? profile?.full_name} />
            <InfoRow label="Doctor" value={`${rx.doctor}${rx.specialty ? ` (${rx.specialty})` : ''}`} />
            <InfoRow label="Diagnosis" value={rx.diagnosis} />
            <InfoRow label="Issued" value={fmtDate(rx.date)} />
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-4">℞ Medicines</p>
            <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft">
              {rx.medicines.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Pill className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{m.name}</p>
                    <p className="text-xs text-ink-3">{[m.dose, m.freq, m.duration].filter(Boolean).join(' · ') || 'As directed'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {rx.notes && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-4">Instructions</p>
              <p className="text-sm leading-relaxed text-ink-2">{rx.notes}</p>
            </div>
          )}
          {rx.followUp && (
            <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
              <CalendarClock className="size-4" /> Follow-up on {fmtDate(rx.followUp)}
            </p>
          )}
        </div>
      )}
    </Drawer>
  );
}

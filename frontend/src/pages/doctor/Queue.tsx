import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { AlertTriangle, Check, MessageSquare, User, Video } from 'lucide-react';
import { useListAppointments, useUpdateAppointmentStatus } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, CapsuleTabs, Card, DataTable, EmptyState, Kpi, Page, PageHeader, StatusPill, toneFor } from '@/components/kit';
import { QUEUE, type QueuePatient } from '@/data/demo';
import { mapAppt } from '@/data/mappers';
import { fmtDate } from '@/data/source';

const RISK_ORDER: Record<string, number> = { critical: 0, high: 1, moderate: 2, medium: 2, healthy: 3, low: 3 };

export default function DoctorQueue() {
  const { isDemo } = useAuth();
  const [, setLocation] = useLocation();
  const q = useListAppointments();
  const update = useUpdateAppointmentStatus();
  const [tab, setTab] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const base: (QueuePatient & { patientId?: number })[] = useMemo(() => {
    if (isDemo || !q.data) return QUEUE;
    return q.data.map(mapAppt).map((a) => ({
      id: a.id,
      name: a.patient ?? 'Patient',
      pid: a.patientHid ?? '—',
      age: 0,
      gender: 'F' as const,
      score: a.score ?? null,
      risk: a.risk ?? 'N/A',
      date: fmtDate(a.date),
      time: a.time,
      type: a.type,
      status: a.status,
      reason: a.reason,
      blood: '',
      patientId: a.patientId,
    }));
  }, [q.data, isDemo]);

  const rows = useMemo(
    () =>
      base
        .map((r) => ({ ...r, status: overrides[r.id] ?? r.status }))
        .filter((r) => tab === 'All' || (tab === 'Scheduled' ? ['Scheduled', 'Active'].includes(r.status) : r.status === tab))
        .sort((a, b) => (a.status === 'Cancelled' ? 1 : 0) - (b.status === 'Cancelled' ? 1 : 0) || (a.status === 'Completed' ? 1 : 0) - (b.status === 'Completed' ? 1 : 0) || (RISK_ORDER[a.risk.toLowerCase()] ?? 9) - (RISK_ORDER[b.risk.toLowerCase()] ?? 9)),
    [base, overrides, tab],
  );

  async function complete(r: QueuePatient) {
    setBusy(r.id);
    try {
      if (!isDemo) await update.mutateAsync({ id: r.id, status: 'completed' });
      setOverrides((o) => ({ ...o, [r.id]: 'Completed' }));
      toast.success(`Consultation with ${r.name} marked complete`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  const critical = base.filter((r) => /critical/i.test(r.risk) && r.status !== 'Completed').length;
  const ehrId = (r: QueuePatient & { patientId?: number }) => (r.patientId ? String(r.patientId) : r.id);
  const typeIcon = (t: string) => (/video/i.test(t) ? <Video className="size-4" /> : /tele|chat/i.test(t) ? <MessageSquare className="size-4" /> : <User className="size-4" />);

  return (
    <Page>
      <PageHeader title="Priority Queue" subtitle="Manage your daily consultations and patient timeline, prioritized by medical urgency." />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="In queue" value={base.filter((r) => ['Scheduled', 'Active'].includes(overrides[r.id] ?? r.status)).length} />
        <Kpi label="Critical" value={critical} tone={critical ? 'danger' : 'default'} icon={<AlertTriangle />} />
        <Kpi label="Completed" value={base.filter((r) => (overrides[r.id] ?? r.status) === 'Completed').length} icon={<Check />} />
        <Kpi label="Avg wait" value="12" unit="min" />
      </div>
      <CapsuleTabs className="mb-5" tabs={['All', 'Scheduled', 'Completed', 'Cancelled']} value={tab} onChange={setTab} />
      <Card className="overflow-hidden">
        {q.isError && !isDemo && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-[13px] text-red-700">{(q.error as Error).message}</p>}
        <DataTable
          loading={!isDemo && q.isLoading}
          rows={rows}
          rowKey={(r) => r.id}
          rowClassName={(r) => (/critical/i.test(r.risk) && r.status !== 'Completed' ? 'bg-red-50/50' : undefined)}
          empty={<EmptyState title="Queue is clear" description="No consultations in this view." />}
          columns={[
            { key: 'p', header: 'Patient', cell: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} size={36} /><div><p className="font-semibold text-ink">{r.name}</p><p className="font-mono text-[11px] text-ink-3">{r.pid}</p></div></div> },
            { key: 'sc', header: 'Health Score', align: 'center', cell: (r) => <span className="num font-display text-lg font-bold" style={{ color: r.score == null ? '#94a3b8' : r.score >= 80 ? '#029c6b' : r.score >= 60 ? '#d97706' : '#dc2626' }}>{r.score ?? '--'}</span> },
            { key: 'risk', header: 'Risk Level', cell: (r) => <Badge tone={toneFor(r.risk === 'Healthy' ? 'healthy' : r.risk)} upper>{r.risk}</Badge> },
            { key: 'dt', header: 'Date & Time', hideOnMobile: true, cell: (r) => <><p className="whitespace-nowrap text-ink-2">{r.date}</p><p className="text-xs font-semibold text-ink">{r.time}</p></> },
            { key: 't', header: 'Type', hideOnMobile: true, cell: (r) => <span className="inline-flex items-center gap-1.5 text-ink-2">{typeIcon(r.type)} {r.type}</span> },
            { key: 's', header: 'Status', cell: (r) => <StatusPill status={r.status} /> },
            { key: 'r', header: 'Reason', hideOnMobile: true, cell: (r) => <span className="line-clamp-2 max-w-[200px] text-[13px]">{r.reason}</span> },
            {
              key: 'a',
              header: 'Action',
              align: 'right',
              cell: (r) =>
                r.status === 'Active' ? (
                  <Btn size="xs" onClick={() => setLocation('/doctor/chat')} icon={<Video className="size-3.5" />}>
                    Start Consult
                  </Btn>
                ) : r.status === 'Scheduled' ? (
                  <div className="flex justify-end gap-1.5">
                    <Btn size="xs" variant="secondary" loading={busy === r.id} onClick={() => complete(r)}>
                      Complete
                    </Btn>
                    <Btn size="xs" variant="outline" href={`/doctor/patients/${ehrId(r)}`}>
                      View EHR
                    </Btn>
                  </div>
                ) : r.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    <Check className="size-3.5" /> Completed
                  </span>
                ) : (
                  <Btn size="xs" variant="ghost" href={`/doctor/patients/${ehrId(r)}`}>
                    Details
                  </Btn>
                ),
            },
          ]}
        />
      </Card>
    </Page>
  );
}

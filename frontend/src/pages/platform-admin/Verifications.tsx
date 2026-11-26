import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Check, FlaskConical, ShieldCheck, Stethoscope, X } from 'lucide-react';
import { useApproveApplication, useListPendingApplications, useRejectApplication } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, Card, Chip, DataTable, Drawer, EmptyState, InfoRow, Modal, Page, PageHeader, SearchInput } from '@/components/kit';
import { APPLICATIONS } from '@/data/demo';
import { fmtDate } from '@/data/source';

type App = (typeof APPLICATIONS)[number];
const ROLE: Record<string, { l: string; i: typeof Stethoscope; tone: 'green' | 'blue' | 'violet' }> = {
  doctor: { l: 'Doctor', i: Stethoscope, tone: 'green' },
  lab_admin: { l: 'Lab Admin', i: FlaskConical, tone: 'violet' },
  hospital_admin: { l: 'Hospital Admin', i: Building2, tone: 'blue' },
};

function mapApp(a: any): App {
  let d: any = {};
  try {
    d = typeof a.details === 'string' ? JSON.parse(a.details) : a.details ?? {};
  } catch {
    /* ignore */
  }
  const created = new Date(a.created_at);
  return {
    id: String(a.id),
    name: a.full_name,
    email: a.email,
    mobile: a.mobile,
    role: a.role,
    title: d.specialization ?? d.labName ?? d.hospitalName ?? '—',
    detail: a.role === 'doctor' ? `${d.qualification ?? ''} (${d.yearsOfExperience ?? 0} yrs exp)` : a.role === 'hospital_admin' ? `Facility Capacity: ${d.totalBeds ?? '—'} Beds` : d.address ?? '',
    reg: d.licenseNumber ?? d.registrationNumber ?? '—',
    date: fmtDate(created),
    time: created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function AdminVerifications() {
  const { isDemo } = useAuth();
  const q = useListPendingApplications({ status: 'pending' });
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const [done, setDone] = useState<Record<string, 'approved' | 'rejected'>>({});
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [view, setView] = useState<App | null>(null);
  const [confirm, setConfirm] = useState<{ app: App; action: 'approve' | 'reject' } | null>(null);
  const all = isDemo || !q.data ? APPLICATIONS : q.data.map(mapApp);
  const pending = all.filter((a) => !done[a.id]);
  const rows = useMemo(() => pending.filter((a) => (role === 'all' || a.role === role) && [a.name, a.email, a.reg, a.title].join(' ').toLowerCase().includes(search.toLowerCase())), [pending, role, search]);

  async function act() {
    if (!confirm) return;
    const { app, action } = confirm;
    try {
      if (!isDemo) await (action === 'approve' ? approve : reject).mutateAsync(app.id);
      setDone((d) => ({ ...d, [app.id]: action === 'approve' ? 'approved' : 'rejected' }));
      if (action === 'approve') toast.success('Verification Approved', { description: `${app.name} has been successfully added to the network.` });
      else toast(`Application from ${app.name} rejected`);
      setConfirm(null);
      setView(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Pending Verifications"
        subtitle="Review and approve applications to join the Prevntiv network."
        actions={
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2">
            <span className="num font-display text-2xl font-bold text-amber-700">{pending.length}</span>
            <span className="text-xs font-semibold leading-tight text-amber-800">
              Awaiting
              <br />
              Action
            </span>
          </div>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line-soft p-4 lg:flex-row lg:items-center">
          <SearchInput className="lg:w-96" value={search} onChange={setSearch} placeholder="Search by name, email, or license..." />
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            {[['all', 'All Roles'], ['doctor', 'Doctor'], ['lab_admin', 'Lab Admin'], ['hospital_admin', 'Hospital Admin']].map(([k, l]) => (
              <Chip key={k} size="sm" selected={role === k} onClick={() => setRole(k)}>
                {l}
              </Chip>
            ))}
          </div>
        </div>
        {q.isError && !isDemo && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-[13px] text-red-700">{(q.error as Error).message}</p>}
        <DataTable
          loading={!isDemo && q.isLoading}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={setView}
          empty={<EmptyState icon={<ShieldCheck />} title="All caught up" description="There are no applications waiting for review." />}
          columns={[
            { key: 'a', header: 'Applicant Details', cell: (a) => <div className="flex items-center gap-3"><Avatar name={a.name} size={38} /><div className="min-w-0"><p className="font-semibold text-ink">{a.name}</p><p className="truncate text-xs text-ink-3">{a.email}</p><p className="text-xs text-ink-4">{a.mobile}</p></div></div> },
            { key: 'r', header: 'Applied Role', cell: (a) => { const r = ROLE[a.role] ?? ROLE.doctor; return <Badge tone={r.tone}><r.i className="size-3.5" /> {r.l}</Badge>; } },
            { key: 'p', header: 'Professional Details', hideOnMobile: true, cell: (a) => <div className="max-w-[260px]"><p className="font-medium text-ink">{a.title}</p><p className="truncate text-xs text-ink-3">{a.detail}</p><p className="font-mono text-[11px] text-ink-4">{a.reg}</p></div> },
            { key: 'd', header: 'Submission Date', hideOnMobile: true, cell: (a) => <><p className="whitespace-nowrap text-ink-2">{a.date}</p><p className="text-xs text-ink-3">{a.time}</p></> },
            {
              key: 'x',
              header: 'Actions',
              align: 'right',
              cell: (a) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setConfirm({ app: a, action: 'reject' })} className="inline-flex size-9 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100" aria-label={`Reject ${a.name}`}>
                    <X className="size-4" />
                  </button>
                  <button onClick={() => setConfirm({ app: a, action: 'approve' })} className="inline-flex size-9 items-center justify-center rounded-full bg-brand-700 text-white shadow-sm transition-colors hover:bg-brand-600" aria-label={`Approve ${a.name}`}>
                    <Check className="size-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        open={!!view}
        onClose={() => setView(null)}
        title={view?.name ?? ''}
        subtitle={view ? `${ROLE[view.role]?.l} application · ${view.date}` : ''}
        footer={
          view && (
            <>
              <Btn variant="danger-soft" onClick={() => setConfirm({ app: view, action: 'reject' })}>
                Reject
              </Btn>
              <Btn onClick={() => setConfirm({ app: view, action: 'approve' })} icon={<Check className="size-4" />}>
                Approve
              </Btn>
            </>
          )
        }
      >
        {view && (
          <div className="grid grid-cols-2 gap-5">
            <InfoRow label="Email" value={view.email} />
            <InfoRow label="Mobile" value={view.mobile} />
            <InfoRow label={view.role === 'doctor' ? 'Specialization' : 'Organisation'} value={view.title} />
            <InfoRow label="License / Registration" value={view.reg} />
            <InfoRow label="Details" value={view.detail} className="col-span-2" />
          </div>
        )}
      </Drawer>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        icon={
          confirm?.action === 'approve' ? (
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-700"><ShieldCheck className="size-6" /></span>
          ) : (
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600"><X className="size-6" /></span>
          )
        }
        title={confirm?.action === 'approve' ? `Approve ${confirm?.app.name}?` : `Reject ${confirm?.app.name}?`}
        description={confirm?.action === 'approve' ? 'An account will be created and login details emailed to the applicant.' : 'The applicant will be notified that their application was not approved.'}
        footer={
          <>
            <Btn variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Btn>
            <Btn variant={confirm?.action === 'approve' ? 'primary' : 'danger'} loading={approve.isPending || reject.isPending} onClick={act}>
              {confirm?.action === 'approve' ? 'Approve' : 'Reject'}
            </Btn>
          </>
        }
      />
    </Page>
  );
}

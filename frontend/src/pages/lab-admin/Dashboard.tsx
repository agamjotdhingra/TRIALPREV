import { useState } from 'react';
import { Link } from 'wouter';
import { AlertTriangle, ArrowRight, FileUp, ScanSearch, Users } from 'lucide-react';
import { useListReports } from '@/api/hooks';
import { Card, CardHeader, DataTable, Page, PageHeader, StatusPill, Avatar } from '@/components/kit';
import { LAB_REPORTS, type LabReport } from '@/data/demo';
import { mapReport } from '@/data/mappers';
import { fmtDate, useSource } from '@/data/source';
import { ReportDrawer } from '@/pages/patient/Reports';

export default function LabDashboard() {
  const src = useSource(useListReports(), LAB_REPORTS, mapReport);
  const [open, setOpen] = useState<LabReport | null>(null);
  const total = src.isDemo ? 1248 : src.rows.length;
  const critical = src.rows.filter((r) => r.status === 'Critical');
  const patients = src.isDemo ? 3892 : new Set(src.rows.map((r) => r.patientId)).size;
  const byType = src.isDemo
    ? [
        { l: 'Hematology', v: 412 },
        { l: 'Biochemistry', v: 528 },
        { l: 'Radiology', v: 184 },
        { l: 'Pathology', v: 124 },
      ]
    : Object.entries(src.rows.reduce<Record<string, number>>((a, r) => ({ ...a, [r.category]: (a[r.category] ?? 0) + 1 }), {})).map(([l, v]) => ({ l, v }));
  const max = Math.max(1, ...byType.map((b) => b.v));

  return (
    <Page>
      <PageHeader title="Lab Admin Dashboard" subtitle={`Last updated: Today, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`} />
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-3xl btn-gradient p-7 text-white shadow-lift lg:col-span-8">
          <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-xl" />
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Total Reports Published</p>
          <p className="num mt-2 font-display text-6xl font-extrabold">{total.toLocaleString('en-IN')}</p>
          <p className="mb-4 mt-8 text-sm font-semibold text-white/85">Reports by Test Type</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {byType.map((b) => (
              <div key={b.l}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-white/80">{b.l}</span>
                  <span className="num font-bold">{b.v}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white" style={{ width: `${(b.v / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:col-span-4">
          <Link href="/lab/reports?status=Critical" className="card group flex items-start justify-between border-red-100 bg-gradient-to-br from-white to-red-50/70 p-6 transition-shadow hover:shadow-lift">
            <div>
              <p className="text-[13px] font-medium text-ink-3">Critical Reports</p>
              <p className="num mt-1 font-display text-4xl font-bold text-red-600">{src.isDemo ? 24 : critical.length}</p>
              <p className="mt-1 text-xs font-semibold text-red-600">Requires immediate review</p>
            </div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="size-5" />
            </span>
          </Link>
          <Card className="flex items-start justify-between p-6">
            <div>
              <p className="text-[13px] font-medium text-ink-3">Patients Served</p>
              <p className="num mt-1 font-display text-4xl font-bold text-ink">{patients.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs text-ink-3">Unique ABHA IDs</p>
            </div>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Users className="size-5" />
            </span>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-12">
          {[
            { href: '/lab/search', t: 'Search Patient by Health ID', s: 'Look up a patient before publishing results', i: ScanSearch },
            { href: '/lab/upload', t: 'Upload New Report', s: 'Attach findings and flag critical values', i: FileUp },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="card group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                <a.i className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-ink">{a.t}</span>
                <span className="block text-xs text-ink-3">{a.s}</span>
              </span>
              <ArrowRight className="size-5 text-ink-4 transition-transform group-hover:translate-x-1 group-hover:text-brand-700" />
            </Link>
          ))}
        </div>

        <Card className="overflow-hidden lg:col-span-12">
          <CardHeader title="Recent Reports" action={<Link href="/lab/reports" className="text-[13px] font-semibold text-brand-700 hover:underline">View All</Link>} />
          <DataTable
            className="mt-5"
            loading={src.loading}
            rows={src.rows.slice(0, 5)}
            rowKey={(r) => r.id}
            onRowClick={setOpen}
            rowClassName={(r) => (r.status === 'Critical' ? 'bg-red-50/40' : undefined)}
            columns={[
              { key: 'n', header: 'Report Name', cell: (r) => <><p className="font-semibold text-ink">{r.name}</p><p className="font-mono text-[11px] text-ink-3">ID: {r.id}</p></> },
              { key: 'p', header: 'Patient Name', cell: (r) => <div className="flex items-center gap-2.5"><Avatar name={r.patient} size={30} /><span className="text-ink-2">{r.patient}</span></div> },
              { key: 'c', header: 'Category', hideOnMobile: true, cell: (r) => r.category },
              { key: 'd', header: 'Date', hideOnMobile: true, cell: (r) => fmtDate(r.date) },
              { key: 's', header: 'Status', cell: (r) => <StatusPill status={r.status} /> },
            ]}
          />
        </Card>
      </div>
      <ReportDrawer report={open} onClose={() => setOpen(null)} showPatient />
    </Page>
  );
}

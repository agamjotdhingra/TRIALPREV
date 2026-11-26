import { useState } from 'react';
import { Link } from 'wouter';
import { Activity, AlertTriangle, ArrowRight, Building2, CalendarCheck, Download, FileText, FlaskConical, ShieldCheck, Stethoscope, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useGetAuditLogs, useGetDashboardStats, useGetRecentActivity, useGetRiskDistribution } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Badge, Btn, Callout, Card, CardHeader, DataTable, Donut, Drawer, Page, PageHeader, Progress } from '@/components/kit';
import { TrendChart } from '@/components/kit/charts';
import { AUDIT } from '@/data/demo';

const REGIONS = [
  { s: 'Maharashtra', p: 4280, h: 42, l: 38, d: 215 },
  { s: 'Karnataka', p: 3150, h: 31, l: 28, d: 184 },
  { s: 'Delhi NCR', p: 2820, h: 24, l: 22, d: 168 },
  { s: 'Tamil Nadu', p: 2230, h: 18, l: 16, d: 124 },
];
const VOLUME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((t, i) => ({ t, v: [1240, 1385, 1520, 1610, 1702, 1842][i] }));
const TURNAROUND = [
  { l: 'Doctors', v: 14 },
  { l: 'Hospitals', v: 22 },
  { l: 'Labs', v: 18 },
  { l: 'Patients', v: 2 },
];
const FEED = [
  { t: 'New hospital onboarded: Apollo Speciality', w: '2 mins ago', i: Building2, c: 'bg-brand-50 text-brand-700' },
  { t: 'Dr. Vikram Singh verified', w: '15 mins ago', i: UserCheck, c: 'bg-sky-50 text-sky-700' },
  { t: 'Critical risk alert: Meenakshi Iyer', w: '45 mins ago', i: AlertTriangle, c: 'bg-red-50 text-red-600' },
  { t: '54 new lab reports published', w: '1 hour ago', i: FlaskConical, c: 'bg-violet-50 text-violet-700' },
  { t: 'Weekly report generated', w: '2 hours ago', i: FileText, c: 'bg-slate-100 text-ink-2' },
];
const RISK_COLORS: Record<string, string> = { healthy: '#029c6b', moderate: '#f59e0b', high: '#f97316', critical: '#ef4444' };

export default function AdminDashboard() {
  const { isDemo } = useAuth();
  const statsQ = useGetDashboardStats();
  const riskQ = useGetRiskDistribution();
  const actQ = useGetRecentActivity();
  const auditQ = useGetAuditLogs();
  const [auditOpen, setAuditOpen] = useState(false);
  const s = isDemo || !statsQ.data ? { pendingVerifications: 42, totalPatients: 12480, totalDoctors: 842, totalLabs: 156, totalHospitals: 98, criticalPatients: 214, todayAppointments: 1842, totalReports: 45210 } : statsQ.data;
  const risk = isDemo || !riskQ.data?.length ? [{ riskLevel: 'healthy', count: 7488 }, { riskLevel: 'moderate', count: 3120 }, { riskLevel: 'high', count: 1248 }, { riskLevel: 'critical', count: 624 }] : riskQ.data;
  const riskTotal = risk.reduce((a: number, r: any) => a + r.count, 0) || 1;
  const feed = isDemo || !actQ.data?.length ? FEED : actQ.data.map((a: any) => ({ t: `${a.description}: ${a.entityName}`, w: new Date(a.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), i: a.type === 'doctor' ? Stethoscope : a.type === 'report' ? FlaskConical : a.type === 'appointment' ? CalendarCheck : Users, c: 'bg-brand-50 text-brand-700' }));
  const audit = isDemo || !auditQ.data
    ? AUDIT
    : auditQ.data.map((l: any) => ({ id: String(l.id), time: new Date(l.created_at ?? l.accessed_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), operator: l.operator?.full_name ?? '—', role: (l.operator?.role ?? '').replace(/_/g, ' '), patient: l.patients?.full_name ?? `Patient #${l.patient_id}`, pid: l.patients?.health_id ?? '', action: (l.action ?? '').replace(/^./, (c: string) => c.toUpperCase()) }));
  const fmt = (n: number) => n.toLocaleString('en-IN');

  const downloadRegions = () => {
    const csv = ['State/Region,Total Patients,Hospitals,Labs,Active Doctors', ...REGIONS.map((r) => [r.s, r.p, r.h, r.l, r.d].join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'prevntiv-regional-operations.csv';
    a.click();
  };

  return (
    <Page width="full">
      <PageHeader title="Platform Admin Dashboard" subtitle="Network health, verification pipeline and EHR access across Prevntiv." />

      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <div className="relative flex flex-col overflow-hidden rounded-3xl btn-gradient p-7 text-white shadow-lift">
          <div aria-hidden className="absolute -right-16 -top-16 size-60 rounded-full bg-white/10 blur-xl" />
          <ShieldCheck className="size-7 text-brand-200" />
          <p className="mt-5 text-sm font-medium text-white/80">Pending Verifications</p>
          <p className="num font-display text-6xl font-extrabold">{s.pendingVerifications}</p>
          <p className="mt-1 text-sm text-white/75">Requires immediate review</p>
          <Btn href="/admin/verifications" className="mt-auto self-start bg-white! bg-none text-brand-800 hover:bg-brand-50!" iconRight={<ArrowRight className="size-4" />}>
            Review Now
          </Btn>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { l: 'Total Patients', v: s.totalPatients, i: Users, href: '/admin/patients' },
            { l: 'Total Doctors', v: s.totalDoctors, i: Stethoscope, href: '/admin/doctors' },
            { l: 'Total Labs', v: s.totalLabs, i: FlaskConical, href: '/admin/labs' },
            { l: 'Total Hospitals', v: s.totalHospitals, i: Building2, href: '/admin/hospitals' },
            { l: 'Critical Patients', v: s.criticalPatients, i: AlertTriangle, danger: true, href: '/admin/patients' },
            { l: "Today's Appointments", v: s.todayAppointments, i: CalendarCheck },
            { l: 'Total Reports', v: s.totalReports, i: FileText },
            { l: 'Avg. Health Score', v: 74, i: Activity },
          ].map((k) => {
            const body = (
              <>
                <span className={`inline-flex size-9 items-center justify-center rounded-xl ${k.danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'}`}>
                  <k.i className="size-[18px]" />
                </span>
                <p className="mt-3 text-xs text-ink-3">{k.l}</p>
                <p className={`num font-display text-2xl font-bold ${k.danger ? 'text-red-600' : 'text-ink'}`}>{fmt(k.v ?? 0)}</p>
              </>
            );
            return k.href ? (
              <Link key={k.l} href={k.href} className="card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                {body}
              </Link>
            ) : (
              <Card key={k.l} className="p-4">
                {body}
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Regional Operations" subtitle="Network footprint by state" action={<Btn size="sm" variant="outline" onClick={downloadRegions} icon={<Download className="size-4" />}>Download Report</Btn>} />
          <DataTable
            className="mt-5"
            rows={REGIONS}
            rowKey={(r) => r.s}
            columns={[
              { key: 's', header: 'State/Region', cell: (r) => <span className="font-semibold text-ink">{r.s}</span> },
              { key: 'p', header: 'Total Patients', align: 'right', cell: (r) => <span className="num">{fmt(r.p)}</span> },
              { key: 'h', header: 'Hospitals', align: 'right', cell: (r) => <span className="num">{r.h}</span> },
              { key: 'l', header: 'Labs', align: 'right', cell: (r) => <span className="num">{r.l}</span> },
              { key: 'd', header: 'Active Doctors', align: 'right', cell: (r) => <span className="num">{r.d}</span> },
            ]}
          />
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-[15px] font-bold text-ink">Patient Risk Distribution</h3>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
            <Donut size={168} thickness={22} segments={risk.map((r: any) => ({ value: r.count, color: RISK_COLORS[r.riskLevel] ?? '#94a3b8', label: r.riskLevel }))}>
              <span className="text-[11px] font-semibold text-ink-3">Total</span>
              <span className="num font-display text-2xl font-bold text-ink">{fmt(riskTotal)}</span>
            </Donut>
            <ul className="w-full space-y-3">
              {risk.map((r: any) => (
                <li key={r.riskLevel} className="flex items-center gap-3 text-sm">
                  <span className="size-3 rounded-full" style={{ background: RISK_COLORS[r.riskLevel] }} />
                  <span className="flex-1 capitalize text-ink-2">{r.riskLevel}</span>
                  <span className="num font-semibold text-ink">{Math.round((r.count / riskTotal) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">System Performance Trends</h3>
            <p className="flex items-center gap-1.5 text-sm text-ink-3">
              <TrendingUp className="size-4 text-brand-600" /> Error rate 4.2% average — down 0.8% from last month
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-ink-2">Appointment Volume (Last 6 Months)</p>
            <TrendChart type="bar" data={VOLUME} xKey="t" series={[{ key: 'v', name: 'Appointments' }]} height={220} />
          </div>
          <div>
            <p className="mb-5 text-sm font-semibold text-ink-2">Verification Turnaround Time (Avg. Hours)</p>
            <div className="space-y-4">
              {TURNAROUND.map((t) => (
                <div key={t.l} className="grid grid-cols-[80px_1fr_40px] items-center gap-3 text-sm">
                  <span className="text-ink-2">{t.l}</span>
                  <Progress value={(t.v / 24) * 100} tone={t.v > 20 ? 'amber' : 'green'} height={10} />
                  <span className="num text-right font-semibold text-ink">{t.v}h</span>
                </div>
              ))}
            </div>
            <Callout tone="green" icon={<TrendingUp />} title="Efficiency Peak" className="mt-6">
              System processing speed has increased by 12% this quarter due to automated lab verification workflows.
            </Callout>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="EHR Access Audit Trail" subtitle="Every view, export and update of patient records" action={<button onClick={() => setAuditOpen(true)} className="text-[13px] font-semibold text-brand-700 hover:underline">View All</button>} />
          <AuditTable rows={audit.slice(0, 5)} loading={!isDemo && auditQ.isLoading} />
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-display text-[15px] font-bold text-ink">Recent Activity Feed</h3>
          <ol className="space-y-4">
            {feed.map((f: any, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${f.c}`}>
                  <f.i className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{f.t}</p>
                  <p className="text-xs text-ink-3">{f.w}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Drawer open={auditOpen} onClose={() => setAuditOpen(false)} title="EHR Access Audit Trail" subtitle={`${audit.length} events`}>
        <div className="-mx-6">
          <AuditTable rows={audit} />
        </div>
      </Drawer>
    </Page>
  );
}

function AuditTable({ rows, loading }: { rows: typeof AUDIT; loading?: boolean }) {
  return (
    <DataTable
      className="mt-5"
      loading={loading}
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        { key: 't', header: 'Time', cell: (r) => <span className="whitespace-nowrap text-xs">{r.time}</span> },
        { key: 'o', header: 'Operator', cell: (r) => <><p className="font-semibold text-ink">{r.operator}</p><p className="text-xs capitalize text-ink-3">{r.role}</p></> },
        { key: 'p', header: 'Patient', cell: (r) => <><p className="text-ink-2">{r.patient}</p><p className="font-mono text-[11px] text-ink-3">{r.pid}</p></> },
        { key: 'a', header: 'Action', cell: (r) => <Badge tone={r.action === 'Export' ? 'amber' : r.action === 'Update' ? 'blue' : 'green'}>{r.action}</Badge> },
      ]}
    />
  );
}

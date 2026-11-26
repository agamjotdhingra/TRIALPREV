import { Link } from 'wouter';
import { AlertTriangle, ArrowRight, BedDouble, HeartPulse, Stethoscope, UserPlus, Users } from 'lucide-react';
import { useGetHospitalOverview, useListAdmissions, useListWards } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, Card, CardHeader, DataTable, Page, Progress, StatusPill } from '@/components/kit';
import { ADMISSIONS, WARDS } from '@/data/demo';
import { useSource } from '@/data/source';

export default function HospitalDashboard() {
  const { isDemo, entityId } = useAuth();
  const ov = useGetHospitalOverview(isDemo ? null : entityId);
  const wards = useSource(useListWards(), WARDS, (w: any) => ({ id: String(w.id), name: w.name, type: w.ward_type ?? '—', occupied: w.occupied_beds ?? 0, capacity: w.total_beds ?? 0 }));
  const adm = useSource(useListAdmissions(), ADMISSIONS, (a: any) => ({ id: String(a.id), patient: a.patients?.full_name ?? 'Patient', reason: a.admission_reason ?? '', status: (a.status ?? '').replace(/^./, (c: string) => c.toUpperCase()), date: a.admission_date }));

  const o = isDemo || !ov.data ? { totalBeds: 160, occupiedBeds: 142, totalAdmitted: 142, icuPatients: 18, doctorsOnDuty: 42, nursesOnDuty: 86, availableBeds: 18 } : ov.data;
  const pct = o.totalBeds ? Math.round((o.occupiedBeds / o.totalBeds) * 100) : 0;
  const level = pct >= 85 ? 'Critical Level' : pct >= 70 ? 'High' : 'Normal';
  const icu = wards.rows.find((w) => /icu|intensive/i.test(w.name + w.type));

  return (
    <Page>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-[32px] font-bold leading-tight text-ink">
            Command <span className="text-brand-600">Center</span>
          </h1>
          <p className="mt-1 text-sm text-ink-3">Overview of hospital operations for {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2.5">
          <Btn variant="outline" href="/hospital/beds" icon={<BedDouble className="size-4" />}>
            Bed Roster
          </Btn>
          <Btn href="/hospital/admissions?new=1" icon={<UserPlus className="size-4" />}>
            New Admission
          </Btn>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="relative overflow-hidden rounded-3xl btn-gradient p-7 text-white shadow-lift">
          <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-xl" />
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Occupied Beds</p>
          <p className="mt-3 font-display text-6xl font-extrabold num">
            {o.occupiedBeds}
            <span className="text-2xl font-semibold text-white/60"> / {o.totalBeds}</span>
          </p>
          <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold">{pct}% Capacity</span>
            <span className={pct >= 85 ? 'inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-xs font-bold' : 'text-white/80'}>
              {pct >= 85 && <AlertTriangle className="size-3.5" />} {level}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Stat icon={<Users />} label="Admitted Patients" value={o.totalAdmitted} sub={`${o.availableBeds ?? o.totalBeds - o.occupiedBeds} beds available`} />
          <Stat icon={<HeartPulse />} label="ICU Patients" value={o.icuPatients} sub={icu ? `${icu.capacity - icu.occupied} beds remaining` : 'ICU monitored'} danger={!!icu && icu.capacity - icu.occupied <= 2} />
          <Stat icon={<Stethoscope />} label="On Duty — Doctors" value={o.doctorsOnDuty} sub="Across all wards" />
          <Stat icon={<Users />} label="On Duty — Nurses" value={o.nursesOnDuty} sub={`1 : ${Math.max(1, Math.round(o.totalAdmitted / Math.max(1, o.nursesOnDuty)))} nurse–patient ratio`} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Ward Occupancy" subtitle="Live capacity by ward" action={<Link href="/hospital/wards" className="text-[13px] font-semibold text-brand-700 hover:underline">Manage wards</Link>} />
          <DataTable
            className="mt-5"
            loading={wards.loading}
            rows={wards.rows.slice(0, 6)}
            rowKey={(w) => w.id}
            columns={[
              { key: 'n', header: 'Ward Name', cell: (w) => <span className="font-semibold text-ink">{w.name}</span> },
              { key: 't', header: 'Type', hideOnMobile: true, cell: (w) => w.type },
              { key: 'o', header: 'Occupancy', cell: (w) => <span className="num">{w.occupied}/{w.capacity} <span className="text-ink-4">({w.capacity ? Math.round((w.occupied / w.capacity) * 100) : 0}%)</span></span> },
              { key: 'c', header: 'Capacity Status', cell: (w) => { const p = w.capacity ? (w.occupied / w.capacity) * 100 : 0; return <div className="flex w-40 items-center gap-2"><Progress value={p} height={6} /><Badge tone={p >= 90 ? 'red' : p >= 75 ? 'amber' : 'green'}>{p >= 90 ? 'Critical' : p >= 75 ? 'High' : 'Normal'}</Badge></div>; } },
            ]}
          />
        </Card>
        <Card>
          <CardHeader title="Recent Admissions" action={<Link href="/hospital/admissions" className="text-[13px] font-semibold text-brand-700 hover:underline">View all</Link>} />
          <div className="divide-y divide-line-soft px-5 pb-3 pt-3 sm:px-6">
            {adm.rows.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <Avatar name={a.patient} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{a.patient}</p>
                  <p className="truncate text-xs text-ink-3">{a.reason}</p>
                </div>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
          <Link href="/hospital/admissions" className="flex items-center justify-center gap-1.5 border-t border-line-soft py-3.5 text-[13px] font-semibold text-brand-700 hover:bg-brand-50/40">
            Open admissions census <ArrowRight className="size-3.5" />
          </Link>
        </Card>
      </div>
    </Page>
  );
}

function Stat({ icon, label, value, sub, danger }: { icon: React.ReactNode; label: string; value: number; sub: string; danger?: boolean }) {
  return (
    <Card className={danger ? 'border-red-100 bg-gradient-to-br from-white to-red-50/60 p-5' : 'p-5'}>
      <span className={`inline-flex size-9 items-center justify-center rounded-xl [&_svg]:size-[18px] ${danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'}`}>{icon}</span>
      <p className="mt-4 text-[13px] text-ink-3">{label}</p>
      <p className="num font-display text-3xl font-bold text-ink">{value}</p>
      <p className={`mt-1 text-xs ${danger ? 'font-semibold text-red-600' : 'text-ink-3'}`}>{sub}</p>
    </Card>
  );
}

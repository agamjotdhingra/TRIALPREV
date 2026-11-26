import { Link } from 'wouter';
import { Activity, ArrowRight, CalendarDays, CalendarPlus, CreditCard, Droplets, FileText, FlaskConical, Footprints, HeartPulse, MessageCircle, Stethoscope, Thermometer, Video, Wallet } from 'lucide-react';
import { useGetPatientMe, useListAppointments, useListReports } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Badge, Btn, Card, CardHeader, Page, ScoreRing, StatusPill } from '@/components/kit';
import { APPOINTMENTS, INVOICES, LAB_REPORTS, ME } from '@/data/demo';
import { fmtDate, parseList, useSource } from '@/data/source';
import { mapAppt, mapReport } from '@/data/mappers';
import { cn } from '@/lib/utils';

const VITALS = [
  { key: 'heart-rate', label: 'Heart Rate', value: '72', unit: 'bpm', icon: HeartPulse, tone: 'text-rose-500 bg-rose-50', status: 'Normal' },
  { key: 'activity', label: 'Calories Burnt', value: '482', unit: 'kcal', icon: Footprints, tone: 'text-orange-500 bg-orange-50', status: 'Good' },
  { key: 'spo2', label: 'SpO₂', value: '98', unit: '%', icon: Droplets, tone: 'text-sky-500 bg-sky-50', status: 'Optimal' },
  { key: 'temperature', label: 'Temperature', value: '98.6', unit: '°F', icon: Thermometer, tone: 'text-amber-500 bg-amber-50', status: 'Normal' },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function PatientDashboard() {
  const { profile, isDemo } = useAuth();
  const me = useGetPatientMe();
  const patient = isDemo ? null : me.data;
  const name = (patient?.full_name ?? profile?.full_name ?? ME.name).split(' ')[0];
  const score = patient?.health_score ?? ME.score;
  const conditions = patient ? parseList(patient.existing_diseases).concat(parseList(patient.chronic_diseases)) : [...ME.conditions, ...ME.allergies.map((a) => `${a} Allergy`)];

  const appts = useSource(useListAppointments(), APPOINTMENTS, mapAppt);
  const upcoming = appts.rows.filter((a) => a.status === 'Scheduled');
  const next = upcoming[0];

  const reports = useSource(useListReports(), LAB_REPORTS.filter((r) => r.patient === 'Priya Sharma'), mapReport);

  const due = INVOICES.filter((i) => i.status === 'Due').reduce((a, i) => a + i.amount, 0);

  return (
    <Page>
      {/* Status banner */}
      <section className="relative overflow-hidden rounded-3xl btn-gradient px-6 py-7 text-white shadow-lift sm:px-9">
        <div aria-hidden className="absolute -right-16 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="absolute bottom-[-6rem] right-40 size-56 rounded-full bg-brand-300/20 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm text-white/75">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="mt-1 font-display text-[28px] font-bold sm:text-[32px]">
              {greeting()}, {name}
            </h1>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-white/85">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-200 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-200" />
              </span>
              Your vitals look optimal today — all wearables synced 4 min ago.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Btn href="/patient/appointments?book=1" className="bg-white! bg-none text-brand-800 hover:bg-brand-50!" icon={<CalendarPlus className="size-4" />}>
              Book Appointment
            </Btn>
            <Btn href="/patient/chat" variant="ghost" className="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20 hover:text-white" icon={<MessageCircle className="size-4" />}>
              Message Doctor
            </Btn>
          </div>
        </div>
      </section>

      {/* Health snapshot strip */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="flex items-center gap-5 p-5">
          <ScoreRing score={score} size={112} thickness={10} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3">Health Score</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">{score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs attention'}</p>
            <p className="mt-0.5 text-xs text-ink-3">+3 since last month</p>
            <Link href="/patient/health" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline">
              View breakdown <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {VITALS.map((v) => (
            <Link key={v.key} href={`/patient/vitals/${v.key}`} className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-center justify-between">
                <span className={cn('inline-flex size-9 items-center justify-center rounded-xl', v.tone)}>
                  <v.icon className="size-[18px]" />
                </span>
                <ArrowRight className="size-4 text-ink-4 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </div>
              <p className="mt-4 text-xs font-medium text-ink-3">{v.label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink num">
                {v.value} <span className="text-sm font-medium text-ink-3">{v.unit}</span>
              </p>
              <Badge tone="green" className="mt-2">{v.status}</Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Bento */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Appointments */}
        <Card className="flex flex-col">
          <CardHeader title="Appointments" subtitle={`${upcoming.length} upcoming`} icon={<CalendarDays className="size-[18px]" />} action={<Link href="/patient/appointments" className="text-[13px] font-semibold text-brand-700 hover:underline">View all</Link>} />
          <div className="flex-1 space-y-3 p-5 sm:p-6">
            {next ? (
              <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white p-4 ring-1 ring-brand-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
                      <Stethoscope className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{isDemo ? 'Dr. Ananya Sharma' : next.doctor}</p>
                      <p className="text-xs text-ink-3">{next.specialty || 'Consultation'}</p>
                    </div>
                  </div>
                  <Badge tone="blue">{next.type}</Badge>
                </div>
                <p className="mt-4 text-sm font-semibold text-ink-2">
                  {fmtDate(next.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {next.time}
                </p>
                <div className="mt-4 flex gap-2">
                  <Btn size="sm" href="/patient/chat" icon={<Video className="size-3.5" />}>
                    Join call
                  </Btn>
                  <Btn size="sm" variant="outline" href="/patient/appointments">
                    Reschedule
                  </Btn>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-ink-3">No upcoming appointments.</p>
            )}
            {upcoming.slice(1, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl px-1 py-1.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{a.doctor}</p>
                  <p className="text-xs text-ink-3">{fmtDate(a.date, { day: 'numeric', month: 'short' })} · {a.time}</p>
                </div>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
          <Link href="/patient/appointments/book-lab" className="m-5 mt-0 flex items-center justify-between rounded-2xl border border-dashed border-brand-200 px-4 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 sm:m-6 sm:mt-0">
            <span className="flex items-center gap-2">
              <FlaskConical className="size-4" /> Book a lab test at home
            </span>
            <ArrowRight className="size-4" />
          </Link>
        </Card>

        {/* Records */}
        <Card className="flex flex-col">
          <CardHeader title="Medical Records" subtitle="Latest results & conditions" icon={<FileText className="size-[18px]" />} action={<Link href="/patient/records" className="text-[13px] font-semibold text-brand-700 hover:underline">Open EHR</Link>} />
          <div className="flex-1 p-5 sm:p-6">
            <div className="space-y-2">
              {reports.rows.slice(0, 3).map((r) => (
                <Link key={r.id} href="/patient/reports" className="flex items-center justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                      <FlaskConical className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{r.name}</p>
                      <p className="text-xs text-ink-3">{r.lab} · {fmtDate(r.date, { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </Link>
              ))}
              {!reports.loading && reports.rows.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-ink-3">No lab reports yet.</p>}
            </div>
            <p className="mb-2.5 mt-6 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Active Conditions</p>
            <div className="flex flex-wrap gap-2">
              {conditions.length ? conditions.map((c) => <Badge key={c} tone={/allerg/i.test(c) ? 'amber' : 'mint'}>{c}</Badge>) : <span className="text-sm text-ink-3">None recorded</span>}
            </div>
          </div>
        </Card>

        {/* Billing */}
        <Card className="flex flex-col">
          <CardHeader title="Billing" subtitle="Payments & invoices" icon={<Wallet className="size-[18px]" />} action={<Link href="/patient/billing" className="text-[13px] font-semibold text-brand-700 hover:underline">View all</Link>} />
          <div className="flex-1 p-5 sm:p-6">
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <p className="text-xs text-white/60">Outstanding balance</p>
              <p className="mt-1 font-display text-3xl font-bold num">₹{due.toLocaleString('en-IN')}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-white/60">Due 28 Jun 2026</span>
                <Btn size="xs" href="/patient/billing" className="bg-white! bg-none text-ink">
                  Pay now
                </Btn>
              </div>
            </div>
            <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Recent Transactions</p>
            <div className="divide-y divide-line-soft">
              {INVOICES.filter((i) => i.status !== 'Due').slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-ink-3">
                      <CreditCard className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{t.desc.split(' — ')[0]}</p>
                      <p className="text-xs text-ink-3">{fmtDate(t.date, { day: 'numeric', month: 'short' })} · {t.method}</p>
                    </div>
                  </div>
                  <p className={cn('text-sm font-semibold num', t.status === 'Refunded' ? 'text-brand-700' : 'text-ink')}>
                    {t.status === 'Refunded' ? '+' : '−'}₹{t.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <Link href="/patient/health" className="mt-6 flex items-center justify-between rounded-2xl border border-line-soft bg-white px-6 py-4 shadow-card transition-all hover:shadow-lift">
        <span className="flex items-center gap-3 text-sm font-semibold text-ink">
          <Activity className="size-5 text-brand-600" /> See your full health overview, trends and contributing factors
        </span>
        <ArrowRight className="size-4 text-brand-700" />
      </Link>
    </Page>
  );
}

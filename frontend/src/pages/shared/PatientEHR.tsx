import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle, CalendarDays, ClipboardList, Droplets, FileText, FlaskConical, HeartPulse, Pill, ShieldCheck, Stethoscope, Thermometer, Activity } from 'lucide-react';
import { useGetPatient, useGetPatientMe, useListAppointments, useListPrescriptions, useListReports } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, CapsuleTabs, Card, CardHeader, DataTable, EmptyState, InfoRow, Page, ScoreRing, Skeleton, StatusPill } from '@/components/kit';
import { TrendChart } from '@/components/kit/charts';
import { APPOINTMENTS, LAB_REPORTS, ME, MY_PATIENTS, PRESCRIPTIONS, QUEUE, SERIES, type LabReport, type Rx } from '@/data/demo';
import { mapAppt, mapReport, mapRx } from '@/data/mappers';
import { fmtDate, parseList } from '@/data/source';
import { RxDrawer } from '@/pages/patient/Prescriptions';
import { ReportDrawer } from '@/pages/patient/Reports';

type Tab = 'Overview' | 'Appointments' | 'Prescriptions' | 'Lab Reports' | 'Discharge Summaries';

export default function PatientEHR() {
  const params = useParams<{ id?: string }>();
  const [location] = useLocation();
  const { isDemo, role } = useAuth();
  const self = role === 'patient';
  const id = params.id ?? '';
  const meQ = useGetPatientMe();
  const pQ = useGetPatient(self || isDemo ? '' : id);
  const live = isDemo ? null : self ? meQ.data : pQ.data;
  const pid = live?.id;
  const apptQ = useListAppointments(pid ? { patientId: pid } : {}, { query: { enabled: !isDemo && !!pid } });
  const rxQ = useListPrescriptions(pid ? { patientId: pid } : {});
  const repQ = useListReports(pid ? { patientId: pid } : {});
  const [tab, setTab] = useState<Tab>('Overview');
  const [rx, setRx] = useState<Rx | null>(null);
  const [rep, setRep] = useState<LabReport | null>(null);

  const demoPerson = [...MY_PATIENTS, ...QUEUE.map((q) => ({ id: q.id, name: q.name, gender: q.gender, age: q.age, healthId: q.pid, blood: q.blood, score: q.score ?? 70, risk: q.risk }))].find((p) => p.id === id);
  const loading = !isDemo && (self ? meQ.isLoading : pQ.isLoading);
  const error = !isDemo && (self ? meQ.error : pQ.error);

  const p = live
    ? {
        name: live.full_name,
        hid: live.health_id,
        age: live.age,
        gender: live.gender,
        blood: live.blood_group,
        height: live.height,
        weight: live.weight,
        bmi: live.bmi,
        score: live.health_score ?? 0,
        risk: live.risk_level ?? 'Unknown',
        conditions: [...parseList(live.existing_diseases), ...parseList(live.chronic_diseases)],
        allergies: parseList(live.allergies),
        meds: parseList(live.current_medications),
        family: parseList(live.family_medical_history),
        smoking: live.smoking_status,
        alcohol: live.alcohol_consumption,
        mobile: live.mobile,
      }
    : {
        name: demoPerson?.name ?? ME.name,
        hid: demoPerson?.healthId ?? ME.healthId,
        age: demoPerson?.age ?? ME.age,
        gender: demoPerson ? (demoPerson.gender === 'F' ? 'Female' : 'Male') : ME.gender,
        blood: demoPerson?.blood ?? ME.bloodGroup,
        height: ME.height,
        weight: ME.weight,
        bmi: ME.bmi,
        score: demoPerson?.score ?? ME.score,
        risk: demoPerson?.risk ?? 'Low',
        conditions: ME.conditions,
        allergies: ME.allergies,
        meds: ['Amlodipine 5mg', 'Telmisartan 40mg', 'Rosuvastatin 10mg'],
        family: ME.family,
        smoking: ME.smoking,
        alcohol: ME.alcohol,
        mobile: ME.mobile,
      };

  const appts = live ? (apptQ.data ?? []).map(mapAppt) : APPOINTMENTS;
  const rxs = live ? (rxQ.data ?? []).map(mapRx) : PRESCRIPTIONS;
  const reports = live ? (repQ.data ?? []).map(mapReport) : LAB_REPORTS.filter((r) => r.patient === 'Priya Sharma');
  const base = location.split('/')[1];

  if (loading)
    return (
      <Page>
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="mt-6 h-96 rounded-2xl" />
      </Page>
    );
  if (error)
    return (
      <Page>
        <Card>
          <EmptyState icon={<AlertTriangle />} title="Couldn't open this record" description={(error as Error).message} action={<Btn size="sm" variant="secondary" onClick={() => history.back()}>Go back</Btn>} />
        </Card>
      </Page>
    );

  return (
    <Page>
      {!self && (
        <Link href={`/${base}/${base === 'doctor' ? 'patients' : base === 'hospital' ? 'admissions' : 'patients'}`} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-brand-700">
          ← Back
        </Link>
      )}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
          <Avatar name={p.name} size={84} ring />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">{p.name}</h1>
              <Badge tone={/low|healthy/i.test(p.risk) ? 'green' : /moderate|medium/i.test(p.risk) ? 'amber' : 'red'} dot>
                {/risk/i.test(p.risk) || /healthy/i.test(p.risk) ? p.risk : `${p.risk} Risk`}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm font-semibold text-brand-700">{p.hid}</p>
            <div className="mt-5 grid grid-cols-3 gap-x-6 gap-y-4 sm:grid-cols-6">
              <InfoRow label="Age" value={p.age ? `${p.age} yrs` : '—'} />
              <InfoRow label="Gender" value={p.gender} />
              <InfoRow label="Blood" value={p.blood} />
              <InfoRow label="Height" value={p.height ? `${p.height} cm` : '—'} />
              <InfoRow label="Weight" value={p.weight ? `${p.weight} kg` : '—'} />
              <InfoRow label="BMI" value={p.bmi ?? '—'} />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <ScoreRing score={p.score} size={116} thickness={10} />
            <div className="hidden rounded-2xl border border-line-soft p-2 sm:block">
              <QRCodeSVG value={`prevntiv://patient/${p.hid}`} size={84} fgColor="#014d33" />
            </div>
          </div>
        </div>
        {!self && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line-soft bg-slate-50/60 px-6 py-3 text-xs text-ink-3 sm:px-8">
            <ShieldCheck className="size-4 text-brand-600" /> Access granted by patient · This view is recorded in the EHR audit trail.
            {role === 'doctor' && (
              <Btn size="xs" className="ml-auto" href="/doctor/prescriptions/new">
                Create Prescription
              </Btn>
            )}
          </div>
        )}
      </Card>

      <CapsuleTabs className="my-6" tabs={['Overview', 'Appointments', 'Prescriptions', 'Lab Reports', 'Discharge Summaries'] as Tab[]} value={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { l: 'Blood Pressure', v: '120/80', u: 'mmHg', i: Activity, c: 'text-violet-500' },
                { l: 'Heart Rate', v: '72', u: 'bpm', i: HeartPulse, c: 'text-rose-500' },
                { l: 'SpO₂', v: '98', u: '%', i: Droplets, c: 'text-sky-500' },
                { l: 'Temperature', v: '98.6', u: '°F', i: Thermometer, c: 'text-amber-500' },
              ].map((v) => (
                <Card key={v.l} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">{v.l}</span>
                    <v.i className={`size-4 ${v.c}`} />
                  </div>
                  <p className="mt-3 num font-display text-2xl font-bold text-ink">
                    {v.v} <span className="text-xs font-medium text-ink-3">{v.u}</span>
                  </p>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader title="Health Score Trend" subtitle="Last 6 months" />
              <div className="px-3 pb-5 pt-4 sm:px-5">
                <TrendChart data={SERIES.score} xKey="t" series={[{ key: 'v', name: 'Score' }]} height={220} domain={[50, 100]} />
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <ListCard title="Active Conditions" icon={<Stethoscope className="size-[18px]" />} items={p.conditions} tone="mint" />
            <ListCard title="Allergies" icon={<AlertTriangle className="size-[18px]" />} items={p.allergies} tone="amber" />
            <ListCard title="Current Medications" icon={<Pill className="size-[18px]" />} items={p.meds} tone="green" />
            <Card className="p-5">
              <h3 className="mb-3 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
                <ClipboardList className="size-[18px] text-brand-600" /> Lifestyle & Family
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Smoking" value={p.smoking || '—'} />
                <InfoRow label="Alcohol" value={p.alcohol || '—'} />
                <InfoRow label="Family history" value={p.family.join(', ') || '—'} className="col-span-2" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'Appointments' && (
        <Card className="overflow-hidden">
          <DataTable
            rows={appts}
            rowKey={(a) => a.id}
            empty={<EmptyState icon={<CalendarDays />} title="No appointments" />}
            columns={[
              { key: 'd', header: 'Date', cell: (a) => <><p className="font-semibold text-ink">{fmtDate(a.date)}</p><p className="text-xs text-ink-3">{a.time}</p></> },
              { key: 'doc', header: 'Doctor', cell: (a) => <><p className="font-medium text-ink">{a.doctor}</p><p className="text-xs text-ink-3">{a.specialty}</p></> },
              { key: 't', header: 'Type', cell: (a) => a.type },
              { key: 'r', header: 'Reason', cell: (a) => a.reason || '—' },
              { key: 's', header: 'Status', cell: (a) => <StatusPill status={a.status} /> },
            ]}
          />
        </Card>
      )}

      {tab === 'Prescriptions' && (
        <Card className="overflow-hidden">
          <DataTable
            rows={rxs}
            rowKey={(r) => r.id}
            onRowClick={setRx}
            empty={<EmptyState icon={<Pill />} title="No prescriptions" />}
            columns={[
              { key: 'd', header: 'Issued', cell: (r) => fmtDate(r.date) },
              { key: 'dx', header: 'Diagnosis', cell: (r) => <span className="font-semibold text-ink">{r.diagnosis}</span> },
              { key: 'm', header: 'Medicines', cell: (r) => <span className="line-clamp-1">{r.medicines.map((m) => m.name).join(', ')}</span> },
              { key: 'doc', header: 'Doctor', hideOnMobile: true, cell: (r) => r.doctor },
              { key: 'f', header: 'Follow-up', hideOnMobile: true, cell: (r) => (r.followUp ? fmtDate(r.followUp) : '—') },
            ]}
          />
        </Card>
      )}

      {tab === 'Lab Reports' && (
        <Card className="overflow-hidden">
          <DataTable
            rows={reports}
            rowKey={(r) => r.id}
            onRowClick={setRep}
            empty={<EmptyState icon={<FlaskConical />} title="No lab reports" />}
            columns={[
              { key: 'd', header: 'Date', cell: (r) => fmtDate(r.date) },
              { key: 'n', header: 'Report', cell: (r) => <span className="font-semibold text-ink">{r.name}</span> },
              { key: 'l', header: 'Laboratory', hideOnMobile: true, cell: (r) => r.lab },
              { key: 'c', header: 'Category', cell: (r) => r.category },
              { key: 's', header: 'Status', cell: (r) => <StatusPill status={r.status} /> },
            ]}
          />
        </Card>
      )}

      {tab === 'Discharge Summaries' && (
        <Card className="divide-y divide-line-soft overflow-hidden">
          {[
            { t: 'Discharge_Clinical_Summary.pdf', by: 'Dr. Amit Kumar', d: '2026-06-26', w: 'Cardiology Wing, Bed 12B' },
            { t: 'Discharge_Summary_CityHosp.pdf', by: 'City Hospital Team', d: '2026-05-28', w: 'General Ward' },
          ].map((s, i) => (
            <div key={s.t} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <FileText className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-ink">{s.t}</p>
                <p className="text-xs text-ink-3">
                  Finalized by {s.by} · {fmtDate(s.d)} · {s.w}
                </p>
              </div>
              <Badge tone="green" upper>
                Finalized
              </Badge>
              <Btn size="sm" variant="secondary" href={i === 0 ? `/${base}/summary/ad1` : undefined} disabled={i !== 0}>
                View Summary
              </Btn>
            </div>
          ))}
        </Card>
      )}

      <RxDrawer rx={rx} onClose={() => setRx(null)} patientName={p.name} />
      <ReportDrawer report={rep} onClose={() => setRep(null)} />
    </Page>
  );
}

function ListCard({ title, icon, items, tone }: { title: string; icon: React.ReactNode; items: string[]; tone: 'mint' | 'amber' | 'green' }) {
  return (
    <Card className="p-5">
      <h3 className="mb-3 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
        <span className="text-brand-600">{icon}</span> {title}
      </h3>
      <div className="flex flex-wrap gap-2">{items.length ? items.map((i) => <Badge key={i} tone={tone}>{i}</Badge>) : <span className="text-sm text-ink-3">None recorded</span>}</div>
    </Card>
  );
}

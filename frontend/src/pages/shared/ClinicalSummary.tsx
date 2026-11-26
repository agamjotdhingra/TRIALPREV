import { useRef } from 'react';
import { useLocation } from 'wouter';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardCheck, PenLine, Pill, Printer, Stethoscope } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { Badge, Btn, Card, InfoRow, LogoMark, Page, PageHeader } from '@/components/kit';

const S = {
  patient: 'Alex Johnson',
  admission: '22 June 2026',
  discharge: '26 June 2026',
  ward: 'Cardiology Wing, Bed 12B',
  physician: 'Dr. Amit Kumar',
  signed: 'Signed by Dr. Amit Kumar — 26 June 2026, 3:45 PM',
  diagnosis: 'Acute exacerbation of congestive heart failure (CHF) secondary to uncontrolled hypertension. Patient presented with severe dyspnea, bilateral pedal edema, and elevated BNP levels.',
  course:
    'Patient was admitted via the ER on 22 June 2026 with symptoms of acute CHF. Initial management included IV diuretics (Furosemide) and supplemental oxygen. Over the course of 48 hours, the patient exhibited significant diuresis with resolution of pedal edema and improved oxygen saturation on room air. Blood pressure was stabilized using a combination of ACE inhibitors and beta-blockers. Echocardiogram performed on 24 June confirmed an ejection fraction of 40%. The patient transitioned to oral medications on 25 June and remained hemodynamically stable, ambulating without dyspnea, prior to discharge planning.',
  procedures: [
    { t: 'Transthoracic Echocardiogram (TTE)', d: '24 June 2026 — Showed LVEF of 40%, mild mitral regurgitation.' },
    { t: 'Comprehensive Metabolic Panel & BNP', d: '22 June 2026 — BNP > 800 pg/mL on admission, normalized prior to discharge.' },
  ],
  meds: [
    { n: 'Lisinopril', d: '10 mg', f: 'Once daily (morning)' },
    { n: 'Carvedilol', d: '3.125 mg', f: 'Twice daily' },
    { n: 'Furosemide', d: '40 mg', f: 'Once daily (morning)' },
  ],
  instructions: [
    'Weigh yourself daily every morning. Call the clinic if you gain more than 2 lbs in a day or 5 lbs in a week.',
    'Maintain a low-sodium diet (less than 2000 mg per day).',
    'Restrict fluid intake to 1.5 Liters per day.',
    'Take all medications exactly as prescribed. Do not skip doses.',
  ],
  warning: 'Seek immediate emergency care if you experience severe shortness of breath at rest, chest pain, or fainting.',
  followUp: { when: '10 July 2026, 10:00 AM', where: 'Cardiology Clinic with Dr. Amit Kumar' },
};

export default function ClinicalSummary() {
  const { role } = useAuth();
  const [location] = useLocation();
  const base = location.split('/')[1];
  const ref = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({ contentRef: ref, documentTitle: 'Clinical-Summary-Alex-Johnson' });
  const canAmend = role === 'hospital_admin' || role === 'doctor';

  return (
    <Page width="lg">
      <PageHeader
        back={{ href: base === 'hospital' ? '/hospital/admissions' : base === 'patient' ? '/patient/records' : `/${base}/patients`, label: 'Back' }}
        title="Finalized Clinical Summary"
        subtitle={S.signed}
        actions={
          <>
            <Badge tone="green" upper dot>
              Finalized
            </Badge>
            <Btn variant="outline" size="sm" className="h-10" onClick={() => print()} icon={<Printer className="size-4" />}>
              Print / PDF
            </Btn>
            {canAmend && (
              <Btn size="sm" className="h-10" onClick={() => toast.info('Amendments create a new signed version and notify the patient.')} icon={<PenLine className="size-4" />}>
                Amend Summary
              </Btn>
            )}
          </>
        }
      />
      <div ref={ref} className="space-y-6 print:p-8">
        <div className="hidden items-center gap-2 font-display text-lg font-extrabold italic text-brand-700 print:flex">
          <LogoMark className="size-5 text-brand-500" /> PREVNTIV — Discharge Summary
        </div>
        <Card className="grid grid-cols-2 gap-5 p-6 sm:grid-cols-5">
          <InfoRow label="Patient Name" value={S.patient} />
          <InfoRow label="Admission Date" value={S.admission} />
          <InfoRow label="Discharge Date" value={S.discharge} />
          <InfoRow label="Ward / Bed" value={S.ward} />
          <InfoRow label="Attending Physician" value={S.physician} />
        </Card>

        <Section icon={<Stethoscope />} title="Final Diagnosis">
          <p className="text-[15px] leading-relaxed text-ink">{S.diagnosis}</p>
        </Section>
        <Section icon={<ClipboardCheck />} title="Course in Hospital">
          <p className="text-sm leading-7 text-ink-2">{S.course}</p>
        </Section>
        <Section icon={<CheckCircle2 />} title="Procedures Performed">
          <ul className="space-y-3">
            {S.procedures.map((p) => (
              <li key={p.t} className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold text-ink">{p.t}</p>
                <p className="mt-0.5 text-sm text-ink-3">{p.d}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section icon={<Pill />} title="Medications on Discharge">
          <div className="overflow-hidden rounded-xl border border-line-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-ink-3">
                <tr>
                  <th className="px-4 py-3">Medication Name</th>
                  <th className="px-4 py-3">Dosage</th>
                  <th className="px-4 py-3">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {S.meds.map((m) => (
                  <tr key={m.n}>
                    <td className="px-4 py-3 font-semibold text-ink">{m.n}</td>
                    <td className="px-4 py-3 text-ink-2">{m.d}</td>
                    <td className="px-4 py-3 text-ink-2">{m.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section icon={<ClipboardCheck />} title="Discharge Instructions & Follow-Up Care">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-2 marker:font-semibold marker:text-brand-600">
            {S.instructions.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ol>
          <div className="mt-4 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="size-5 shrink-0" /> {S.warning}
          </div>
        </Section>
        <Card className="flex flex-col items-start gap-4 bg-gradient-to-r from-brand-50 to-white p-6 sm:flex-row sm:items-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-card">
            <CalendarClock className="size-6" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700">Scheduled Follow-up</p>
            <p className="font-display text-lg font-bold text-ink">{S.followUp.when}</p>
            <p className="text-sm text-ink-3">{S.followUp.where}</p>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 sm:p-7">
      <h2 className="mb-4 flex items-center gap-2.5 font-display text-base font-bold text-ink">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 [&_svg]:size-4">{icon}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

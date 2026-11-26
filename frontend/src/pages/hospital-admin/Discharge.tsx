import { useState } from 'react';
import { Redirect, useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { useDischargeAdmission, useListAdmissions } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, Card, Field, InfoRow, Input, Modal, Page, PageHeader, ScoreRing, Skeleton, Textarea } from '@/components/kit';
import { ADMISSIONS } from '@/data/demo';
import { mapAdmission } from './Admissions';

export default function Discharge() {
  const { id } = useParams<{ id: string }>();
  const { isDemo } = useAuth();
  const [, setLocation] = useLocation();
  const q = useListAdmissions();
  const discharge = useDischargeAdmission();
  const a = isDemo ? ADMISSIONS.find((x) => x.id === id) : q.data?.map(mapAdmission).find((x) => x.id === id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState(false);

  if (!isDemo && q.isLoading)
    return (
      <Page width="lg">
        <Skeleton className="h-[560px] rounded-2xl" />
      </Page>
    );
  if (!a) return <Redirect to="/hospital/admissions" />;

  const delta = a.scoreNow - a.scoreIn;

  async function finalize() {
    setConfirm(false);
    try {
      if (!isDemo) await discharge.mutateAsync({ id, dischargeDate: date, notes });
      toast.success(`${a!.patient} discharged — ${a!.bed} is now available`);
      setLocation(`/hospital/summary/${id}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Discharge failed');
    }
  }

  return (
    <Page width="lg">
      <PageHeader back={{ href: '/hospital/admissions', label: 'Admissions' }} title="Patient Discharge" subtitle="Initiate discharge protocol and finalize clinical summary." />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-line-soft p-6 sm:flex-row sm:items-center">
          <Avatar name={a.patient} size={56} />
          <div className="flex-1">
            <p className="font-display text-xl font-bold text-ink">{a.patient}</p>
            <p className="text-sm text-ink-3">
              <span className="font-mono">{a.pid}</span> · {a.physician}
            </p>
          </div>
          <Badge tone="green" dot>
            Cleared for Discharge
          </Badge>
        </div>
        <div className="space-y-8 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-3">
            <InfoRow label="Admission Date" value={a.date} />
            <Field label={<span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-4">Discharge Date</span>}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <InfoRow label="Ward & Bed Freed" value={`${a.dept} - ${a.bed}`} />
          </div>

          <div>
            <h3 className="mb-4 font-display text-base font-bold text-ink">Clinical Outcome</h3>
            <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-50 p-6 sm:flex-row sm:justify-around">
              <div className="text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Score on Admission</p>
                <ScoreRing score={a.scoreIn || 50} size={104} thickness={9} />
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="hidden size-6 text-ink-4 sm:block" />
                <Badge tone={delta >= 0 ? 'green' : 'red'} className="mt-2">
                  <TrendingUp className="size-3.5" /> {delta >= 0 ? '+' : ''}
                  {delta} {delta >= 0 ? 'Improved' : 'Declined'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Current Score</p>
                <ScoreRing score={a.scoreNow || 50} size={104} thickness={9} />
              </div>
            </div>
          </div>

          <Field label="Discharge Notes & Summary" error={err}>
            <Textarea className="min-h-[160px]" placeholder="Enter clinical notes, follow-up instructions, and medication summary here..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-line-soft bg-slate-50/50 px-6 py-4">
          <Btn variant="outline" href="/hospital/admissions">
            Cancel
          </Btn>
          <Btn
            loading={discharge.isPending}
            onClick={() => {
              if (notes.trim().length < 20) return setErr('Add a discharge summary (at least 20 characters) before finalizing.');
              setErr('');
              setConfirm(true);
            }}
            icon={<CheckCircle2 className="size-4" />}
          >
            Finalize Discharge
          </Btn>
        </div>
      </Card>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        size="sm"
        title={`Discharge ${a.patient}?`}
        description={`This finalizes the clinical summary, frees ${a.bed} and shares the summary with the patient's EHR.`}
        footer={
          <>
            <Btn variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Btn>
            <Btn onClick={finalize}>Finalize</Btn>
          </>
        }
      />
    </Page>
  );
}

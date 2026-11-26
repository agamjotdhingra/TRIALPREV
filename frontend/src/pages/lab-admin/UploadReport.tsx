import { useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { toast } from 'sonner';
import { AlertTriangle, FileText, Link2, Send, X } from 'lucide-react';
import { useCreateReport } from '@/api/hooks';
import { supabase } from '@/api/supabase';
import { useAuth } from '@/auth/AuthContext';
import { Btn, Card, Divider, Field, Input, Page, Select, Switch, Textarea, UploadZone } from '@/components/kit';
import { fmtBytes } from '@/data/store';

const CATS = ['Hematology', 'Biochemistry', 'Radiology', 'Pathology', 'Cardiology', 'Endocrinology', 'Blood Work', 'Imaging'];

export default function LabUploadReport() {
  const { isDemo } = useAuth();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(useSearch());
  const patientId = params.get('patient');
  const patientLabel = patientId ? `${params.get('name')} (${params.get('hid')})` : '';
  const create = useCreateReport();
  const [form, setForm] = useState({ name: '', category: '', findings: '', url: '' });
  const [critical, setCritical] = useState(false);
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit() {
    const e: Record<string, string> = {};
    if (!patientId) e.patient = 'Find the patient first.';
    if (!form.name.trim()) e.name = 'Report name is required.';
    if (!form.category) e.category = 'Select a category.';
    if (form.url && !/^https?:\/\//.test(form.url)) e.url = 'URL must start with http(s)://';
    if (critical && !note.trim()) e.note = 'Describe the critical finding for the care team.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      let fileUrl = form.url || undefined;
      if (!isDemo && file) {
        const path = `${patientId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error } = await supabase.storage.from('reports').upload(path, file, { upsert: false });
        if (error) throw error;
        fileUrl = path;
      }
      if (!isDemo) await create.mutateAsync({ patientId: Number(patientId), category: form.category, reportName: form.name.trim(), fileUrl, findings: form.findings || undefined, isCritical: critical, criticalNote: critical ? note : undefined });
      toast.success(critical ? 'Critical report published — the patient’s doctor has been alerted' : 'Report published to the patient’s EHR');
      setLocation('/lab/reports');
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page width="md">
      <Card className="mx-auto max-w-[760px] p-6 sm:p-10">
        <h1 className="font-display text-2xl font-bold text-ink">Upload Lab Report</h1>
        <p className="mt-1 text-sm text-ink-3">Enter clinical findings and attach the external report securely.</p>
        <div className="mt-8 space-y-6">
          <Field label="Patient" error={errors.patient}>
            {patientId ? (
              <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50 px-3.5 py-3 text-sm font-semibold text-ink">
                {patientLabel}
                <Link href="/lab/search" className="text-xs font-semibold text-brand-700 hover:underline">
                  Change
                </Link>
              </div>
            ) : (
              <Btn variant="secondary" shape="rounded" block href="/lab/search">
                Find patient by Health ID
              </Btn>
            )}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Report Name" required error={errors.name}>
              <Input placeholder="e.g., Complete Blood Count" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} invalid={!!errors.name} />
            </Field>
            <Field label="Category" required error={errors.category}>
              <Select placeholder="Select Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATS} />
            </Field>
          </div>
          <Field label="Findings / Observations">
            <Textarea placeholder="Enter clinical notes here..." value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} />
          </Field>
          <div className={`rounded-2xl border p-4 transition-colors ${critical ? 'border-red-200 bg-red-50' : 'border-line-soft'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`size-5 ${critical ? 'text-red-600' : 'text-ink-4'}`} />
                <div>
                  <p className="text-sm font-semibold text-ink">Flag as critical</p>
                  <p className="text-xs text-ink-3">Immediately notifies the patient's doctor.</p>
                </div>
              </div>
              <Switch checked={critical} onChange={setCritical} label="Flag as critical" />
            </div>
            {critical && (
              <Field className="mt-4" error={errors.note}>
                <Textarea className="min-h-[80px] bg-white" placeholder="e.g. Potassium 6.1 mmol/L — above critical threshold" value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
            )}
          </div>
          <Field label="Report Document">
            {file ? (
              <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
                <FileText className="size-5 text-brand-600" />
                <span className="flex-1 truncate text-sm font-semibold text-ink">{file.name}</span>
                <span className="text-xs text-ink-3">{fmtBytes(file.size)}</span>
                <button onClick={() => setFile(null)} className="rounded p-1 text-ink-3 hover:text-red-600" aria-label="Remove file">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <UploadZone accept=".pdf,.jpg,.jpeg,.png" hint="Supported formats: PDF, JPEG, PNG (Max 10MB)" onFiles={([f]) => (f.size > 10 * 1024 * 1024 ? toast.error('File exceeds 10MB') : setFile(f))} />
            )}
          </Field>
          <Divider label="Or paste an external URL" />
          <Field error={errors.url}>
            <Input leftIcon={<Link2 />} placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} disabled={!!file} />
          </Field>
        </div>
        <Btn block size="lg" className="mt-8" loading={busy || create.isPending} onClick={submit} icon={<Send className="size-4" />}>
          Submit Report
        </Btn>
      </Card>
    </Page>
  );
}

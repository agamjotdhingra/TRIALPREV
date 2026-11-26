import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Lock, Trash2, Upload } from 'lucide-react';
import { useCreateDocument, useGetPatientMe } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Btn, Card, Field, FileIcon, Input, Page, Select, StepDots, Textarea, UploadZone } from '@/components/kit';
import { DOC_CATEGORIES } from '@/data/demo';
import { fmtBytes, store, uploadToStorage } from '@/data/store';

const MAX = 10 * 1024 * 1024;

export default function UploadDocument() {
  const { isDemo } = useAuth();
  const [, setLocation] = useLocation();
  const me = useGetPatientMe();
  const create = useCreateDocument();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState('');
  const [meta, setMeta] = useState({ category: '', date: '', source: '', notes: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function pick(f: File) {
    if (f.size > MAX) return setFileErr('That file is larger than 10MB. Please compress it or choose another.');
    if (!/\.(pdf|docx?|jpe?g|png)$/i.test(f.name)) return setFileErr('Unsupported format. Use PDF, DOC, DOCX, JPEG or PNG.');
    setFileErr('');
    setFile(f);
  }

  async function upload() {
    if (!file) return setStep(0);
    if (!meta.category) return setErr('Choose a document category.');
    setErr('');
    setBusy(true);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 700));
        store.set((s) => ({ docs: [{ id: `u-${Date.now()}`, name: file.name, size: fmtBytes(file.size), category: meta.category, date: meta.date || new Date().toISOString(), sharedWith: undefined }, ...s.docs] }));
      } else {
        if (!me.data?.id) throw new Error('Your patient profile is still loading. Try again in a moment.');
        const path = await uploadToStorage(me.data.id, file);
        await create.mutateAsync({ fileName: file.name, fileUrl: path, category: meta.category, mimeType: file.type });
        qc.invalidateQueries({ queryKey: ['documents'] });
      }
      toast.success(`"${file.name}" uploaded`);
      setLocation('/patient/documents');
    } catch (e: any) {
      setErr(e.message ?? 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page width="md">
      <Link href="/patient/documents" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-brand-700">
        <ArrowLeft className="size-4" /> Back to My Documents
      </Link>
      <Card className="mx-auto max-w-[640px] p-6 sm:p-9">
        <StepDots total={2} current={step} label={`Step ${step + 1} of 2`} />
        {step === 0 ? (
          <>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink">Choose file</h1>
            <p className="mt-1 text-sm text-ink-3">Upload a medical record to keep it safe and shareable with your care team.</p>
            <div className="mt-7">
              <UploadZone accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" hint="PDF, DOC, DOCX, JPEG, PNG (max. 10MB)" onFiles={([f]) => pick(f)} />
              {fileErr && <p className="mt-2 text-xs font-medium text-red-600">{fileErr}</p>}
            </div>
            {file && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-line-soft bg-slate-50/60 p-4">
                <FileIcon name={file.name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
                  <p className="text-xs text-ink-3">{fmtBytes(file.size)} • Ready to stage</p>
                </div>
                <button onClick={() => setFile(null)} className="rounded-lg p-2 text-ink-3 hover:bg-white hover:text-red-600" aria-label="Remove chosen file">
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
            <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-3">
              <Lock className="size-3.5" /> Files are encrypted and only visible to people you share them with.
            </p>
            <div className="mt-8 flex justify-end border-t border-line-soft pt-6">
              <Btn disabled={!file} onClick={() => setStep(1)} iconRight={<ArrowRight className="size-4" />}>
                Next
              </Btn>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink">Add details</h1>
            <p className="mt-1 text-sm text-ink-3">Help your doctors find this record quickly.</p>
            {file && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 ring-1 ring-line-soft">
                <FileIcon name={file.name} size={38} />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{file.name}</p>
                <button onClick={() => setStep(0)} className="text-xs font-semibold text-brand-700 hover:underline">
                  Change
                </button>
              </div>
            )}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Category" required className="sm:col-span-2" error={err && !meta.category ? err : undefined}>
                <Select placeholder="Select document category..." value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} options={DOC_CATEGORIES} />
              </Field>
              <Field label={<>Document Date <span className="font-normal text-ink-3">(optional)</span></>}>
                <Input type="date" max={new Date().toISOString().slice(0, 10)} value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
              </Field>
              <Field label={<>Doctor or Hospital <span className="font-normal text-ink-3">(optional)</span></>}>
                <Input placeholder="e.g. Dr. Amit Sharma or City Hospital" value={meta.source} onChange={(e) => setMeta({ ...meta, source: e.target.value })} />
              </Field>
              <Field label={<>Notes <span className="font-normal text-ink-3">(optional)</span></>} className="sm:col-span-2">
                <Textarea placeholder="Add notes, diagnosis or key findings..." value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} />
              </Field>
            </div>
            {err && meta.category && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">{err}</p>}
            <div className="mt-8 flex justify-between border-t border-line-soft pt-6">
              <Btn variant="ghost" onClick={() => setStep(0)} icon={<ArrowLeft className="size-4" />}>
                Back
              </Btn>
              <Btn loading={busy} onClick={upload} icon={<Upload className="size-4" />}>
                Upload
              </Btn>
            </div>
          </>
        )}
      </Card>
    </Page>
  );
}

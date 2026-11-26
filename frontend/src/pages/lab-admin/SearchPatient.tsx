import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, ScanSearch, Search, UserX } from 'lucide-react';
import { useGetPatientByHealthId } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Badge, Btn, Card, EmptyState, InfoRow, Input, Page, Skeleton } from '@/components/kit';
import { fmtDate } from '@/data/source';

const DEMO = { id: 9921, full_name: 'Rajesh Kumar', health_id: 'PRE-9921-A', risk_level: 'Low', age: 34, gender: 'Male', blood_group: 'O+', mobile: '+91 98765 43210', last_visit: '2026-06-26' };

export default function LabSearchPatient() {
  const { isDemo } = useAuth();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const q = useGetPatientByHealthId(isDemo ? '' : query);
  const p = isDemo ? (query ? (query.toUpperCase().includes('9921') || query.replace(/\D/g, '').endsWith('43210') ? DEMO : null) : undefined) : query ? q.data ?? (q.isError ? null : undefined) : undefined;
  const loading = !isDemo && !!query && q.isLoading;

  return (
    <Page width="md">
      <Card className="mx-auto max-w-2xl p-6 sm:p-10">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <ScanSearch className="size-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink">Search Patient</h1>
        <p className="mt-1 text-sm text-ink-3">Enter the patient's Health ID or mobile number to proceed with report upload.</p>
        <form
          className="mt-7 flex gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(input.trim());
          }}
        >
          <Input leftIcon={<Search />} placeholder="e.g. PRE-9921-A" value={input} onChange={(e) => setInput(e.target.value)} className="h-12 font-mono uppercase" aria-label="Health ID or mobile number" />
          <Btn type="submit" size="lg" shape="rounded" disabled={!input.trim()}>
            Search
          </Btn>
        </form>
        {isDemo && !query && <p className="mt-3 text-xs text-ink-3">Try PRE-9921-A</p>}

        <div className="mt-8">
          {loading && <Skeleton className="h-56 rounded-2xl" />}
          {p === null && <EmptyState icon={<UserX />} title="No patient found" description="Check the Health ID or ask the patient to show their Prevntiv QR code." className="rounded-2xl border border-dashed border-line" />}
          {p && (
            <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/70 to-white p-6 animate-fade-up">
              <div className="flex items-center gap-4">
                <Avatar name={p.full_name} size={56} />
                <div className="flex-1">
                  <p className="font-display text-xl font-bold text-ink">{p.full_name}</p>
                  <p className="font-mono text-sm font-semibold text-brand-700">{p.health_id}</p>
                </div>
                <Badge tone={/low|healthy/i.test(p.risk_level ?? '') ? 'green' : 'amber'} dot>
                  {p.risk_level ?? '—'} Risk
                </Badge>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
                <InfoRow label="Age / Gender" value={`${p.age ?? '—'} / ${p.gender ?? '—'}`} />
                <InfoRow label="Blood Group" value={p.blood_group ?? '—'} />
                <InfoRow label="Mobile" value={p.mobile ?? '—'} />
                <InfoRow label="Last Visit" value={(p as any).last_visit ? fmtDate((p as any).last_visit) : '—'} />
              </div>
              <Btn block size="lg" className="mt-7" onClick={() => setLocation(`/lab/upload?patient=${p.id}&name=${encodeURIComponent(p.full_name)}&hid=${encodeURIComponent(p.health_id)}`)} iconRight={<ArrowRight className="size-4" />}>
                Proceed to Upload Report
              </Btn>
            </div>
          )}
        </div>
      </Card>
    </Page>
  );
}

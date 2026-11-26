import { useDeferredValue, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Users } from 'lucide-react';
import { useListPatients } from '@/api/hooks';
import { Avatar, Badge, Btn, Card, DataTable, EmptyState, Page, PageHeader, Pagination, Progress, SearchInput, toneFor, usePaged } from '@/components/kit';
import { MY_PATIENTS } from '@/data/demo';
import { useSource } from '@/data/source';

export default function DoctorPatients() {
  const [, setLocation] = useLocation();
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q);
  const src = useSource(useListPatients(dq ? { search: dq } : {}), MY_PATIENTS, (p: any) => ({
    id: String(p.id),
    name: p.full_name,
    gender: (p.gender ?? '').charAt(0).toUpperCase(),
    age: p.age ?? '',
    healthId: p.health_id,
    blood: p.blood_group ?? '—',
    score: p.health_score ?? 0,
    risk: p.risk_level ?? 'Unknown',
  }));
  const rows = useMemo(() => (src.isDemo ? src.rows.filter((r) => (r.name + r.healthId).toLowerCase().includes(dq.toLowerCase())) : src.rows), [src.rows, src.isDemo, dq]);
  const paged = usePaged(rows, 8);

  return (
    <Page>
      <PageHeader title="My Patients" subtitle="Manage and monitor patient health records." actions={<SearchInput className="w-full sm:w-80" value={q} onChange={setQ} placeholder="Live search patients..." />} />
      <Card className="overflow-hidden">
        {src.error && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-[13px] text-red-700">{src.error}</p>}
        <DataTable
          loading={src.loading}
          rows={paged.slice}
          rowKey={(r) => r.id}
          onRowClick={(r) => setLocation(`/doctor/patients/${r.id}`)}
          empty={<EmptyState icon={<Users />} title={q ? 'No patients match' : 'No patients yet'} description={q ? 'Try a name or Health ID.' : 'Patients appear here after their first consultation with you.'} />}
          columns={[
            { key: 'p', header: 'Patient', cell: (r) => <div className="flex items-center gap-3"><Avatar name={r.name} size={36} /><div><p className="font-semibold text-ink">{r.name}</p><p className="text-xs text-ink-3">{[r.gender, r.age].filter(Boolean).join('/')}</p></div></div> },
            { key: 'h', header: 'Health ID', cell: (r) => <span className="font-mono text-xs font-semibold text-ink-2">{r.healthId}</span> },
            { key: 'b', header: 'Blood Group', hideOnMobile: true, cell: (r) => <Badge tone="gray">{r.blood}</Badge> },
            { key: 's', header: 'Health Score', cell: (r) => <div className="flex w-32 items-center gap-2.5"><span className="num w-7 font-semibold text-ink">{r.score}</span><Progress value={r.score} tone={r.score >= 80 ? 'green' : r.score >= 50 ? 'amber' : 'red'} height={6} /></div> },
            { key: 'r', header: 'Risk Level', cell: (r) => <Badge tone={toneFor(r.risk)} dot>{r.risk}</Badge> },
            { key: 'a', header: 'Action', align: 'right', cell: (r) => <Btn size="xs" variant="secondary" href={`/doctor/patients/${r.id}`}>View EHR</Btn> },
          ]}
        />
        {rows.length > 0 && <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} onPage={paged.setPage} noun="patients" />}
      </Card>
    </Page>
  );
}

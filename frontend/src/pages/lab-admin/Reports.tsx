import { useMemo, useState } from 'react';
import { useSearch } from 'wouter';
import { FileUp, FlaskConical } from 'lucide-react';
import { useListReports } from '@/api/hooks';
import { Avatar, Btn, CapsuleTabs, Card, DataTable, EmptyState, Page, PageHeader, Pagination, SearchInput, StatusPill, usePaged } from '@/components/kit';
import { LAB_REPORTS, type LabReport } from '@/data/demo';
import { mapReport } from '@/data/mappers';
import { fmtDate, useSource } from '@/data/source';
import { ReportDrawer } from '@/pages/patient/Reports';

export default function LabReports() {
  const src = useSource(useListReports(), LAB_REPORTS, mapReport);
  const initial = new URLSearchParams(useSearch()).get('status') === 'Critical' ? 'Critical' : 'All';
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(initial);
  const [open, setOpen] = useState<LabReport | null>(null);
  const cats = ['All', 'Critical', ...Array.from(new Set(src.rows.map((r) => r.category)))];
  const rows = useMemo(
    () => src.rows.filter((r) => (cat === 'All' || (cat === 'Critical' ? r.status === 'Critical' : r.category === cat)) && [r.name, r.id, r.patient, r.category].join(' ').toLowerCase().includes(q.toLowerCase())),
    [src.rows, q, cat],
  );
  const paged = usePaged(rows, 8);

  return (
    <Page>
      <PageHeader title="All Reports" subtitle="Manage and review patient laboratory results" actions={<Btn href="/lab/upload" icon={<FileUp className="size-4" />}>Upload New Report</Btn>} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput className="w-full lg:w-[420px]" value={q} onChange={setQ} placeholder="Search by patient name, report ID, or category" />
        <CapsuleTabs tabs={cats.slice(0, 7)} value={cat} onChange={setCat} />
      </div>
      <Card className="overflow-hidden">
        {src.error && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-[13px] text-red-700">{src.error}</p>}
        <DataTable
          loading={src.loading}
          rows={paged.slice}
          rowKey={(r) => r.id}
          onRowClick={setOpen}
          rowClassName={(r) => (r.status === 'Critical' ? 'bg-red-50/40' : undefined)}
          empty={<EmptyState icon={<FlaskConical />} title="No reports found" description="Published reports will appear here." action={<Btn size="sm" href="/lab/upload">Upload Report</Btn>} />}
          columns={[
            { key: 'n', header: 'Report Details', cell: (r) => <><p className="font-semibold text-ink">{r.name}</p><p className="font-mono text-[11px] text-ink-3">ID: {r.id}</p></> },
            { key: 'p', header: 'Patient Name', cell: (r) => <div className="flex items-center gap-2.5"><Avatar name={r.patient} size={30} /><span>{r.patient ?? '—'}</span></div> },
            { key: 'c', header: 'Category', hideOnMobile: true, cell: (r) => r.category },
            { key: 'd', header: 'Published Date', hideOnMobile: true, cell: (r) => fmtDate(r.date) },
            { key: 's', header: 'Status', cell: (r) => <StatusPill status={r.status} /> },
            { key: 'a', header: 'Actions', align: 'right', cell: (r) => <Btn size="xs" variant="secondary" onClick={(e) => { e.stopPropagation(); setOpen(r); }}>View Details</Btn> },
          ]}
        />
        {rows.length > 0 && <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} onPage={paged.setPage} noun="results" />}
      </Card>
      <ReportDrawer report={open} onClose={() => setOpen(null)} showPatient />
    </Page>
  );
}

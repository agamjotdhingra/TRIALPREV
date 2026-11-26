import { useMemo, useState } from 'react';
import { AlertTriangle, Download, FlaskConical } from 'lucide-react';
import { useListReports } from '@/api/hooks';
import { Btn, Callout, CapsuleTabs, Card, DataTable, Drawer, EmptyState, InfoRow, Page, PageHeader, Pagination, SearchInput, StatusPill, usePaged } from '@/components/kit';
import { LAB_REPORTS, type LabReport } from '@/data/demo';
import { mapReport } from '@/data/mappers';
import { fmtDate, useSource } from '@/data/source';

export const REPORT_CATEGORIES = ['All', 'Blood Work', 'Imaging', 'Cardiology', 'Pathology', 'Hematology', 'Endocrinology'];

export default function PatientReports() {
  const src = useSource(useListReports(), LAB_REPORTS.filter((r) => r.patient === 'Priya Sharma' || r.lab), mapReport);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState<LabReport | null>(null);
  const rows = useMemo(
    () => src.rows.filter((r) => (cat === 'All' || r.category === cat) && [r.name, r.lab, r.category].join(' ').toLowerCase().includes(q.toLowerCase())),
    [src.rows, q, cat],
  );
  const paged = usePaged(rows, 8);
  const critical = src.rows.filter((r) => r.status === 'Critical').length;

  return (
    <Page>
      <PageHeader title="Lab Reports" subtitle="Access and manage your diagnostic history." actions={<Btn href="/patient/appointments/book-lab" icon={<FlaskConical className="size-4" />}>Book a Test</Btn>} />
      {critical > 0 && (
        <Callout tone="red" icon={<AlertTriangle />} title={`${critical} report${critical > 1 ? 's' : ''} flagged critical`} className="mb-5">
          Your doctor has been notified. Open the report to read the lab's note and next steps.
        </Callout>
      )}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput className="w-full lg:w-96" value={q} onChange={setQ} placeholder="Search report name, laboratory, or category..." />
        <CapsuleTabs tabs={REPORT_CATEGORIES.slice(0, 5)} value={cat} onChange={setCat} />
      </div>
      <Card className="overflow-hidden">
        {src.error && <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-[13px] text-red-700">{src.error}</p>}
        <DataTable
          loading={src.loading}
          rows={paged.slice}
          rowKey={(r) => r.id}
          onRowClick={setOpen}
          rowClassName={(r) => (r.status === 'Critical' ? 'bg-red-50/40' : undefined)}
          empty={<EmptyState icon={<FlaskConical />} title="No reports found" description="Reports published by your labs will show up here automatically." />}
          columns={[
            { key: 'date', header: 'Date Uploaded', cell: (r) => <span className="whitespace-nowrap">{fmtDate(r.date)}</span> },
            { key: 'name', header: 'Report Name', cell: (r) => <span className="font-semibold text-ink">{r.name}</span> },
            { key: 'lab', header: 'Laboratory', hideOnMobile: true, cell: (r) => r.lab },
            { key: 'cat', header: 'Category', hideOnMobile: true, cell: (r) => r.category },
            { key: 'st', header: 'Status', cell: (r) => <StatusPill status={r.status} /> },
            { key: 'a', header: 'Actions', align: 'right', cell: (r) => <Btn size="xs" variant="secondary" onClick={(e) => { e.stopPropagation(); setOpen(r); }}>View Details</Btn> },
          ]}
        />
        {rows.length > 0 && <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} onPage={paged.setPage} noun="reports" />}
      </Card>
      <ReportDrawer report={open} onClose={() => setOpen(null)} />
    </Page>
  );
}

export function ReportDrawer({ report, onClose, showPatient }: { report: (LabReport & { fileUrl?: string; criticalNote?: string }) | null; onClose: () => void; showPatient?: boolean }) {
  return (
    <Drawer
      open={!!report}
      onClose={onClose}
      title={report?.name ?? ''}
      subtitle={report ? `${report.lab} · ${fmtDate(report.date)}` : ''}
      footer={
        report?.fileUrl ? (
          <Btn href={undefined} onClick={() => window.open(report.fileUrl, '_blank', 'noopener')} icon={<Download className="size-4" />}>
            Open Report File
          </Btn>
        ) : (
          <Btn variant="outline" onClick={() => window.print()} icon={<Download className="size-4" />}>
            Print Summary
          </Btn>
        )
      }
    >
      {report && (
        <div className="space-y-6">
          {report.status === 'Critical' && (
            <Callout tone="red" icon={<AlertTriangle />} title="Critical values detected">
              {report.criticalNote ?? 'One or more values are outside the critical reference range. Your doctor has been alerted.'}
            </Callout>
          )}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
            {showPatient && <InfoRow label="Patient" value={report.patient} />}
            {showPatient && <InfoRow label="Health ID" value={report.patientId} />}
            <InfoRow label="Report ID" value={report.id} />
            <InfoRow label="Category" value={report.category} />
            <InfoRow label="Laboratory" value={report.lab} />
            <InfoRow label="Status" value={<StatusPill status={report.status} />} />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-4">Findings / Observations</p>
            <p className="whitespace-pre-line rounded-2xl border border-line-soft p-4 text-sm leading-relaxed text-ink-2">{report.findings || 'No written findings were attached to this report.'}</p>
          </div>
        </div>
      )}
    </Drawer>
  );
}

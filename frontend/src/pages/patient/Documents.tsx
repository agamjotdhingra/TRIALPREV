import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';
import { Download, Eye, FolderOpen, LayoutGrid, List, MoreHorizontal, Share2, ShieldCheck, Trash2, Upload, Users, X } from 'lucide-react';
import { useListDocuments } from '@/api/hooks';
import { del } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { Btn, Card, Checkbox, Chip, EmptyState, FileIcon, Modal, Page, PageHeader, Pagination, SearchInput, Skeleton, usePaged } from '@/components/kit';
import { DOC_CATEGORIES, type Doc } from '@/data/demo';
import { mapDoc } from '@/data/mappers';
import { fmtDate } from '@/data/source';
import { openStoredFile, store, useStore } from '@/data/store';
import { cn } from '@/lib/utils';

type D = Doc & { url?: string };

export function usePatientDocs() {
  const { isDemo } = useAuth();
  const q = useListDocuments();
  const demoDocs = useStore((s) => s.docs);
  if (isDemo) return { docs: demoDocs as D[], loading: false, error: null as string | null, live: false };
  return { docs: (q.data ?? []).map(mapDoc) as D[], loading: q.isLoading, error: q.isError ? (q.error as Error).message : null, live: true };
}

export default function PatientDocuments() {
  const { docs, loading, error, live } = usePatientDocs();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selecting, setSelecting] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  const cats = ['All', ...DOC_CATEGORIES.filter((c) => docs.some((d) => d.category === c))];
  const rows = useMemo(() => docs.filter((d) => (cat === 'All' || d.category === cat) && d.name.toLowerCase().includes(q.toLowerCase())), [docs, q, cat]);
  const paged = usePaged(rows, view === 'grid' ? 9 : 6);
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const exitSelect = () => { setSelecting(false); setSel(new Set()); };

  async function open(d: D) {
    try {
      await openStoredFile(d.url);
    } catch (e: any) {
      toast.info(e.message);
    }
  }

  async function remove(ids: string[]) {
    setBusy(true);
    try {
      if (live) {
        await Promise.all(ids.map((id) => del(`/documents/${id}`)));
        qc.invalidateQueries({ queryKey: ['documents'] });
        toast.success(`${ids.length} document${ids.length > 1 ? 's' : ''} deleted`);
      } else {
        store.set((s) => ({
          docs: s.docs.filter((d) => !ids.includes(d.id)),
          deleted: [...s.docs.filter((d) => ids.includes(d.id)).map((d) => ({ ...d, deletedAt: new Date().toISOString() })), ...s.deleted],
        }));
        toast.success(`${ids.length} moved to Recently Deleted`, { action: { label: 'Undo', onClick: () => store.set((s) => ({ docs: [...s.deleted.filter((d) => ids.includes(d.id)), ...s.docs], deleted: s.deleted.filter((d) => !ids.includes(d.id)) })) } });
      }
      exitSelect();
    } catch (e: any) {
      toast.error(e.message ?? 'Could not delete');
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  return (
    <Page>
      <PageHeader
        title="My Documents"
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{live ? `${docs.length} files` : '42.8 MB used of 5 GB'}</span>
            <Link href="/patient/access" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
              <Users className="size-3.5" /> Who Has Access
            </Link>
            <Link href="/patient/documents/deleted" className="inline-flex items-center gap-1.5 font-semibold text-ink-2 hover:text-brand-700">
              <Trash2 className="size-3.5" /> Recently Deleted
            </Link>
          </span>
        }
        actions={
          <Btn href="/patient/documents/upload" icon={<Upload className="size-4" />}>
            Upload Document
          </Btn>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput className="flex-1" value={q} onChange={setQ} placeholder="Search documents..." />
        {selecting ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-brand-800">{sel.size} selected</span>
            <Btn size="sm" variant="outline" onClick={exitSelect}>
              Cancel
            </Btn>
          </div>
        ) : (
          <Btn size="sm" variant="outline" className="h-10" onClick={() => setSelecting(true)} disabled={!docs.length}>
            Select
          </Btn>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <Chip key={c} size="sm" selected={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-ink-3">{rows.length} Total Documents</span>
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {(['list', 'grid'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} className={cn('rounded-md p-1.5 transition-colors', view === v ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-3 hover:text-ink')}>
                {v === 'list' ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={<FolderOpen />} title={q || cat !== 'All' ? 'No documents match' : 'No documents yet'} description="Upload discharge summaries, insurance cards, prescriptions and more — all encrypted." action={<Btn size="sm" href="/patient/documents/upload">Upload Document</Btn>} />
        </Card>
      ) : view === 'list' ? (
        <Card className="divide-y divide-line-soft overflow-hidden">
          {paged.slice.map((d) => (
            <div key={d.id} onClick={selecting ? () => toggle(d.id) : undefined} className={cn('group flex items-center gap-4 px-5 py-4 transition-colors', selecting ? 'cursor-pointer' : '', sel.has(d.id) ? 'bg-brand-50/60' : 'hover:bg-slate-50/70')}>
              {selecting && <Checkbox round checked={sel.has(d.id)} onChange={() => toggle(d.id)} />}
              <FileIcon name={d.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{d.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-3">
                  {d.category} · {fmtDate(d.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                  {d.size && ` · ${d.size}`}
                </p>
                {(d.sharedWith || d.finalizedBy) && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                    {d.finalizedBy ? <ShieldCheck className="size-3.5" /> : <Users className="size-3.5" />}
                    {d.finalizedBy ? `Finalized by ${d.finalizedBy}` : `Shared with ${d.sharedWith}`}
                  </p>
                )}
              </div>
              {!selecting && <RowActions onPreview={() => open(d)} onDelete={() => setConfirm([d.id])} />}
            </div>
          ))}
          <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} onPage={paged.setPage} noun="documents" />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.slice.map((d) => (
              <Card key={d.id} onClick={selecting ? () => toggle(d.id) : undefined} className={cn('relative p-5 transition-all hover:shadow-lift', selecting && 'cursor-pointer', sel.has(d.id) && 'ring-2 ring-brand-400')}>
                {selecting && <Checkbox round className="absolute right-4 top-4" checked={sel.has(d.id)} onChange={() => toggle(d.id)} />}
                <FileIcon name={d.name} size={52} />
                <p className="mt-4 truncate text-sm font-semibold text-ink">{d.name}</p>
                <p className="mt-0.5 text-xs text-ink-3">{d.category} · {fmtDate(d.date, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                {!selecting && (
                  <div className="mt-4 flex justify-between">
                    <Btn size="xs" variant="secondary" onClick={() => open(d)} icon={<Eye className="size-3.5" />}>
                      Preview
                    </Btn>
                    <RowActions compact onPreview={() => open(d)} onDelete={() => setConfirm([d.id])} />
                  </div>
                )}
              </Card>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-white shadow-card">
            <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} onPage={paged.setPage} noun="documents" />
          </div>
        </>
      )}

      {selecting && (
        <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center px-4 animate-fade-up">
          <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-full bg-ink px-3 py-2.5 pl-6 text-white shadow-2xl">
            <button className="text-sm font-semibold text-brand-200 hover:text-white" onClick={() => setSel(sel.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)))}>
              {sel.size === rows.length ? 'Clear selection' : `Select all ${rows.length}`}
            </button>
            <div className="flex gap-2">
              <Btn size="sm" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" disabled={!sel.size} href={sel.size ? '/patient/access/grant' : undefined} icon={<Share2 className="size-4" />}>
                Share
              </Btn>
              <Btn size="sm" variant="danger" disabled={!sel.size} onClick={() => setConfirm([...sel])} icon={<Trash2 className="size-4" />}>
                Delete
              </Btn>
              <button onClick={exitSelect} className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Exit select mode">
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        icon={<span className="inline-flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="size-6" /></span>}
        title={`Delete ${confirm?.length ?? 0} document${(confirm?.length ?? 0) > 1 ? 's' : ''}?`}
        description={live ? 'This permanently removes the file from your records and cannot be undone.' : 'Deleted documents stay in Recently Deleted for 30 days.'}
        footer={
          <>
            <Btn variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Btn>
            <Btn variant="danger" loading={busy} onClick={() => confirm && remove(confirm)}>
              Delete
            </Btn>
          </>
        }
      />
    </Page>
  );
}

function RowActions({ onPreview, onDelete, compact }: { onPreview: () => void; onDelete: () => void; compact?: boolean }) {
  const item = 'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-2 outline-none data-[highlighted]:bg-slate-50';
  return (
    <div className="flex items-center gap-1">
      {!compact && (
        <>
          <button onClick={onPreview} className="rounded-lg p-2 text-ink-3 transition-colors hover:bg-brand-50 hover:text-brand-700" aria-label="Preview">
            <Eye className="size-4" />
          </button>
          <button onClick={onPreview} className="rounded-lg p-2 text-ink-3 transition-colors hover:bg-brand-50 hover:text-brand-700" aria-label="Download">
            <Download className="size-4" />
          </button>
        </>
      )}
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger className="rounded-lg p-2 text-ink-3 outline-none transition-colors hover:bg-slate-100 hover:text-ink" aria-label="More options">
          <MoreHorizontal className="size-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-[170px] rounded-xl border border-line-soft bg-white p-1 shadow-lift">
            <DropdownMenu.Item className={item} onSelect={onPreview}>
              <Download className="size-4" /> Download
            </DropdownMenu.Item>
            <DropdownMenu.Item className={item} asChild>
              <Link href="/patient/access/grant">
                <Share2 className="size-4" /> Share with doctor
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-line-soft" />
            <DropdownMenu.Item className={cn(item, 'text-red-600 data-[highlighted]:bg-red-50')} onSelect={onDelete}>
              <Trash2 className="size-4" /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

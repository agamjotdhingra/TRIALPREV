import { useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { Btn, Card, EmptyState, FileIcon, Modal, Page, PageHeader } from '@/components/kit';
import { store, useStore } from '@/data/store';
import { fmtDate } from '@/data/source';

export default function RecentlyDeleted() {
  const { isDemo } = useAuth();
  const deleted = useStore((s) => s.deleted);
  const [confirm, setConfirm] = useState(false);

  const restore = (id: string) => {
    store.set((s) => {
      const d = s.deleted.find((x) => x.id === id);
      return { deleted: s.deleted.filter((x) => x.id !== id), docs: d ? [d, ...s.docs] : s.docs };
    });
    toast.success('Document restored');
  };

  return (
    <Page width="lg">
      <PageHeader
        back={{ href: '/patient/documents', label: 'My Documents' }}
        title="Recently Deleted"
        subtitle="Items are permanently removed after 30 days."
        actions={
          <Btn variant="danger-soft" disabled={!deleted.length} onClick={() => setConfirm(true)} icon={<Trash2 className="size-4" />}>
            Empty bin
          </Btn>
        }
      />
      <Card className="divide-y divide-line-soft overflow-hidden">
        {deleted.length === 0 ? (
          <EmptyState icon={<Trash2 />} title="Bin is empty" description={isDemo ? 'Documents you delete will wait here for 30 days before they are removed for good.' : 'Deleted documents are removed from your records immediately.'} />
        ) : (
          deleted.map((d) => {
            const days = Math.max(0, 30 - Math.floor((Date.now() - new Date(d.deletedAt).getTime()) / 864e5));
            return (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4">
                <FileIcon name={d.name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{d.name}</p>
                  <p className="text-xs text-ink-3">
                    Deleted {fmtDate(d.deletedAt, { day: 'numeric', month: 'short' })} · {days} days left
                  </p>
                </div>
                <Btn size="sm" variant="secondary" onClick={() => restore(d.id)} icon={<RotateCcw className="size-3.5" />}>
                  Restore
                </Btn>
              </div>
            );
          })
        )}
      </Card>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        size="sm"
        icon={<span className="inline-flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="size-6" /></span>}
        title="Empty the bin?"
        description={`${deleted.length} document${deleted.length > 1 ? 's' : ''} will be permanently deleted. This cannot be undone.`}
        footer={
          <>
            <Btn variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                store.set({ deleted: [] });
                setConfirm(false);
                toast.success('Bin emptied');
              }}
            >
              Delete forever
            </Btn>
          </>
        }
      />
    </Page>
  );
}

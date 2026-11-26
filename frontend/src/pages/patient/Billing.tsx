import { useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, Download, IndianRupee, Receipt, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import { Badge, Btn, CapsuleTabs, Card, CardHeader, DataTable, Kpi, Modal, Page, PageHeader, StatusPill } from '@/components/kit';
import { INVOICES } from '@/data/demo';
import { fmtDate } from '@/data/source';
import { cn } from '@/lib/utils';

type Inv = (typeof INVOICES)[number];

export default function Billing() {
  const [tab, setTab] = useState<'All' | 'Due' | 'Paid' | 'Refunded'>('All');
  const [pay, setPay] = useState<Inv | null>(null);
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const rows = INVOICES.filter((i) => tab === 'All' || i.status === tab);
  const due = INVOICES.filter((i) => i.status === 'Due').reduce((a, i) => a + i.amount, 0);
  const paid = INVOICES.filter((i) => i.status === 'Paid').reduce((a, i) => a + i.amount, 0);

  const download = (i: Inv) => {
    const w = window.open('', '_blank', 'width=720,height=900');
    if (!w) return toast.error('Allow pop-ups to download the invoice.');
    w.document.write(`<html><head><title>${i.id}</title><style>body{font-family:Inter,system-ui,sans-serif;padding:48px;color:#0f172a}h1{color:#006b45;margin:0}table{width:100%;border-collapse:collapse;margin-top:32px}td,th{padding:12px;border-bottom:1px solid #e2e8f0;text-align:left}.r{text-align:right}</style></head><body><h1>PREVNTIV</h1><p style="color:#64748b">Tax Invoice · ${i.id} · ${fmtDate(i.date)}</p><table><tr><th>Description</th><th class="r">Amount</th></tr><tr><td>${i.desc}</td><td class="r">₹${i.amount.toLocaleString('en-IN')}</td></tr><tr><th>Total</th><th class="r">₹${i.amount.toLocaleString('en-IN')}</th></tr></table><p style="margin-top:32px;color:#64748b">Status: ${i.status} · Method: ${i.method}</p><script>window.print()</script></body></html>`);
    w.document.close();
  };

  return (
    <Page>
      <PageHeader title="Billing" subtitle="Invoices, payments and insurance for your care." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi tone="hero" label="Outstanding balance" value={`₹${due.toLocaleString('en-IN')}`} sub="1 invoice due by 28 Jun 2026" icon={<Wallet />} />
        <Kpi label="Paid this year" value={`₹${paid.toLocaleString('en-IN')}`} sub={`${INVOICES.filter((i) => i.status === 'Paid').length} payments`} icon={<IndianRupee />} />
        <Kpi label="Insurance coverage" value="₹5,00,000" sub="Star Health · Policy ending 2027" icon={<ShieldCheck />} />
      </div>
      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Invoices" subtitle="Consultations, lab tests and procedures" icon={<Receipt className="size-[18px]" />} action={<CapsuleTabs tabs={['All', 'Due', 'Paid', 'Refunded']} value={tab} onChange={setTab} />} />
        <DataTable
          className="mt-5"
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: 'id', header: 'Invoice', cell: (i) => <span className="font-mono text-xs font-semibold text-ink-2">{i.id}</span> },
            { key: 'd', header: 'Date', cell: (i) => fmtDate(i.date) },
            { key: 'desc', header: 'Description', cell: (i) => <span className="font-medium text-ink">{i.desc}</span> },
            { key: 'm', header: 'Method', hideOnMobile: true, cell: (i) => i.method },
            { key: 'amt', header: 'Amount', align: 'right', cell: (i) => <span className="num font-semibold text-ink">₹{i.amount.toLocaleString('en-IN')}</span> },
            { key: 's', header: 'Status', cell: (i) => <StatusPill status={i.status} /> },
            {
              key: 'a',
              header: '',
              align: 'right',
              cell: (i) =>
                i.status === 'Due' ? (
                  <Btn size="xs" onClick={() => setPay(i)}>
                    Pay now
                  </Btn>
                ) : (
                  <button onClick={() => download(i)} className="rounded-lg p-2 text-ink-3 hover:bg-brand-50 hover:text-brand-700" aria-label={`Download ${i.id}`}>
                    <Download className="size-4" />
                  </button>
                ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!pay}
        onClose={() => setPay(null)}
        title="Pay invoice"
        description={pay ? `${pay.desc} · ${pay.id}` : ''}
        footer={
          <>
            <Btn variant="outline" onClick={() => setPay(null)}>
              Cancel
            </Btn>
            <Btn
              onClick={() => {
                toast.info('Online payments open on the secure payment page once the gateway is enabled for your account. You can also pay at the facility.');
                setPay(null);
              }}
            >
              Continue to secure payment
            </Btn>
          </>
        }
      >
        {pay && (
          <>
            <div className="flex items-baseline justify-between rounded-2xl bg-slate-50 px-5 py-4">
              <span className="text-sm text-ink-3">Amount due</span>
              <span className="num font-display text-2xl font-bold text-ink">₹{pay.amount.toLocaleString('en-IN')}</span>
            </div>
            <p className="mb-2 mt-5 text-[13px] font-medium text-ink-2">Payment method</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'upi' as const, l: 'UPI', s: 'GPay, PhonePe, Paytm', i: Smartphone },
                { k: 'card' as const, l: 'Card', s: 'Visa •• 4242', i: CreditCard },
              ].map((m) => (
                <button key={m.k} onClick={() => setMethod(m.k)} className={cn('flex items-center gap-3 rounded-2xl border p-4 text-left transition-all', method === m.k ? 'border-brand-400 bg-brand-50 ring-4 ring-brand-100' : 'border-line hover:border-brand-200')}>
                  <m.i className="size-5 text-brand-700" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{m.l}</span>
                    <span className="block text-xs text-ink-3">{m.s}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-3">
              <ShieldCheck className="size-3.5" /> You'll confirm the payment on the provider's secure page. <Badge tone="green" className="ml-1">PCI-DSS</Badge>
            </p>
          </>
        )}
      </Modal>
    </Page>
  );
}

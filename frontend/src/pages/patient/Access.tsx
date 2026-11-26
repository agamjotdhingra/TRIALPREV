import { useMemo, useState } from 'react';
import { Link, Redirect, useLocation, useParams } from 'wouter';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Building2, CalendarDays, Check, ChevronRight, ClipboardList, Download, Eye, FileText, FlaskConical, History, Lock, Pencil, Pill, Plus, Search, ShieldCheck, ShieldOff, Stethoscope, UserPlus, Users,
} from 'lucide-react';
import { Avatar, Badge, Btn, CapsuleTabs, Card, Checkbox, EmptyState, FileIcon, Modal, Page, PageHeader, SearchInput, StepDots, Switch } from '@/components/kit';
import { ACCESS_LOG, APPOINTMENTS, DOCUMENTS, LAB_REPORTS, PRESCRIPTIONS, type Grant } from '@/data/demo';
import { fmtDate } from '@/data/source';
import { store, useStore } from '@/data/store';
import { cn } from '@/lib/utils';

/* ───────── shared ───────── */

export const CATEGORIES = [
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'lab-reports', label: 'Lab Reports', icon: FlaskConical },
  { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays },
  { key: 'clinical-profile', label: 'Clinical Profile', icon: ClipboardList },
] as const;
type CatKey = (typeof CATEGORIES)[number]['key'];

interface RecordItem { id: string; title: string; meta: string; file?: string }

function recordsFor(cat: CatKey): RecordItem[] {
  switch (cat) {
    case 'documents':
      return DOCUMENTS.slice(0, 5).map((d) => ({ id: d.id, title: d.name, meta: `${d.category} • ${fmtDate(d.date)}`, file: d.name }));
    case 'lab-reports':
      return LAB_REPORTS.filter((r) => r.patient === 'Priya Sharma').map((r) => ({ id: r.id, title: r.name, meta: `${r.category} • ${fmtDate(r.date)}` }));
    case 'prescriptions':
      return PRESCRIPTIONS.map((p) => ({ id: p.id, title: p.diagnosis, meta: `${p.doctor} • ${p.medicines.map((m) => m.name).join(', ')}` }));
    case 'appointments':
      return APPOINTMENTS.map((a) => ({ id: a.id, title: `${a.specialty} ${a.status === 'Completed' ? 'Consultation' : 'Follow-up'} — ${a.doctor}`, meta: `${fmtDate(a.date)} • ${a.type}` }));
    default:
      return [
        { id: 'cp1', title: 'Allergies & Conditions', meta: 'Penicillin allergy, Hypertension' },
        { id: 'cp2', title: 'Vitals & Lifestyle', meta: 'BMI, sleep, smoking & alcohol' },
        { id: 'cp3', title: 'Family History', meta: 'Heart disease' },
      ];
  }
}
const TOTAL = CATEGORIES.reduce((a, c) => a + recordsFor(c.key).length, 0);

function KindIcon({ kind, className }: { kind: Grant['kind']; className?: string }) {
  const I = kind === 'doctor' ? Stethoscope : kind === 'hospital' ? Building2 : FlaskConical;
  return (
    <span className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700', className)}>
      <I className="size-5" />
    </span>
  );
}

const DURATIONS = ['7 days', '30 days', '90 days', 'No expiry'] as const;
function expiryLabel(d: string, custom?: string) {
  if (d === 'No expiry') return 'No expiry';
  if (d === 'custom' && custom) return `Expires ${fmtDate(custom)}`;
  const days = parseInt(d);
  return `Expires ${fmtDate(new Date(Date.now() + days * 864e5))}`;
}

/* ───────── Who has access ───────── */

export function WhoHasAccess() {
  const grants = useStore((s) => s.grants);
  const requests = useStore((s) => s.requests);
  return (
    <Page>
      <PageHeader
        eyebrow="EHR Access Management"
        title="Who Has Access"
        subtitle="See and control everyone who can view your health records."
        actions={
          <Btn href="/patient/access/grant" icon={<Plus className="size-4" />}>
            Give Access
          </Btn>
        }
      />

      {requests.length > 0 && (
        <Link href="/patient/access/requests" className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-5 py-4 transition-shadow hover:shadow-card">
          <span className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <UserPlus className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">
                {requests.length} access request{requests.length > 1 ? 's' : ''} waiting
              </span>
              <span className="block text-xs text-ink-3">{requests.map((r) => r.who).join(' and ')} asked to see your records.</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800">
            Review <ArrowRight className="size-4" />
          </span>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Active permissions · {grants.length}</p>
          {grants.length === 0 && (
            <Card>
              <EmptyState icon={<Lock />} title="Only you can see your records" description="Share specific records with a doctor, hospital or lab — for as long as you choose." action={<Btn size="sm" href="/patient/access/grant">Give Access</Btn>} />
            </Card>
          )}
          {grants.map((g) => (
            <Card key={g.id} className="flex flex-col gap-4 p-5 transition-shadow hover:shadow-lift sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <KindIcon kind={g.kind} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{g.who}</p>
                  <p className="truncate text-xs text-ink-3">{g.affiliation}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:w-64 sm:flex-col sm:items-start sm:gap-1">
                <Badge tone="mint">{g.scope}</Badge>
                <span className={cn('text-xs font-medium', g.expiringSoon ? 'text-amber-700' : 'text-ink-3')}>{g.expiry}</span>
              </div>
              <Btn size="sm" variant="outline" href={`/patient/access/${g.id}`} icon={<Pencil className="size-3.5" />}>
                Manage
              </Btn>
            </Card>
          ))}
        </div>

        <aside className="space-y-4">
          <Card className="overflow-hidden">
            <div className="btn-gradient p-5 text-white">
              <ShieldCheck className="size-7" />
              <p className="mt-3 font-display text-lg font-bold">Your Data is Protected</p>
              <p className="mt-1 text-[13px] text-white/80">End-to-end encrypted. Nobody sees your records without your explicit consent, and every view is logged.</p>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-[15px] font-bold text-ink">Access Log</p>
                <Link href="/patient/access/log" className="text-xs font-semibold text-brand-700 hover:underline">
                  View all
                </Link>
              </div>
              <ol className="relative space-y-4 border-l border-line pl-4">
                {ACCESS_LOG.slice(0, 4).map((l) => (
                  <li key={l.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-white bg-brand-500" />
                    <p className="text-[13px] font-medium leading-snug text-ink">{l.text}</p>
                    <p className="text-[11px] text-ink-3">{l.meta.split(' · ')[0]}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
          <Link href="/patient/access/log" className="card flex items-center justify-between p-4 text-sm font-semibold text-ink transition-shadow hover:shadow-lift">
            <span className="flex items-center gap-2.5">
              <History className="size-4 text-brand-600" /> Full access history
            </span>
            <ChevronRight className="size-4 text-ink-3" />
          </Link>
        </aside>
      </div>
    </Page>
  );
}

/* ───────── Scope editor (used by Manage + Give Access) ───────── */

interface Scope { all: boolean; cats: Record<string, string[] | 'all'> }

function ScopeEditor({ scope, onChange, recipient }: { scope: Scope; onChange: (s: Scope) => void; recipient: string }) {
  const [choosing, setChoosing] = useState<CatKey | null>(null);
  const count = (k: CatKey) => {
    const v = scope.cats[k];
    const n = recordsFor(k).length;
    return v === 'all' ? n : v?.length ?? 0;
  };
  const allChecked = CATEGORIES.every((c) => scope.cats[c.key] === 'all');
  return (
    <div className="space-y-3">
      {[
        { all: true, t: 'Everything in my EHR', s: 'All current and future records' },
        { all: false, t: 'Only what I choose', s: 'Custom granular access per medical category' },
      ].map((o) => (
        <div key={o.t} className={cn('rounded-2xl border transition-all', scope.all === o.all ? 'border-brand-400 bg-brand-50/50 ring-4 ring-brand-100' : 'border-line bg-white hover:border-brand-200')}>
          <button type="button" onClick={() => onChange({ ...scope, all: o.all })} className="flex w-full items-center gap-4 p-4 text-left">
            <span className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2', scope.all === o.all ? 'border-brand-700 bg-brand-700' : 'border-slate-300')}>
              {scope.all === o.all && <span className="size-2 rounded-full bg-white" />}
            </span>
            <span>
              <span className="block font-semibold text-ink">{o.t}</span>
              <span className="block text-xs text-ink-3">{o.s}</span>
            </span>
          </button>
          {!o.all && !scope.all && (
            <div className="border-t border-brand-100 px-4 pb-3 pt-1">
              {CATEGORIES.map((c) => {
                const n = recordsFor(c.key).length;
                const v = scope.cats[c.key];
                const on = v === 'all' || (Array.isArray(v) && v.length > 0);
                return (
                  <div key={c.key} className="flex items-center gap-3 border-b border-line-soft py-3 last:border-0">
                    <Checkbox checked={on} onChange={(x) => onChange({ ...scope, cats: { ...scope.cats, [c.key]: x ? 'all' : [] } })} />
                    <c.icon className="size-4 text-ink-3" />
                    <span className="flex-1 text-sm font-medium text-ink">{c.label}</span>
                    <span className="text-xs text-ink-3">
                      {count(c.key)} of {n}
                    </span>
                    {c.key !== 'clinical-profile' && (
                      <button type="button" onClick={() => setChoosing(c.key)} className="text-xs font-semibold text-brand-700 hover:underline">
                        Choose
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-brand-700 hover:underline"
                onClick={() => onChange({ ...scope, cats: Object.fromEntries(CATEGORIES.map((c) => [c.key, allChecked ? [] : 'all'])) })}
              >
                {allChecked ? 'Clear all' : 'Select All'}
              </button>
            </div>
          )}
        </div>
      ))}
      {choosing && (
        <Modal open onClose={() => setChoosing(null)} title={`Choose ${CATEGORIES.find((c) => c.key === choosing)!.label}`} description={`Tick what ${recipient} can see.`} size="lg">
          <RecordChooser
            category={choosing}
            initial={scope.cats[choosing] === 'all' ? recordsFor(choosing).map((r) => r.id) : ((scope.cats[choosing] as string[]) ?? [])}
            onCancel={() => setChoosing(null)}
            onDone={(ids) => {
              onChange({ ...scope, cats: { ...scope.cats, [choosing]: ids.length === recordsFor(choosing).length ? 'all' : ids } });
              setChoosing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function scopeSummary(s: Scope) {
  if (s.all) return { label: 'Everything', n: TOTAL, cats: CATEGORIES.map((c) => c.label) };
  let n = 0;
  const cats: string[] = [];
  CATEGORIES.forEach((c) => {
    const v = s.cats[c.key];
    const k = v === 'all' ? recordsFor(c.key).length : v?.length ?? 0;
    if (k) cats.push(c.label);
    n += k;
  });
  return { label: `${n} of ${TOTAL} records`, n, cats };
}

/* ───────── Record chooser ───────── */

export function RecordChooser({ category, initial, onDone, onCancel }: { category: CatKey; initial: string[]; onDone: (ids: string[]) => void; onCancel: () => void }) {
  const all = recordsFor(category);
  const [sel, setSel] = useState<Set<string>>(new Set(initial));
  const [q, setQ] = useState('');
  const rows = all.filter((r) => (r.title + r.meta).toLowerCase().includes(q.toLowerCase()));
  const Icon = CATEGORIES.find((c) => c.key === category)!.icon;
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput className="flex-1" value={q} onChange={setQ} placeholder={`Search ${CATEGORIES.find((c) => c.key === category)!.label.toLowerCase()}...`} />
        <Checkbox checked={sel.size === all.length} onChange={(v) => setSel(v ? new Set(all.map((r) => r.id)) : new Set())} label="Select all" />
      </div>
      <div className="mt-4 max-h-[46vh] divide-y divide-line-soft overflow-y-auto rounded-2xl border border-line-soft">
        {rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-3">Nothing matches “{q}”.</p>}
        {rows.map((r) => (
          <label key={r.id} className={cn('flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors', sel.has(r.id) ? 'bg-brand-50/50' : 'hover:bg-slate-50')}>
            <Checkbox checked={sel.has(r.id)} onChange={() => setSel((s) => { const n = new Set(s); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })} />
            {r.file ? <FileIcon name={r.file} size={38} /> : <span className="inline-flex size-[38px] items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-4" /></span>}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{r.title}</span>
              <span className="block truncate text-xs text-ink-3">{r.meta}</span>
            </span>
            <button type="button" onClick={(e) => { e.preventDefault(); toast.info(`Preview: ${r.title}`); }} className="rounded-lg p-2 text-ink-3 hover:bg-white hover:text-brand-700" aria-label={`Preview ${r.title}`}>
              <Eye className="size-4" />
            </button>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="flex items-center gap-1.5 text-xs text-ink-3">
          <Lock className="size-3.5" /> {sel.size} of {all.length} selected · shared encrypted
        </p>
        <div className="flex gap-2">
          <Btn variant="outline" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn onClick={() => onDone([...sel])} iconRight={<Check className="size-4" />}>
            Done
          </Btn>
        </div>
      </div>
    </div>
  );
}

/** Stand-alone record chooser route: /patient/access/:id/choose/:category */
export function ChooseRecordsPage() {
  const { id, category } = useParams<{ id: string; category: CatKey }>();
  const [, setLocation] = useLocation();
  const g = useStore((s) => s.grants.find((x) => x.id === id));
  if (!g || !CATEGORIES.some((c) => c.key === category)) return <Redirect to="/patient/access" />;
  const label = CATEGORIES.find((c) => c.key === category)!.label;
  return (
    <Page width="md">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">Step 2: Granular Permissions · {g.who}</p>
      <Card className="mx-auto p-6 sm:p-8">
        <Link href={`/patient/access/${id}`} className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-brand-700">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">Choose {label}</h1>
        <p className="mb-6 mt-1 text-sm text-ink-3">Tick what {g.who} can see.</p>
        <RecordChooser
          category={category}
          initial={g.categories.includes(label) ? recordsFor(category).map((r) => r.id) : []}
          onCancel={() => setLocation(`/patient/access/${id}`)}
          onDone={(ids) => {
            store.set((s) => ({ grants: s.grants.map((x) => (x.id === id ? { ...x, categories: ids.length ? Array.from(new Set([...x.categories, label])) : x.categories.filter((c) => c !== label), scope: x.scope === 'Everything' ? x.scope : `${ids.length} ${label.toLowerCase()}` } : x)) }));
            toast.success(`${label} updated for ${g.who}`);
            setLocation(`/patient/access/${id}`);
          }}
        />
      </Card>
    </Page>
  );
}

/* ───────── Manage access ───────── */

export function ManageAccess() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const g = useStore((s) => s.grants.find((x) => x.id === id));
  const [scope, setScope] = useState<Scope>(() => ({ all: g?.scope === 'Everything', cats: Object.fromEntries(CATEGORIES.map((c) => [c.key, g?.categories.includes(c.label) ? 'all' : []])) as Scope['cats'] }));
  const [dur, setDur] = useState<string>(g?.expiry === 'No expiry' ? 'No expiry' : '30 days');
  const [custom, setCustom] = useState('');
  const [revoke, setRevoke] = useState(false);
  if (!g) return <Redirect to="/patient/access" />;

  const save = () => {
    const sum = scopeSummary(scope);
    if (!sum.n) return toast.error('Choose at least one record, or revoke access instead.');
    store.set((s) => ({ grants: s.grants.map((x) => (x.id === id ? { ...x, scope: sum.label, categories: sum.cats, expiry: expiryLabel(dur, custom), expiringSoon: dur === '7 days' } : x)) }));
    toast.success(`Access updated for ${g.who}`);
    setLocation('/patient/access');
  };

  return (
    <Page width="md">
      <PageHeader back={{ href: '/patient/access', label: 'Who Has Access' }} title="Manage Access" />
      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <KindIcon kind={g.kind} className="size-14" />
        <div className="flex-1">
          <p className="font-display text-lg font-bold text-ink">{g.who}</p>
          <p className="text-sm text-ink-3">{g.affiliation}</p>
        </div>
        <div className="text-left sm:text-right">
          <Badge tone="green" dot>
            Active Access
          </Badge>
          <p className="mt-1 text-xs text-ink-3">{g.expiry}</p>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">What they can see</h2>
        <ScopeEditor scope={scope} onChange={setScope} recipient={g.who} />

        <h2 className="mb-4 mt-9 font-display text-lg font-bold text-ink">For how long</h2>
        <DurationPicker value={dur} onChange={setDur} custom={custom} onCustom={setCustom} />

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-line-soft pt-6 sm:flex-row">
          <button onClick={() => setRevoke(true)} className="text-sm font-semibold text-red-600 hover:underline">
            Revoke Access
          </button>
          <Btn onClick={save} icon={<Check className="size-4" />}>
            Save Changes
          </Btn>
        </div>
      </Card>

      <Modal
        open={revoke}
        onClose={() => setRevoke(false)}
        size="sm"
        icon={<span className="inline-flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-100"><ShieldOff className="size-6" /></span>}
        title={`Revoke access for ${g.who}?`}
        description="They will immediately lose access to all records you shared. You can give access again at any time."
        footer={
          <>
            <Btn variant="outline" onClick={() => setRevoke(false)}>
              Cancel
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                store.set((s) => ({ grants: s.grants.filter((x) => x.id !== id) }));
                toast.success(`Access revoked for ${g.who}`);
                setLocation('/patient/access');
              }}
            >
              Revoke Access
            </Btn>
          </>
        }
      />
    </Page>
  );
}

function DurationPicker({ value, onChange, custom, onCustom }: { value: string; onChange: (v: string) => void; custom: string; onCustom: (v: string) => void }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {DURATIONS.map((d) => (
          <button key={d} type="button" onClick={() => onChange(d)} className={cn('h-10 rounded-full border px-5 text-sm font-semibold transition-all', value === d ? 'border-brand-700 bg-brand-700 text-white shadow-sm' : 'border-line bg-white text-ink-2 hover:border-brand-300')}>
            {d}
          </button>
        ))}
        <button type="button" onClick={() => onChange('custom')} className={cn('h-10 px-3 text-sm font-semibold', value === 'custom' ? 'text-brand-700' : 'text-ink-3 hover:text-brand-700')}>
          Pick a date
        </button>
      </div>
      {value === 'custom' && <input type="date" min={new Date().toISOString().slice(0, 10)} value={custom} onChange={(e) => onCustom(e.target.value)} className="mt-3 h-10 rounded-xl border border-line px-3 text-sm outline-none focus:border-brand-500" aria-label="Expiry date" />}
    </div>
  );
}

/* ───────── Access requests ───────── */

export function AccessRequests() {
  const requests = useStore((s) => s.requests);
  const [, setLocation] = useLocation();
  const approve = (r: (typeof requests)[number]) => {
    store.set((s) => ({
      requests: s.requests.filter((x) => x.id !== r.id),
      grants: [{ id: `g-${r.id}`, who: r.who, kind: r.kind, affiliation: r.org, scope: r.wants.join(', '), expiry: expiryLabel('30 days'), categories: r.wants }, ...s.grants],
    }));
    toast.success(`${r.who} can now see your ${r.wants.join(' & ').toLowerCase()} for 30 days`);
  };
  return (
    <Page width="lg">
      <PageHeader back={{ href: '/patient/access', label: 'Who Has Access' }} title="Access Requests" subtitle="Approve only what you are comfortable sharing." />
      {requests.length === 0 && (
        <Card>
          <EmptyState icon={<Check />} title="No pending requests" description="When a doctor, hospital or lab asks to see your records, you'll review it here." action={<Btn size="sm" variant="secondary" href="/patient/access">Back to access</Btn>} />
        </Card>
      )}
      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <KindIcon kind={r.kind} />
                <div>
                  <p className="font-semibold text-ink">{r.who}</p>
                  <p className="text-xs text-ink-3">{r.org}</p>
                </div>
              </div>
              <span className="text-xs text-ink-3">{r.date}</span>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
                <span className="font-semibold text-ink">Wants:</span>
                {r.wants.map((w) => (
                  <Badge key={w} tone="mint">
                    {w}
                  </Badge>
                ))}
              </p>
              <p className="mt-2 text-sm italic text-ink-3">“{r.reason}”</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Btn size="sm" onClick={() => approve(r)} icon={<Check className="size-4" />}>
                Approve
              </Btn>
              <Btn size="sm" variant="outline" onClick={() => setLocation(`/patient/access/grant?to=${encodeURIComponent(r.who)}&req=${r.id}`)}>
                Choose what to share
              </Btn>
              <button
                onClick={() => {
                  store.set((s) => ({ requests: s.requests.filter((x) => x.id !== r.id) }));
                  toast(`Request from ${r.who} denied`);
                }}
                className="ml-auto text-sm font-semibold text-red-600 hover:underline"
              >
                Deny
              </button>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}

/* ───────── Give access wizard ───────── */

const DIRECTORY = [
  { who: 'Dr. Amit Sharma', kind: 'doctor' as const, org: 'Cardiology · Apollo Hospital', id: 'PRV-D-4092' },
  { who: 'Dr. Rohan Verma', kind: 'doctor' as const, org: 'Orthopedics · City Spine Center', id: 'PRV-D-4188' },
  { who: 'Dr. Kavita Patel', kind: 'doctor' as const, org: 'Endocrinology · City Clinic', id: 'PRV-D-3871' },
  { who: 'Metro General Hospital', kind: 'hospital' as const, org: 'Multi-speciality · Mumbai', id: 'PRV-H-0091' },
  { who: 'Apollo Diagnostics', kind: 'lab' as const, org: 'Jubilee Hills Branch', id: 'PRV-L-0420' },
];

export function GiveAccess() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const pre = DIRECTORY.find((d) => d.who === params.get('to'));
  const [step, setStep] = useState(pre ? 1 : 0);
  const [who, setWho] = useState(pre ?? null);
  const [q, setQ] = useState('');
  const [scope, setScope] = useState<Scope>({ all: false, cats: { documents: [], 'lab-reports': 'all', prescriptions: 'all', appointments: [], 'clinical-profile': [] } });
  const [dur, setDur] = useState('30 days');
  const [custom, setCustom] = useState('');
  const [download, setDownload] = useState(false);
  const results = useMemo(() => DIRECTORY.filter((d) => (d.who + d.org + d.id).toLowerCase().includes(q.toLowerCase())), [q]);
  const sum = scopeSummary(scope);

  const give = () => {
    if (!who) return;
    store.set((s) => ({
      grants: [{ id: `g-${Date.now()}`, who: who.who, kind: who.kind, affiliation: who.org, scope: sum.label, expiry: expiryLabel(dur, custom), expiringSoon: dur === '7 days', categories: sum.cats }, ...s.grants.filter((g) => g.who !== who.who)],
      requests: s.requests.filter((r) => r.id !== params.get('req')),
    }));
    toast.success(`${who.who} can now see ${sum.n} record${sum.n === 1 ? '' : 's'}`);
    setLocation('/patient/access');
  };

  return (
    <Page width="md">
      <Link href="/patient/access" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-brand-700">
        <ArrowLeft className="size-4" /> Who Has Access
      </Link>
      <Card className="p-6 sm:p-9">
        <StepDots total={3} current={step} />
        {step === 0 && (
          <>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink">Who do you want to share with?</h1>
            <p className="mt-1 text-sm text-ink-3">Search by name or Prevntiv ID.</p>
            <SearchInput className="mt-6" value={q} onChange={setQ} placeholder="e.g. Dr. Amit Sharma or PRV-D-4092" />
            <div className="mt-4 space-y-2">
              {results.map((d) => (
                <button key={d.id} onClick={() => setWho(d)} className={cn('flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all', who?.id === d.id ? 'border-brand-400 bg-brand-50 ring-4 ring-brand-100' : 'border-line-soft hover:border-brand-200 hover:bg-slate-50')}>
                  <KindIcon kind={d.kind} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{d.who}</span>
                    <span className="block text-xs text-ink-3">
                      {d.org} · {d.id}
                    </span>
                  </span>
                  {who?.id === d.id && <Check className="size-5 text-brand-700" />}
                </button>
              ))}
              {results.length === 0 && <EmptyState icon={<Search />} title="No one found" description="Check the spelling or ask them for their Prevntiv ID." />}
            </div>
            <div className="mt-8 flex justify-end border-t border-line-soft pt-6">
              <Btn disabled={!who} onClick={() => setStep(1)} iconRight={<ArrowRight className="size-4" />}>
                Next
              </Btn>
            </div>
          </>
        )}
        {step === 1 && who && (
          <>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink">What can {who.who} see?</h1>
            <p className="mb-6 mt-1 text-sm text-ink-3">Control precisely what health information is shared with your {who.kind === 'doctor' ? 'doctor' : who.kind}.</p>
            <ScopeEditor scope={scope} onChange={setScope} recipient={who.who} />
            <p className="mt-4 text-xs text-ink-3">{sum.n} record{sum.n === 1 ? '' : 's'} selected</p>
            <div className="mt-8 flex justify-between border-t border-line-soft pt-6">
              <Btn variant="ghost" onClick={() => setStep(0)} icon={<ArrowLeft className="size-4" />}>
                Back
              </Btn>
              <Btn disabled={!sum.n} onClick={() => setStep(2)} iconRight={<ArrowRight className="size-4" />}>
                Next
              </Btn>
            </div>
          </>
        )}
        {step === 2 && who && (
          <>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink">For how long?</h1>
            <p className="mb-6 mt-1 text-sm text-ink-3">Choose how long {who.who} can view the selected records.</p>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-4">Access Duration</p>
            <DurationPicker value={dur} onChange={setDur} custom={custom} onCustom={setCustom} />
            <div className="mt-7 flex items-center justify-between rounded-2xl border border-line-soft p-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Download className="size-4 text-ink-3" /> Allow download
                </p>
                <p className="text-xs text-ink-3">If off, they can view records but not save copies.</p>
              </div>
              <Switch checked={download} onChange={setDownload} label="Allow download" />
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-5 ring-1 ring-line-soft">
              <div className="flex items-center gap-3">
                <Avatar name={who.who} size={40} />
                <div>
                  <p className="font-semibold text-ink">{who.who}</p>
                  <p className="text-xs text-ink-3">
                    {sum.label} · {dur === 'No expiry' ? 'No expiry' : `until ${expiryLabel(dur, custom).replace('Expires ', '')}`}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sum.cats.map((c) => (
                  <Badge key={c} tone="mint">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-8 flex justify-between border-t border-line-soft pt-6">
              <Btn variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft className="size-4" />}>
                Back
              </Btn>
              <Btn disabled={dur === 'custom' && !custom} onClick={give} icon={<ShieldCheck className="size-4" />}>
                Give Access
              </Btn>
            </div>
          </>
        )}
      </Card>
    </Page>
  );
}

/* ───────── Access log ───────── */

export function AccessLog() {
  const [tab, setTab] = useState<'All' | 'Viewed' | 'Downloaded' | 'Changes'>('All');
  const rows = ACCESS_LOG.filter((l) => tab === 'All' || l.kind === tab.toLowerCase());
  const days = Array.from(new Set(rows.map((r) => r.day)));
  const exportCsv = () => {
    const csv = ['Event,When,Item', ...ACCESS_LOG.map((l) => `"${l.text}","${l.meta.split(' · ')[0]}","${l.meta.split(' · ')[1] ?? ''}"`)].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'prevntiv-access-log.csv';
    a.click();
  };
  const icon = { viewed: Eye, downloaded: Download, changes: Users };
  return (
    <Page width="lg">
      <PageHeader back={{ href: '/patient/access', label: 'Who Has Access' }} title="Access Log" subtitle="Everyone who has seen your records." actions={<Btn variant="outline" size="sm" className="h-10" onClick={exportCsv} icon={<Download className="size-4" />}>Export</Btn>} />
      <CapsuleTabs className="mb-5" tabs={['All', 'Viewed', 'Downloaded', 'Changes']} value={tab} onChange={setTab} />
      <Card className="p-6 sm:p-8">
        {days.length === 0 && <EmptyState title="No activity" description="Nothing in this category yet." />}
        {days.map((d) => (
          <section key={d} className="mb-8 last:mb-0">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-4">{d}</p>
            <ol className="relative space-y-5 border-l border-line pl-6">
              {rows
                .filter((r) => r.day === d)
                .map((r) => {
                  const I = icon[r.kind];
                  return (
                    <li key={r.id} className="relative">
                      <span className={cn('absolute -left-[37px] top-0 inline-flex size-6 items-center justify-center rounded-full ring-4 ring-white', r.kind === 'changes' ? 'bg-amber-100 text-amber-700' : r.kind === 'downloaded' ? 'bg-sky-100 text-sky-700' : 'bg-brand-100 text-brand-700')}>
                        <I className="size-3" />
                      </span>
                      <p className="text-sm font-semibold text-ink">{r.text}</p>
                      <p className="mt-0.5 text-xs text-ink-3">{r.meta}</p>
                    </li>
                  );
                })}
            </ol>
          </section>
        ))}
      </Card>
    </Page>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, CalendarClock, FileText, FlaskConical, Lightbulb, Paperclip, Phone, Pill, Send, Stethoscope, Timer, Video } from 'lucide-react';
import { Avatar, Badge, Btn, Callout, Card, SearchInput } from '@/components/kit';
import { CHAT_MESSAGES, CHAT_THREADS, type Msg } from '@/data/demo';
import { cn } from '@/lib/utils';

const DOCTOR_THREADS = [
  { id: 't1', name: 'Priya Sharma', sub: 'ID: PRV-882-901', last: "Thank you, doctor. I'll get those...", time: '10:42 AM', unread: 2 },
  { id: 't2', name: 'Amit Patel', sub: 'ID: PRV-102-445', last: 'The report looks much better now.', time: 'Yesterday', unread: 0 },
  { id: 't3', name: 'Neha Kapoor', sub: 'ID: PRV-552-118', last: 'Prescription refilled.', time: 'Mon', unread: 0 },
];

const REPLIES = ['Noted, thank you. I will review and get back to you shortly.', "That's helpful. Please keep logging your readings daily.", "Let's discuss this on our call — I'll send a link."];

export default function Chat({ role = 'patient' }: { role?: 'patient' | 'doctor' }) {
  const threads = role === 'doctor' ? DOCTOR_THREADS : CHAT_THREADS;
  const [active, setActive] = useState(threads[0].id);
  const [q, setQ] = useState('');
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({ t1: CHAT_MESSAGES });
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [mobileThread, setMobileThread] = useState(false);
  const [secs, setSecs] = useState(14 * 60 + 32);
  const endRef = useRef<HTMLDivElement>(null);
  const t = threads.find((x) => x.id === active)!;
  const thread = msgs[active] ?? [{ id: 'x', from: role === 'doctor' ? 'patient' : 'doctor', text: t.last, time: t.time } as Msg];
  const me: Msg['from'] = role === 'doctor' ? 'doctor' : 'patient';

  useEffect(() => {
    const i = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thread.length, typing, active]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMsgs((m) => ({ ...m, [active]: [...thread, { id: String(Date.now()), from: me, text, time: now }] }));
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => ({ ...m, [active]: [...(m[active] ?? thread), { id: String(Date.now() + 1), from: me === 'doctor' ? 'patient' : 'doctor', text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }] }));
    }, 1600);
  }

  const visible = threads.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto grid h-[calc(100vh-4rem-1px)] max-w-[1440px] grid-cols-1 gap-0 lg:grid-cols-[300px_1fr] lg:gap-5 lg:p-6 xl:grid-cols-[300px_1fr_300px]">
      {/* Threads */}
      <Card className={cn('flex min-h-0 flex-col rounded-none border-0 lg:rounded-2xl lg:border', mobileThread && 'hidden lg:flex')}>
        <div className="border-b border-line-soft p-4">
          <h1 className="mb-3 font-display text-lg font-bold text-ink">Messages</h1>
          <SearchInput value={q} onChange={setQ} placeholder={role === 'doctor' ? 'Search patients...' : 'Search conversations...'} />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {visible.map((x) => (
            <button
              key={x.id}
              onClick={() => {
                setActive(x.id);
                setMobileThread(true);
              }}
              className={cn('flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors', active === x.id ? 'bg-brand-50' : 'hover:bg-slate-50')}
            >
              <Avatar name={x.name} size={40} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-ink">{x.name}</span>
                  <span className="shrink-0 text-[11px] text-ink-4">{x.time}</span>
                </span>
                <span className="block truncate text-[11px] font-medium text-brand-700">{x.sub}</span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-ink-3">{(msgs[x.id] ?? []).slice(-1)[0]?.text ?? x.last}</span>
                  {x.unread > 0 && active !== x.id && <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{x.unread}</span>}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Conversation */}
      <Card className={cn('flex min-h-0 flex-col overflow-hidden rounded-none border-0 lg:rounded-2xl lg:border', !mobileThread && 'hidden lg:flex')}>
        <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3 sm:px-5">
          <button className="rounded-lg p-1.5 text-ink-3 hover:bg-slate-100 lg:hidden" onClick={() => setMobileThread(false)} aria-label="Back to messages">
            <ArrowLeft className="size-5" />
          </button>
          <Avatar name={t.name} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{t.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-brand-700">
              <span className="size-1.5 rounded-full bg-brand-500" /> Online · {t.sub}
            </p>
          </div>
          <Btn size="sm" variant="secondary" icon={<Phone className="size-4" />} className="hidden sm:inline-flex">
            Call
          </Btn>
          <Btn size="sm" icon={<Video className="size-4" />}>
            Video
          </Btn>
        </div>
        {active === 't1' && (
          <div className="flex items-center justify-center gap-2 bg-brand-50 px-4 py-2 text-xs font-medium text-brand-800">
            <Timer className="size-3.5" /> Consultation active — ends in
            <b className="num font-bold">
              {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
            </b>
          </div>
        )}
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 px-4 py-6 sm:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-ink-4">Today, 10:30 AM</p>
          {thread.map((m) => {
            const mine = m.from === me;
            return (
              <div key={m.id} className={cn('flex items-end gap-2.5', mine && 'flex-row-reverse')}>
                {!mine && <Avatar name={role === 'doctor' ? t.name : 'Dr. Aditi Sharma'} size={28} />}
                <div className={cn('max-w-[78%] sm:max-w-[65%]')}>
                  {!mine && role === 'patient' && <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-700">Dr. Aditi Sharma</p>}
                  <div className={cn('rounded-2xl px-4 py-2.5 text-sm leading-relaxed', mine ? 'rounded-br-md bg-brand-700 text-white' : 'rounded-bl-md bg-white text-ink shadow-card')}>{m.text}</div>
                  <p className={cn('mt-1 text-[10px] text-ink-4', mine && 'text-right')}>{m.time}</p>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex items-center gap-2.5">
              <Avatar name={t.name} size={28} />
              <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-card">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 animate-bounce rounded-full bg-ink-4" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 border-t border-line-soft bg-white p-3 sm:p-4"
        >
          <button type="button" className="rounded-full p-2.5 text-ink-3 hover:bg-slate-100 hover:text-ink" aria-label="Attach file">
            <Paperclip className="size-5" />
          </button>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." className="h-11 flex-1 rounded-full bg-slate-100 px-5 text-sm outline-none transition-all placeholder:text-ink-4 focus:bg-white focus:ring-2 focus:ring-brand-500/30" aria-label="Message" />
          <Btn type="submit" disabled={!draft.trim()} icon={<Send className="size-4" />} className="h-11">
            <span className="hidden sm:inline">Send</span>
          </Btn>
        </form>
      </Card>

      {/* Context */}
      <aside className="hidden min-h-0 space-y-5 overflow-y-auto xl:block">
        {role === 'patient' ? (
          <>
            <Card className="p-5">
              <h3 className="font-display text-[15px] font-bold text-ink">My Care Plan</h3>
              <div className="mt-4 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                  <CalendarClock className="size-3.5" /> Next appointment
                </p>
                <p className="mt-2 font-semibold text-ink">15 Jul 2026</p>
                <p className="text-xs text-ink-3">10:00 AM • Blood Work Follow-up</p>
              </div>
              <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-4">Current medications</p>
              <ul className="space-y-2">
                {['Rosuvastatin 10mg — night', 'Amlodipine 5mg — morning'].map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm text-ink-2">
                    <Pill className="size-4 text-brand-600" /> {m}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="space-y-1 p-3">
              {[
                { href: '/patient/appointments?book=1', l: 'Book follow-up', i: CalendarClock },
                { href: '/patient/prescriptions', l: 'View prescriptions', i: Pill },
                { href: '/patient/reports', l: 'Share lab reports', i: FlaskConical },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-brand-50 hover:text-brand-800">
                  <a.i className="size-4" /> {a.l}
                </Link>
              ))}
            </Card>
            <Callout tone="amber" icon={<Lightbulb />} title="Tip">
              Keep a note of when you feel tired — it helps your doctor spot patterns.
            </Callout>
          </>
        ) : (
          <>
            <Card className="p-5 text-center">
              <Avatar name={t.name} size={64} className="mx-auto" />
              <p className="mt-3 font-semibold text-ink">{t.name}</p>
              <p className="text-xs text-ink-3">{t.sub}</p>
              <div className="mt-3 flex justify-center gap-2">
                <Badge tone="green">Score 85</Badge>
                <Badge tone="gray">O+</Badge>
              </div>
            </Card>
            <Card className="p-5">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-4">Latest vitals</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  ['120/80', 'BP'],
                  ['72', 'HR'],
                  ['98.6°', 'Temp'],
                  ['98%', 'SpO₂'],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-slate-50 py-2.5">
                    <p className="num font-display font-bold text-ink">{v}</p>
                    <p className="text-[10px] font-bold uppercase text-ink-3">{l}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="space-y-1 p-3">
              <Link href="/doctor/patients/p1" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-brand-50 hover:text-brand-800">
                <FileText className="size-4" /> Open full EHR
              </Link>
              <Link href="/doctor/prescriptions/new" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-brand-50 hover:text-brand-800">
                <Stethoscope className="size-4" /> Create prescription
              </Link>
            </Card>
          </>
        )}
      </aside>
    </div>
  );
}

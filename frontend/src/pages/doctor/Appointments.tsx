import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MessageSquare, User, Video } from 'lucide-react';
import { useListAppointments } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, Btn, Card, EmptyState, Kpi, Page, PageHeader, StatusPill } from '@/components/kit';
import { QUEUE } from '@/data/demo';
import { mapAppt } from '@/data/mappers';
import { cn } from '@/lib/utils';

interface Slot { id: string; date: string; time: string; name: string; reason: string; type: string; status: string; patientId?: string }

const iso = (d: Date) => d.toISOString().slice(0, 10);

function demoSlots(): Slot[] {
  const out: Slot[] = [];
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1);
  for (let d = 0; d < 6; d++) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    QUEUE.slice(0, 3 + (d % 3)).forEach((q, i) => out.push({ id: `${d}-${q.id}`, date: iso(day), time: ['09:00 AM', '09:30 AM', '10:15 AM', '11:00 AM', '02:00 PM'][i], name: q.name, reason: q.reason, type: q.type, status: day < new Date(new Date().toDateString()) ? 'Completed' : q.status === 'Cancelled' ? 'Cancelled' : 'Scheduled', patientId: q.id }));
  }
  return out;
}

export default function DoctorAppointments() {
  const { isDemo } = useAuth();
  const q = useListAppointments();
  const [weekOffset, setWeekOffset] = useState(0);
  const [day, setDay] = useState(iso(new Date()));
  const slots: Slot[] = useMemo(
    () => (isDemo || !q.data ? demoSlots() : q.data.map(mapAppt).map((a) => ({ id: a.id, date: a.date, time: a.time, name: a.patient ?? 'Patient', reason: a.reason, type: a.type, status: a.status, patientId: a.patientId ? String(a.patientId) : undefined }))),
    [q.data, isDemo],
  );
  const week = useMemo(() => {
    const s = new Date();
    s.setDate(s.getDate() - ((s.getDay() + 6) % 7) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, [weekOffset]);
  const todays = slots.filter((s) => s.date === day).sort((a, b) => a.time.localeCompare(b.time));
  const icon = (t: string) => (/video/i.test(t) ? Video : /chat|tele/i.test(t) ? MessageSquare : User);

  return (
    <Page>
      <PageHeader title="Schedule" subtitle="Your consultations across the week." />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="This week" value={slots.filter((s) => week.some((w) => iso(w) === s.date)).length} icon={<CalendarDays />} />
        <Kpi label="Today" value={slots.filter((s) => s.date === iso(new Date())).length} icon={<Clock />} />
        <Kpi label="Video" value={slots.filter((s) => /video/i.test(s.type)).length} icon={<Video />} />
        <Kpi label="In-person" value={slots.filter((s) => /person/i.test(s.type)).length} icon={<User />} />
      </div>
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-[15px] font-bold text-ink">{week[0].toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
          <div className="flex gap-1">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="rounded-lg p-2 text-ink-3 hover:bg-slate-100" aria-label="Previous week">
              <ChevronLeft className="size-4" />
            </button>
            <Btn size="xs" variant="outline" onClick={() => { setWeekOffset(0); setDay(iso(new Date())); }}>
              Today
            </Btn>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="rounded-lg p-2 text-ink-3 hover:bg-slate-100" aria-label="Next week">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {week.map((d) => {
            const k = iso(d);
            const n = slots.filter((s) => s.date === k).length;
            return (
              <button key={k} onClick={() => setDay(k)} className={cn('flex flex-col items-center rounded-2xl py-3 transition-all', day === k ? 'bg-brand-700 text-white shadow-lift' : 'hover:bg-slate-50')}>
                <span className={cn('text-[11px] font-semibold uppercase', day === k ? 'text-white/75' : 'text-ink-3')}>{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                <span className="num mt-1 font-display text-lg font-bold">{d.getDate()}</span>
                <span className={cn('mt-1 size-1.5 rounded-full', n ? (day === k ? 'bg-white' : 'bg-brand-500') : 'bg-transparent')} />
              </button>
            );
          })}
        </div>
      </Card>
      <div className="mt-6 space-y-3">
        {todays.length === 0 && (
          <Card>
            <EmptyState icon={<CalendarDays />} title="No consultations" description="Nothing scheduled for this day." />
          </Card>
        )}
        {todays.map((s) => {
          const I = icon(s.type);
          return (
            <Card key={s.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="w-24 shrink-0">
                <p className="num font-display text-lg font-bold text-ink">{s.time}</p>
                <p className="flex items-center gap-1 text-xs text-ink-3">
                  <I className="size-3.5" /> {s.type}
                </p>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3 border-line-soft sm:border-l sm:pl-5">
                <Avatar name={s.name} size={40} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{s.name}</p>
                  <p className="truncate text-xs text-ink-3">{s.reason}</p>
                </div>
              </div>
              <StatusPill status={s.status} />
              <div className="flex gap-2">
                {s.patientId && (
                  <Btn size="xs" variant="outline" href={`/doctor/patients/${s.patientId}`}>
                    View EHR
                  </Btn>
                )}
                {s.status === 'Scheduled' && (
                  <Btn size="xs" href="/doctor/chat" icon={<Video className="size-3.5" />}>
                    Start
                  </Btn>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

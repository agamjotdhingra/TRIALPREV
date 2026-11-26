/** Maps Supabase/Express API rows (snake_case + joined relations) onto the UI shapes used in demo data. */
import type { Appt, Doc, LabReport, Rx } from './demo';
import { parseList } from './source';

const cap = (s?: string | null) => (s ? s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');

export type ApptRow = Appt & { patient?: string; patientHid?: string; patientId?: number; score?: number | null; risk?: string };

export function mapAppt(a: any): ApptRow {
  return {
    id: String(a.id),
    date: a.scheduled_date,
    time: a.scheduled_time ?? '',
    doctor: a.doctors?.full_name ?? 'Doctor',
    specialty: a.doctors?.specialization ?? '',
    type: (cap(a.consultation_type) || 'In-Person').replace('In Person', 'In-Person') as Appt['type'],
    status: cap(a.status) as Appt['status'],
    reason: a.reason ?? '',
    patient: a.patients?.full_name,
    patientHid: a.patients?.health_id,
    patientId: a.patient_id,
    score: a.patients?.health_score ?? null,
    risk: a.patients?.risk_level ?? undefined,
  };
}

export function mapReport(r: any): LabReport & { fileUrl?: string; criticalNote?: string } {
  return {
    id: String(r.id),
    date: r.created_at,
    name: r.report_name,
    lab: r.labs?.name ?? 'Laboratory',
    category: r.category ?? 'General',
    status: r.is_critical ? 'Critical' : 'Normal',
    patient: r.patients?.full_name,
    patientId: r.patients?.health_id,
    findings: r.findings ?? undefined,
    fileUrl: r.file_url ?? undefined,
    criticalNote: r.critical_note ?? undefined,
  };
}

export function mapRx(rx: any): Rx & { patient?: string; patientHid?: string } {
  return {
    id: String(rx.id),
    date: rx.created_at,
    doctor: rx.doctors?.full_name ?? 'Doctor',
    specialty: rx.doctors?.specialization ?? '',
    diagnosis: rx.diagnosis ?? '—',
    medicines: parseList(rx.medicines).map((m) => {
      const [name, dose = '', freq = '', duration = ''] = m.split('|').map((s) => s.trim());
      return { name, dose, freq, duration };
    }),
    followUp: rx.follow_up_date ?? '',
    notes: rx.instructions ?? undefined,
    patient: rx.patients?.full_name,
    patientHid: rx.patients?.health_id,
  };
}

export function mapDoc(d: any): Doc & { url?: string } {
  return {
    id: String(d.id),
    name: d.file_name,
    size: d.size ?? '',
    category: d.category ?? 'Other',
    date: d.created_at,
    url: d.file_url,
  };
}

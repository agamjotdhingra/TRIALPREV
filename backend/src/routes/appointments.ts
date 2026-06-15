import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const AppointmentInputSchema = z.object({
  patientId: z.number().int(),
  doctorId: z.number().int(),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  consultationType: z.enum(['in-person', 'video', 'chat']).default('in-person'),
  reason: z.string().optional(),
});

// GET /api/appointments — scoped by role
router.get('/appointments', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { status, date } = req.query as Record<string, string>;
  let query = supabase.from('appointments').select('*, patients(full_name, health_id, health_score, risk_level), doctors(full_name, specialization)').order('scheduled_date', { ascending: true });

  if (req.role === 'patient') query = query.eq('patient_id', req.entityId!);
  else if (req.role === 'doctor') query = query.eq('doctor_id', req.entityId!);
  else if (req.role === 'hospital_admin') {
    // Hospital admin sees appointments in their hospital (via admissions)
    const { data: admissions } = await supabase.from('admissions').select('patient_id').eq('hospital_id', req.entityId!);
    const ids = (admissions || []).map((a: any) => a.patient_id);
    if (!ids.length) { res.json([]); return; }
    query = query.in('patient_id', ids);
  }

  if (status) query = query.eq('status', status);
  if (date) query = query.eq('scheduled_date', date);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }

  const mapped = (data || []).map((a: any) => ({
    ...a,
    patientName: a.patients?.full_name,
    patientHealthId: a.patients?.health_id,
    patientHealthScore: a.patients?.health_score,
    patientRiskLevel: a.patients?.risk_level,
    doctorName: a.doctors?.full_name,
    doctorSpecialization: a.doctors?.specialization,
    patients: undefined,
    doctors: undefined,
  }));
  res.json(mapped);
});

// POST /api/appointments — patient or platform_admin books
router.post('/appointments', authenticate, requireRole('patient', 'platform_admin', 'doctor'), async (req: AuthRequest, res): Promise<void> => {
  const parsed = AppointmentInputSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  // Patient can only book for themselves
  if (req.role === 'patient' && parsed.data.patientId !== req.entityId) {
    res.status(403).json({ error: 'You can only book appointments for yourself' }); return;
  }

  const { data, error } = await supabase.from('appointments').insert({
    patient_id: parsed.data.patientId,
    doctor_id: parsed.data.doctorId,
    scheduled_date: parsed.data.scheduledDate,
    scheduled_time: parsed.data.scheduledTime,
    consultation_type: parsed.data.consultationType,
    reason: parsed.data.reason,
    status: 'scheduled',
  }).select().single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

// GET /api/appointments/:id
router.get('/appointments/:id', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('appointments').select('*, patients(full_name, health_id), doctors(full_name, specialization)').eq('id', req.params.id).single();
  if (error) { res.status(404).json({ error: 'Appointment not found' }); return; }

  // Patients/doctors can only see their own
  if (req.role === 'patient' && data.patient_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (req.role === 'doctor' && data.doctor_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  res.json(data);
});

// PATCH /api/appointments/:id — update status or reschedule
router.patch('/appointments/:id', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { data: existing } = await supabase.from('appointments').select('*').eq('id', req.params.id).single();
  if (!existing) { res.status(404).json({ error: 'Appointment not found' }); return; }

  if (req.role === 'patient' && existing.patient_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (req.role === 'doctor' && existing.doctor_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }

  const allowed = req.role === 'doctor'
    ? ['status', 'notes']
    : ['status', 'scheduled_date', 'scheduled_time', 'reason'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase.from('appointments').update(update).eq('id', req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// DELETE /api/appointments/:id — cancel (patient own, platform_admin any)
router.delete('/appointments/:id', authenticate, requireRole('patient', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data: existing } = await supabase.from('appointments').select('patient_id').eq('id', req.params.id).single();
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  if (req.role === 'patient' && existing.patient_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }

  await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', req.params.id);
  res.status(204).send();
});

export default router;

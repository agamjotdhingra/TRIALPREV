import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const PrescriptionSchema = z.object({
  patientId: z.number().int(),
  diagnosis: z.string().min(1),
  medicines: z.array(z.string()).min(1),
  instructions: z.string().optional(),
  followUpDate: z.string().optional(),
});

// GET /api/prescriptions — patient: own | doctor: their prescriptions | platform_admin: all
router.get('/prescriptions', authenticate, async (req: AuthRequest, res): Promise<void> => {
  let query = supabase
    .from('prescriptions')
    .select('*, patients(full_name, health_id), doctors(full_name, specialization)')
    .order('created_at', { ascending: false });

  if (req.role === 'patient') query = query.eq('patient_id', req.entityId!);
  else if (req.role === 'doctor') query = query.eq('doctor_id', req.entityId!);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }

  const mapped = (data || []).map((rx: any) => ({
    ...rx,
    patientName: rx.patients?.full_name,
    patientHealthId: rx.patients?.health_id,
    doctorName: rx.doctors?.full_name,
    patients: undefined,
    doctors: undefined,
  }));
  res.json(mapped);
});

// POST /api/prescriptions — doctor only
router.post('/prescriptions', authenticate, requireRole('doctor'), async (req: AuthRequest, res): Promise<void> => {
  const parsed = PrescriptionSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id: parsed.data.patientId,
      doctor_id: req.entityId!,
      diagnosis: parsed.data.diagnosis,
      medicines: JSON.stringify(parsed.data.medicines),
      instructions: parsed.data.instructions,
      follow_up_date: parsed.data.followUpDate,
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }

  // Create notification for patient
  await supabase.from('notifications').insert({
    recipient_type: 'patient',
    recipient_id: parsed.data.patientId,
    type: 'prescription_ready',
    title: 'New Prescription Ready',
    message: `A new prescription for ${parsed.data.diagnosis} has been created by your doctor.`,
  });

  res.status(201).json(data);
});

// GET /api/prescriptions/:id
router.get('/prescriptions/:id', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, patients(full_name, health_id), doctors(full_name, specialization)')
    .eq('id', req.params.id)
    .single();

  if (error) { res.status(404).json({ error: 'Prescription not found' }); return; }
  if (req.role === 'patient' && data.patient_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (req.role === 'doctor' && data.doctor_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  res.json(data);
});

export default router;

import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// GET /api/doctors — platform_admin: all | patient/doctor: approved only (for booking)
router.get('/doctors', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { specialization, verificationStatus } = req.query as Record<string, string>;
  let query = supabase.from('doctors').select('id, full_name, specialization, qualification, years_of_experience, consultation_fees, bio, profile_picture, verification_status').order('full_name');

  // Non-admins only see approved doctors
  if (req.role !== 'platform_admin') {
    query = query.eq('verification_status', 'approved');
  } else if (verificationStatus) {
    query = query.eq('verification_status', verificationStatus);
  }

  if (specialization) query = query.ilike('specialization', `%${specialization}%`);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// GET /api/doctors/me — doctor views own full profile
router.get('/doctors/me', authenticate, requireRole('doctor'), async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('doctors').select('*').eq('id', req.entityId!).single();
  if (error) { res.status(404).json({ error: 'Doctor profile not found' }); return; }
  res.json(data);
});

// GET /api/doctors/:id/queue — doctor sees own queue, platform_admin sees any
router.get('/doctors/:id/queue', authenticate, requireRole('doctor', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const doctorId = parseInt(req.params.id as string, 10);
  if (req.role === 'doctor' && req.entityId !== doctorId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const today = new Date().toISOString().split('T')[0];
  const { data: appts } = await supabase.from('appointments').select('*, patients(id, full_name, health_id, health_score, risk_level, age)').eq('doctor_id', doctorId).eq('scheduled_date', today).eq('status', 'scheduled');

  const priorityOrder: Record<string, number> = { critical: 0, high: 1, moderate: 2, healthy: 3 };
  const result = ((appts || []) as any[])
    .map((a) => ({
      appointmentId: a.id,
      patientId: a.patient_id,
      fullName: a.patients?.full_name ?? 'Unknown',
      healthId: a.patients?.health_id ?? '',
      healthScore: a.patients?.health_score ?? null,
      riskLevel: a.patients?.risk_level ?? 'healthy',
      scheduledTime: a.scheduled_time,
      reason: a.reason,
    }))
    .sort((a, b) => (priorityOrder[a.riskLevel] ?? 3) - (priorityOrder[b.riskLevel] ?? 3));

  res.json(result);
});

// GET /api/doctors/:id/stats
router.get('/doctors/:id/stats', authenticate, requireRole('doctor', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const doctorId = parseInt(req.params.id as string, 10);
  if (req.role === 'doctor' && req.entityId !== doctorId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const today = new Date().toISOString().split('T')[0];
  const { data: allAppts } = await supabase.from('appointments').select('patient_id, status, scheduled_date').eq('doctor_id', doctorId);
  const appts = allAppts || [];
  const uniquePatients = new Set(appts.map((a: any) => a.patient_id));
  const todayAppts = appts.filter((a: any) => a.scheduled_date === today);
  const pending = appts.filter((a: any) => a.status === 'scheduled' && a.scheduled_date >= today);
  const completed = todayAppts.filter((a: any) => a.status === 'completed');
  const { data: critPats } = await supabase.from('patients').select('id').in('id', [...uniquePatients]).eq('risk_level', 'critical');

  res.json({
    totalPatients: uniquePatients.size,
    todayAppointments: todayAppts.length,
    pendingAppointments: pending.length,
    completedToday: completed.length,
    criticalPatients: (critPats || []).length,
  });
});

// GET /api/doctors/:id
router.get('/doctors/:id', authenticate, async (req, res): Promise<void> => {
  const { data, error } = await supabase.from('doctors').select('id, full_name, specialization, qualification, years_of_experience, consultation_fees, bio, profile_picture, verification_status').eq('id', req.params.id).single();
  if (error) { res.status(404).json({ error: 'Doctor not found' }); return; }
  res.json(data);
});

// PATCH /api/doctors/me — doctor updates own profile
router.patch('/doctors/me', authenticate, requireRole('doctor'), async (req: AuthRequest, res): Promise<void> => {
  const allowed = ['bio', 'profile_picture', 'consultation_fees', 'license_number', 'license_valid_until'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase.from('doctors').update(update).eq('id', req.entityId!).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /api/doctors/:id/verify — platform_admin only
router.patch('/doctors/:id/verify', authenticate, requireRole('platform_admin'), async (req, res): Promise<void> => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' }); return;
  }
  const { data, error } = await supabase.from('doctors').update({ verification_status: status }).eq('id', req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

export default router;

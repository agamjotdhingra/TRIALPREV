import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Admissions
router.get('/admissions', authenticate, requireRole('hospital_admin', 'platform_admin', 'doctor'), async (req: AuthRequest, res): Promise<void> => {
  const { status } = req.query as Record<string, string>;
  let query = supabase.from('admissions').select('*, patients(full_name, health_id, blood_group, risk_level), hospitals(name)').order('admission_date', { ascending: false });

  if (req.role === 'hospital_admin') query = query.eq('hospital_id', req.entityId!);
  else if (req.role === 'doctor') query = query.eq('primary_doctor_id', req.entityId!);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/admissions', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const body = {
    ...req.body,
    hospital_id: req.role === 'hospital_admin' ? req.entityId : req.body.hospitalId,
    patient_id: req.body.patientId,
    ward_id: req.body.wardId,
    bed_id: req.body.bedId,
    primary_doctor_id: req.body.primaryDoctorId,
    admission_date: req.body.admissionDate,
    admission_reason: req.body.admissionReason,
  };

  const { data, error } = await supabase.from('admissions').insert(body).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }

  // Mark bed as occupied
  if (body.bed_id) {
    await supabase.from('beds').update({ status: 'occupied' }).eq('id', body.bed_id);
  }
  res.status(201).json(data);
});

router.patch('/admissions/:id', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data: existing } = await supabase.from('admissions').select('*').eq('id', req.params.id).single();
  if (!existing) { res.status(404).json({ error: 'Admission not found' }); return; }
  if (req.role === 'hospital_admin' && existing.hospital_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }

  const updates = req.body;
  const { data, error } = await supabase.from('admissions').update(updates).eq('id', req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }

  // If discharging, free the bed
  if (updates.status === 'discharged' && existing.bed_id) {
    await supabase.from('beds').update({ status: 'available' }).eq('id', existing.bed_id);
  }
  res.json(data);
});

// Staff
router.get('/staff', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { role } = req.query as Record<string, string>;
  let query = supabase.from('staff').select('*, hospitals(name), wards(name)').order('full_name');
  if (req.role === 'hospital_admin') query = query.eq('hospital_id', req.entityId!);
  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/staff', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { generateEmployeeId } = await import('../lib/health-score.js');
  const body = {
    ...req.body,
    employee_id: generateEmployeeId(),
    hospital_id: req.role === 'hospital_admin' ? req.entityId : req.body.hospitalId,
  };
  const { data, error } = await supabase.from('staff').insert(body).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.get('/staff/:id', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('staff').select('*').eq('id', req.params.id).single();
  if (!data) { res.status(404).json({ error: 'Staff not found' }); return; }
  if (req.role === 'hospital_admin' && data.hospital_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.patch('/staff/:id', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('staff').update(req.body).eq('id', req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

export default router;

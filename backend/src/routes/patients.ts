import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { calculateBmi, computeHealthScore, calcAge } from '../lib/health-score.js';

const router = Router();

async function logEhrAccess(
  operatorId: string | undefined,
  patientId: number,
  action: 'view' | 'update' | 'export',
  req: AuthRequest
) {
  if (!operatorId) return;
  try {
    await supabase.from('ehr_audit_logs').insert({
      operator_id: operatorId,
      patient_id: patientId,
      action,
      ip_address: req.ipAddress || '',
      user_agent: req.userAgent || '',
    });
  } catch (err) {
    console.error('[EHR Audit Log Error]', err);
  }
}

// GET /api/patients — platform_admin: all | doctor: only assigned patients
router.get('/patients', authenticate, requireRole('platform_admin', 'doctor', 'hospital_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { search, bloodGroup, riskLevel } = req.query as Record<string, string>;
  let query = supabase.from('patients').select('*').order('created_at', { ascending: false });

  if (req.role === 'doctor') {
    // Doctor sees only patients with appointments linked to them
    const { data: appts } = await supabase.from('appointments').select('patient_id').eq('doctor_id', req.entityId!);
    const ids = [...new Set((appts || []).map((a: any) => a.patient_id))];
    if (!ids.length) { res.json([]); return; }
    query = query.in('id', ids);
  } else if (req.role === 'hospital_admin') {
    // Hospital admin sees only admitted patients at their hospital
    const { data: admissions } = await supabase.from('admissions').select('patient_id').eq('hospital_id', req.entityId!).neq('status', 'discharged');
    const ids = [...new Set((admissions || []).map((a: any) => a.patient_id))];
    if (!ids.length) { res.json([]); return; }
    query = query.in('id', ids);
  }

  if (search) query = query.or(`full_name.ilike.%${search}%,health_id.ilike.%${search}%,mobile.ilike.%${search}%`);
  if (bloodGroup) query = query.eq('blood_group', bloodGroup);
  if (riskLevel) query = query.eq('risk_level', riskLevel);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// GET /api/patients/me — patient sees own record
router.get('/patients/me', authenticate, requireRole('patient'), async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', req.entityId!).single();
  if (error) { res.status(404).json({ error: 'Patient record not found' }); return; }
  
  // Log self access
  await logEhrAccess(req.userId, data.id, 'view', req);
  
  res.json(data);
});

// GET /api/patients/by-health-id/:healthId — lab_admin / doctor / hospital_admin can search
router.get('/patients/by-health-id/:healthId', authenticate, requireRole('lab_admin', 'doctor', 'hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('patients').select('id, health_id, full_name, date_of_birth, gender, blood_group, mobile, health_score, risk_level').eq('health_id', req.params.healthId).single();
  if (error) { res.status(404).json({ error: 'Patient not found' }); return; }
  
  // Log EHR view
  await logEhrAccess(req.userId, data.id, 'view', req);

  res.json(data);
});

// GET /api/patients/:id — role-gated
router.get('/patients/:id', authenticate, requireRole('platform_admin', 'doctor', 'hospital_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', req.params.id).single();
  if (error) { res.status(404).json({ error: 'Patient not found' }); return; }
  
  // Log EHR view
  await logEhrAccess(req.userId, data.id, 'view', req);

  res.json(data);
});

// PATCH /api/patients/me — patient updates own profile
router.patch('/patients/me', authenticate, requireRole('patient'), async (req: AuthRequest, res): Promise<void> => {
  const { email: _e, health_id: _h, ...rest } = req.body;
  const bmi = calculateBmi(rest.height, rest.weight);
  const { score, riskLevel } = computeHealthScore({ ...rest, bmi });
  const age = rest.date_of_birth ? calcAge(rest.date_of_birth) : undefined;

  const { data, error } = await supabase
    .from('patients')
    .update({ ...rest, bmi, health_score: score, risk_level: riskLevel, ...(age !== undefined ? { age } : {}) })
    .eq('id', req.entityId!)
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }

  // Log EHR update
  await logEhrAccess(req.userId, data.id, 'update', req);

  // Sync name to user_profiles
  if (rest.full_name) {
    await supabase.from('user_profiles').update({ full_name: rest.full_name }).eq('id', req.userId!);
  }
  res.json(data);
});

// GET /api/patients/:id/health-score
router.get('/patients/:id/health-score', authenticate, requireRole('platform_admin', 'doctor', 'patient'), async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (req.role === 'patient' && req.entityId !== id) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
  if (error) { res.status(404).json({ error: 'Patient not found' }); return; }
  const { score, riskLevel } = computeHealthScore(data);
  res.json({
    patientId: id,
    score,
    riskLevel,
    bmiContribution: data.bmi ? (data.bmi > 25 || data.bmi < 18.5 ? 15 : 0) : null,
    conditionsContribution: data.existing_diseases ? 15 : 0,
    lifestyleContribution: (data.smoking_status === 'yes' ? 15 : 0) + (data.alcohol_consumption === 'yes' ? 10 : 0),
    computedAt: new Date().toISOString(),
  });
});

export default router;

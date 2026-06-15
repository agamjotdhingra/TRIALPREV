import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Hospitals
router.get('/hospitals', authenticate, async (req: AuthRequest, res): Promise<void> => {
  if (req.role === 'hospital_admin') {
    const { data, error } = await supabase.from('hospitals').select('*').eq('id', req.entityId!).single();
    if (error) { res.status(404).json({ error: 'Hospital not found' }); return; }
    res.json([data]);
    return;
  }
  const { data, error } = await supabase.from('hospitals').select('*').order('name');
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.get('/hospitals/:id', authenticate, async (req: AuthRequest, res): Promise<void> => {
  if (req.role === 'hospital_admin' && parseInt(req.params.id as string, 10) !== req.entityId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const { data, error } = await supabase.from('hospitals').select('*').eq('id', req.params.id).single();
  if (error) { res.status(404).json({ error: 'Hospital not found' }); return; }
  res.json(data);
});

router.get('/hospitals/:id/overview', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const hospitalId = parseInt(req.params.id as string, 10);
  if (req.role === 'hospital_admin' && hospitalId !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }

  const [{ data: beds }, { data: wards }, { data: admissions }, { data: staff }] = await Promise.all([
    supabase.from('beds').select('status').eq('hospital_id', hospitalId),
    supabase.from('wards').select('*').eq('hospital_id', hospitalId),
    supabase.from('admissions').select('status').eq('hospital_id', hospitalId).neq('status', 'discharged'),
    supabase.from('staff').select('role').eq('hospital_id', hospitalId),
  ]);

  const bedList = beds || [];
  const admList = admissions || [];
  const staffList = staff || [];

  res.json({
    totalBeds: bedList.length,
    availableBeds: bedList.filter((b: any) => b.status === 'available').length,
    occupiedBeds: bedList.filter((b: any) => b.status === 'occupied').length,
    totalAdmitted: admList.length,
    icuPatients: admList.filter((a: any) => a.status === 'icu').length,
    wardsCount: (wards || []).length,
    doctorsOnDuty: staffList.filter((s: any) => s.role === 'doctor').length,
    nursesOnDuty: staffList.filter((s: any) => s.role === 'nurse').length,
  });
});

router.post('/hospitals', authenticate, requireRole('platform_admin'), async (req, res): Promise<void> => {
  const { data, error } = await supabase.from('hospitals').insert(req.body).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

// Wards — scoped to hospital
router.get('/wards', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  let query = supabase.from('wards').select('*').order('name');
  if (req.role === 'hospital_admin') query = query.eq('hospital_id', req.entityId!);
  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/wards', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const body = { ...req.body, hospital_id: req.role === 'hospital_admin' ? req.entityId : req.body.hospital_id };
  const { data, error } = await supabase.from('wards').insert(body).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.patch('/wards/:id', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('wards').update(req.body).eq('id', req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// Beds
router.get('/beds', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { wardId, status } = req.query as Record<string, string>;
  let query = supabase.from('beds').select('*, wards(name, ward_type, hospital_id)').order('bed_number');
  if (wardId) query = query.eq('ward_id', wardId);
  if (status) query = query.eq('status', status);
  if (req.role === 'hospital_admin') {
    const { data: wardIds } = await supabase.from('wards').select('id').eq('hospital_id', req.entityId!);
    if (!wardIds?.length) { res.json([]); return; }
    query = query.in('ward_id', wardIds.map((w: any) => w.id));
  }
  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/beds', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req, res): Promise<void> => {
  const { data, error } = await supabase.from('beds').insert(req.body).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.patch('/beds/:id', authenticate, requireRole('hospital_admin', 'platform_admin'), async (req, res): Promise<void> => {
  const { data, error } = await supabase.from('beds').update(req.body).eq('id', req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

export default router;

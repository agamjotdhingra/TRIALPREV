import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// GET /api/reports — patient: own | doctor: assigned patients' | lab_admin: own lab | platform_admin: all
router.get('/reports', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { category, isCritical } = req.query as Record<string, string>;
  let query = supabase
    .from('reports')
    .select('*, patients(full_name, health_id), labs(name)')
    .order('created_at', { ascending: false });

  if (req.role === 'patient') query = query.eq('patient_id', req.entityId!);
  else if (req.role === 'lab_admin') query = query.eq('lab_id', req.entityId!);
  else if (req.role === 'doctor') {
    const { data: appts } = await supabase.from('appointments').select('patient_id').eq('doctor_id', req.entityId!);
    const ids = [...new Set((appts || []).map((a: any) => a.patient_id))];
    if (!ids.length) { res.json([]); return; }
    query = query.in('patient_id', ids);
  }

  if (category) query = query.eq('category', category);
  if (isCritical !== undefined) query = query.eq('is_critical', isCritical === 'true');

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }

  const mapped = (data || []).map((r: any) => ({
    ...r,
    patientName: r.patients?.full_name,
    patientHealthId: r.patients?.health_id,
    labName: r.labs?.name,
    patients: undefined,
    labs: undefined,
  }));
  res.json(mapped);
});

// POST /api/reports — lab_admin only
router.post('/reports', authenticate, requireRole('lab_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { patientId, category, reportName, fileUrl, findings, isCritical, criticalNote } = req.body;
  if (!patientId || !category || !reportName) {
    res.status(400).json({ error: 'patientId, category, and reportName are required' }); return;
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      patient_id: patientId,
      lab_id: req.entityId!,
      category,
      report_name: reportName,
      file_url: fileUrl,
      findings,
      is_critical: isCritical ?? false,
      critical_note: criticalNote,
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }

  // Notify patient
  await supabase.from('notifications').insert({
    recipient_type: 'patient',
    recipient_id: patientId,
    type: isCritical ? 'critical_report' : 'report_uploaded',
    title: isCritical ? '⚠️ Critical Lab Report Available' : 'New Lab Report Available',
    message: `Your ${reportName} report from the lab is now available.`,
  });

  res.status(201).json(data);
});

// GET /api/reports/:id
router.get('/reports/:id', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*, patients(full_name, health_id), labs(name)')
    .eq('id', req.params.id)
    .single();

  if (error) { res.status(404).json({ error: 'Report not found' }); return; }
  if (req.role === 'patient' && data.patient_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (req.role === 'lab_admin' && data.lab_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  res.json(data);
});

export default router;

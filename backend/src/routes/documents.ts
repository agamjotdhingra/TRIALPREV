import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Documents — patient: own | doctor: assigned patients | platform_admin: all
router.get('/documents', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { category } = req.query as Record<string, string>;
  let query = supabase.from('documents').select('*').order('created_at', { ascending: false });

  if (req.role === 'patient') query = query.eq('patient_id', req.entityId!);
  else if (req.role === 'doctor') {
    const { data: appts } = await supabase.from('appointments').select('patient_id').eq('doctor_id', req.entityId!);
    const ids = [...new Set((appts || []).map((a: any) => a.patient_id))];
    if (!ids.length) { res.json([]); return; }
    query = query.in('patient_id', ids);
  }

  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/documents', authenticate, requireRole('patient'), async (req: AuthRequest, res): Promise<void> => {
  const { fileName, fileUrl, category, mimeType } = req.body;
  const { data, error } = await supabase
    .from('documents')
    .insert({ patient_id: req.entityId!, file_name: fileName, file_url: fileUrl, category, mime_type: mimeType, uploaded_by: 'patient' })
    .select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.delete('/documents/:id', authenticate, requireRole('patient', 'platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data: doc } = await supabase.from('documents').select('patient_id').eq('id', req.params.id).single();
  if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
  if (req.role === 'patient' && doc.patient_id !== req.entityId) { res.status(403).json({ error: 'Forbidden' }); return; }
  await supabase.from('documents').delete().eq('id', req.params.id);
  res.status(204).send();
});

export default router;

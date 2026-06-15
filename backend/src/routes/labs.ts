import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Labs — lab_admin: own | platform_admin: all | others: approved only (read-only)
router.get('/labs', authenticate, async (req: AuthRequest, res): Promise<void> => {
  let query = supabase.from('labs').select('*').order('name');
  if (req.role === 'lab_admin') query = query.eq('id', req.entityId!);
  else if (req.role !== 'platform_admin') query = query.eq('verification_status', 'approved');
  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.get('/labs/me', authenticate, requireRole('lab_admin'), async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase.from('labs').select('*').eq('id', req.entityId!).single();
  if (error) { res.status(404).json({ error: 'Lab not found' }); return; }
  res.json(data);
});

router.get('/labs/:id', authenticate, async (req, res): Promise<void> => {
  const { data, error } = await supabase.from('labs').select('*').eq('id', req.params.id).single();
  if (error) { res.status(404).json({ error: 'Lab not found' }); return; }
  res.json(data);
});

router.patch('/labs/me', authenticate, requireRole('lab_admin'), async (req: AuthRequest, res): Promise<void> => {
  const allowed = ['contact_person', 'mobile', 'email', 'address'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase.from('labs').update(update).eq('id', req.entityId!).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.patch('/labs/:id/verify', authenticate, requireRole('platform_admin'), async (req, res): Promise<void> => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
  const { data, error } = await supabase.from('labs').update({ verification_status: status }).eq('id', req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

export default router;

import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications — user sees their own
router.get('/notifications', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const roleToType: Record<string, string> = {
    patient: 'patient',
    doctor: 'doctor',
    hospital_admin: 'hospital',
    platform_admin: 'admin',
    lab_admin: 'lab',
  };
  const recipientType = roleToType[req.role || ''] || 'patient';
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_type', recipientType)
    .eq('recipient_id', req.entityId!)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', authenticate, async (req: AuthRequest, res): Promise<void> => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', req.params.id);
  res.json({ success: true });
});

// PATCH /api/notifications/read-all
router.patch('/notifications/read-all', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const roleToType: Record<string, string> = { patient: 'patient', doctor: 'doctor', hospital_admin: 'hospital', platform_admin: 'admin', lab_admin: 'lab' };
  const recipientType = roleToType[req.role || ''] || 'patient';
  await supabase.from('notifications').update({ is_read: true })
    .eq('recipient_type', recipientType).eq('recipient_id', req.entityId!);
  res.json({ success: true });
});

export default router;

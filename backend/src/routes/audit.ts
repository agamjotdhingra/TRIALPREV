import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// GET /api/audit-logs — platform_admin only
router.get('/audit-logs', authenticate, requireRole('platform_admin'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const { data: logs, error } = await supabase
      .from('ehr_audit_logs')
      .select(`
        id,
        action,
        ip_address,
        user_agent,
        accessed_at,
        patient_id,
        patients (
          health_id,
          full_name
        ),
        operator_id
      `)
      .order('accessed_at', { ascending: false })
      .limit(100);

    if (error || !logs) {
      res.status(500).json({ error: error?.message || 'Failed to fetch logs' });
      return;
    }

    // Fetch operator profiles in a batch
    const operatorIds = [...new Set(logs.map((l: any) => l.operator_id).filter(Boolean))];
    const profilesMap: Record<string, { full_name: string; role: string }> = {};
    
    if (operatorIds.length) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, role')
        .in('id', operatorIds);
      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.id] = { full_name: p.full_name, role: p.role };
        });
      }
    }

    const resolvedLogs = logs.map((l: any) => ({
      ...l,
      operator: l.operator_id 
        ? (profilesMap[l.operator_id] || { full_name: 'Unknown User', role: 'unknown' }) 
        : { full_name: 'System / Guest', role: 'system' }
    }));

    res.json(resolvedLogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

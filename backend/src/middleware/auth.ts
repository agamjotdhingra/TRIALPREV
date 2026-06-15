import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase-admin.js';

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
  entityId?: number | null;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Fetch role + entity_id from user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, entity_id')
      .eq('id', user.id)
      .single();

    req.userId = user.id;
    req.role = profile?.role ?? (user.app_metadata?.role as string | undefined);
    req.entityId = profile?.entity_id ?? null;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

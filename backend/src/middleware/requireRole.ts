import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !roles.includes(req.role)) {
      res.status(403).json({ error: `Forbidden: requires role ${roles.join(' or ')}` });
      return;
    }
    next();
  };
}

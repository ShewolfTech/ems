// backend/src/middleware/security/enforcePermission.ts
import { Request, Response, NextFunction } from "express";

export function enforcePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user?.permissions?.includes(permission)) {
      return res.status(403).json({ error: `Forbidden: missing ${permission}` });
    }
    next();
  };
}



// 📁 backend/src/middleware/context/setUserContext.ts

import { Request, Response, NextFunction } from "express";

export function setUserContext(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    (req as any).context = {
      ...(req as any).context,
      userId: req.user.id,
      schoolId: req.user.schoolId,
      roles: req.user.roles,
    };
  }
  next();
}

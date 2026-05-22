// backend/src/middleware/security/authorize.ts


import { Request, Response, NextFunction } from "express";

export function authorize(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (!requiredRoles.some(role => user.roles?.includes(role))) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}

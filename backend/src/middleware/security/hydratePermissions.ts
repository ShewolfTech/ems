// backend/src/middleware/security/hydratePermissions.ts

import { Request, Response, NextFunction } from "express";
import { pool } from "../../config/infra/database.js";

export async function hydratePermissions(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user?.schoolId || !user?.roles?.length) {
    console.warn("[PERMISSIONS] Missing school or role context, continuing without hydration");
    return next();
  }

  try {
    // role-based permissions
    const { rows: roleRows } = await pool.query<{ label: string }>(
      `SELECT p.label
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN roles r ON rp.role_id = r.id
       WHERE rp.school_id = $1 AND r.name = ANY($2::text[]) AND rp.is_active = true`,
      [user.schoolId, user.roles]
    );

    // user-specific overrides
    const { rows: userRows } = await pool.query<{ label: string }>(
      `SELECT p.label
       FROM user_permissions up
       JOIN permissions p ON up.permission_id = p.id
       WHERE up.school_id = $1 AND up.login_id = $2 AND up.is_active = true`,
      [user.schoolId, user.id]
    );

    const merged = [...new Set([
      ...(user.permissions || []),
      ...roleRows.map(r => r.label),
      ...userRows.map(r => r.label),
    ])];

    req.user.permissions = merged;
    next();
  } catch (err) {
    console.error("[PERMISSIONS] Hydration failed:", err);
    res.status(500).json({ error: "Failed to hydrate permissions" });
  }
}

// Path: backend/src/middleware/security/authenticate.ts
import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { AuthConfig } from "../../domains/auth/config.js";
import { enrichUserMetadata } from "../../domains/auth/enrichUserMetadata.js";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized: No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    // Use the same JWT secret as the login service
    const secretKey = new TextEncoder().encode(AuthConfig.jwtSecret);

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"]
    });

    const userId = Number(payload.userId || payload.sub);
    const schoolId = Number(payload.schoolId);
    const email = payload.email as string;

    console.log('[AUTHENTICATE] JWT payload:', { userId, schoolId, email, rawSchoolId: payload.schoolId });

    if (!userId || !schoolId || isNaN(userId) || isNaN(schoolId)) {
      console.error('[AUTHENTICATE] Invalid token payload:', { userId, schoolId });
      throw new Error("Token missing userId/schoolId");
    }

    // Enrich user with permissions (same as authMiddleware)
    const metadata = await enrichUserMetadata(email, schoolId, userId);

    if (!metadata || !metadata.success) {
      console.warn("[AUTH_BLOCK]: Metadata enrichment failed for User", userId);
      return res.status(401).json({ message: "User session invalid or school context lost" });
    }

    // Attach user data to request object with permissions from enrichment
    (req as any).user = {
      userId,
      id: userId,
      email,
      schoolId,
      roleId: payload.role_id,
      sessionId: payload.sessionId,
      permissions: metadata.permissions,
      permissions_meta: metadata.permissions_meta,
      roles: [], // Keep for compatibility
    };

    console.log('[AUTHENTICATE] User context set:', (req as any).user);
    next();
  } catch (err: any) {
    console.error("[AUTH_MIDDLEWARE_ERROR]:", err.message);
    return res.status(403).json({ success: false, error: "Forbidden: Invalid or expired token" });
  }
}
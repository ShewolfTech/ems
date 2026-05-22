import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { AuthConfig } from '../../domains/auth/config.js';
import { enrichUserMetadata } from '../../domains/auth/enrichUserMetadata.js';
import NodeCache from 'node-cache';

// Cache metadata for 5 minutes (300s)
const userCache = new NodeCache({ stdTTL: 300 });

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = new TextEncoder().encode(AuthConfig.jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    // 🛡️ Robust extraction: ensures IDs are treated as numbers
    const userId = Number(payload.userId || payload.sub);
    const schoolId = Number(payload.schoolId);
    const email = payload.email as string;

    if (!userId || !schoolId) {
      return res.status(401).json({ message: 'Malformed token payload' });
    }

    const cacheKey = `user_meta_${userId}_${schoolId}`;
    let metadata: any = userCache.get(cacheKey);

    if (!metadata) {
      // Fetch fresh metadata from the database
      metadata = await enrichUserMetadata(email, schoolId, userId);

      // 🛡️ SECURITY CHECK: If enrichment fails (User/School deleted from DB), 
      // we must block access even if the JWT is technically "valid".
      if (!metadata || !metadata.success) {
        console.warn(`[AUTH_BLOCK]: Metadata enrichment failed for User ${userId} at School ${schoolId}`);
        return res.status(401).json({ message: 'User session invalid or school context lost' });
      }

      userCache.set(cacheKey, metadata);
    }

    // Attach to req.user - Flattened for clean access in controllers
    (req as any).user = {
      userId,
      email,
      schoolId,
      roleId: payload.role_id,
      sessionId: payload.sessionId,
      // 🛡️ Attach only the data, excluding the 'success' flag
      school: metadata.school,
      permissions: metadata.permissions,
      permissions_meta: metadata.permissions_meta 
    };

    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE_ERROR]:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
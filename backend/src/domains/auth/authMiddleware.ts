import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { AuthConfig } from './config.js';
import { enrichUserMetadata } from './enrichUserMetadata.js';
import NodeCache from 'node-cache';

// Cache metadata for 5 minutes to keep the app lightning fast
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

    // Extract basic info from the SLIM token
    const userId = payload.userId as number;
    const schoolId = payload.schoolId as number;
    const email = payload.email as string;

    if (!userId || !schoolId || isNaN(userId) || isNaN(schoolId)) {
      return res.status(401).json({ message: 'Malformed token payload' });
    }

    // --- HYDRATION ENGINE ---
    let metadata: any = userCache.get(userId);

    if (!metadata) {
      // Fetch the heavy metadata (permissions, school info) from DB
      metadata = await enrichUserMetadata(email, schoolId, userId);
      
      // Only cache if the fetch was successful
      if (metadata && metadata.success) {
        userCache.set(userId, metadata);
      }
    }

    // Attach EVERYTHING to req.user
    // This allows controllers to access req.user.permissions directly
    (req as any).user = {
      ...payload,
      ...metadata // Re-attaches permissions and school info
    };

    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE_ERROR]:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
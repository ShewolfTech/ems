// -- a/file:///c%3A/Bright/ems/backend/src/routes/index.ts
import { Router } from 'express';
import apiRouter from './api.js';
import adminRouter from './admin.js';
const rootRouter = Router();
// Public + tenant-aware API routes
rootRouter.use('/api', apiRouter);
// System-level admin routes (RBAC, audit, etc.)
rootRouter.use('/admin', adminRouter);
export default rootRouter;

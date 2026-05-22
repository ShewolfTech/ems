// -- a/file:///c%3A/Bright/ems/backend/src/routes/api.ts
import { Router } from 'express';
/**
 * API configuration
 */
export const API_CONFIG = {
    basePath: '/api',
    version: 'v1',
    prefix: '/api/v1',
    healthEndpoint: '/api/v1/health',
    docsEndpoint: '/api/v1/docs',
};
const router = Router();
// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'OK', version: API_CONFIG.version });
});
// --- Mount Domain Routes Here ---
// router.use('/academics', academicsRouter);
// router.use('/students', studentsRouter);
export default router; // This resolves the 1192 error

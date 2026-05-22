// src/server.ts
import app from './app.js';
import { database, logger, loadConfig, validateConfig } from './config/index.js';
import { permissionRegistry, PermissionsEnum, domainTree } from './registries/index.js';
async function bootstrap() {
    const config = loadConfig();
    validateConfig(config);
    await database.connect();
    logger.info('🚀 EMS backend starting up...');
    logger.info(`Permissions loaded: ${Object.keys(permissionRegistry).length}`);
    logger.info(`Domain tree modules: ${Object.keys(domainTree).length}`);
    logger.info(`Available enums: ${Object.values(PermissionsEnum).join(', ')}`);
    const port = config.PORT || 3000;
    app.listen(port, () => {
        logger.info(`✅ EMS backend running on http://localhost:${port}`);
    });
}
bootstrap().catch((err) => {
    logger.error('❌ Failed to bootstrap EMS backend', err);
    process.exit(1);
});

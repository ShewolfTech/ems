// -- a/file:///c%3A/Bright/ems/backend/src/config/infra/logger.ts

// src/config/infra/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});


// backend/src/infrastructure/cache.ts

import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 60 * 5 }); // 5 min default

export function setCache(key: string, value: any, ttl?: number) {
  cache.set(key, value, ttl ?? 0); // ✅ safe
}

export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function clearCache(key: string) {
  cache.del(key);
}


// Auto-generated query helpers
import { pool } from "./pool.js";

/**
 * Executes a database query with professional error handling and logging.
 */
export async function runQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(sql, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(`⚠️ Slow query detected (${duration}ms): `, sql);
    }

    return result.rows as T[];
  } catch (error) {
    console.error("❌ [Database Query Error]:", {
      sql,
      params,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

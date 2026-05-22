import { db } from "../config/infra/database.js";
import { sql } from "kysely";

/**
 * Central ID generator for the school system.
 *
 * Produces a single BIGINT that becomes the shared identifier across:
 * - users.id = student_id = admission_no (for students)
 * - users.id = staff_id = employee_no (for staff)
 * - users.id = parent_id (for parents/guardians)
 * - users.id = volunteer_id (for volunteers)
 *
 * Strategy: atomically grabs the NEXT value from the users_id_seq sequence.
 * This is race-condition-free because PostgreSQL sequences are inherently atomic.
 *
 * @param schoolId - The school context (scoped but uses shared sequence)
 * @returns The next available BIGINT ID
 */
export async function generateSchoolId(schoolId: number): Promise<number> {
  const result: any = await sql<{ next_id: number }>`
    SELECT nextval('users_id_seq') AS next_id
  `.execute(db);

  return Number(result.rows?.[0]?.next_id);
}

/**
 * Generate a username from the numeric ID.
 * Format: lowercase "user" + number (e.g., "user20003233442")
 */
export function generateUsername(id: number): string {
  return `user${id}`;
}

import { db } from "../config/infra/database.js";

const CHECK_INTERVAL = 60 * 1000;

export function startAssignmentScheduler() {
  console.log("📅 Assignment scheduler started");

  async function deactivateOverdueAssignments() {
    try {
      const result = await db
        .updateTable("assignments" as any)
        .set({ is_active: false, updated_at: new Date() } as any)
        .where("due_date" as any, "<", new Date())
        .where("is_active" as any, "=", true)
        .executeTakeFirst();

      if (result?.numUpdatedRows) {
        console.log(`📅 Deactivated ${result.numUpdatedRows} overdue assignments`);
      }
    } catch (error) {
      console.error("Error deactivating overdue assignments:", error);
    }
  }

  deactivateOverdueAssignments();

  setInterval(deactivateOverdueAssignments, CHECK_INTERVAL);
}

export function getActiveAssignmentsOnly(context: UserContext, params?: any) {
  const now = new Date();
  
  return db
    .selectFrom("assignments as a")
    .leftJoin("classes as c", "c.id", "a.class_id")
    .leftJoin("subjects as s", "s.id", "a.subject_id")
    .leftJoin("terms as t", "t.id", "a.term_id")
    .select([
      "a.id",
      "a.school_id",
      "a.class_id",
      "a.subject_id",
      "a.term_id",
      "a.title",
      "a.description",
      "a.start_date",
      "a.due_date",
      "a.max_score",
      "a.weight",
      "a.status_id",
      "a.teacher_id",
      "a.is_active",
      "a.created_at",
      "a.updated_at",
      "c.name as class_name",
      "c.code as class_code",
      "s.name as subject_name",
      "s.code as subject_code",
      "t.name as term_name",
    ])
    .where("a.school_id" as any, "=", context.schoolId as any)
    .where("a.is_deleted" as any, "=", false)
    .where((eb) => 
      eb.or([
        eb("a.is_active" as any, "=", true),
        eb("a.due_date" as any, ">=", now)
      ])
    )
    .orderBy("a.due_date" as any, "desc")
    .execute();
}

export interface UserContext {
  schoolId: number;
  userId?: number;
}
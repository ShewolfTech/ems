// ⚠️ Auto-generated Multi-Tenant Service for ReportAttendanceSummary
import { db } from "../../../config/infra/database.js";
import { ReportAttendanceSummarySchema } from "./validator.js";
import { ReportAttendanceSummaryType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ReportAttendanceSummaryService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("report_attendance_summary" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("report_attendance_summary" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: ReportAttendanceSummaryType) {
    const validated = ReportAttendanceSummarySchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("report_attendance_summary" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<ReportAttendanceSummaryType>) {
    return await db.updateTable("report_attendance_summary" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("report_attendance_summary" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const reportattendancesummaryService = new ReportAttendanceSummaryService();

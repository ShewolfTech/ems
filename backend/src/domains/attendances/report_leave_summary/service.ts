// ⚠️ Auto-generated Multi-Tenant Service for ReportLeaveSummary
import { db } from "../../../config/infra/database.js";
import { ReportLeaveSummarySchema } from "./validator.js";
import { ReportLeaveSummaryType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ReportLeaveSummaryService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("report_leave_summary" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("report_leave_summary" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: ReportLeaveSummaryType) {
    const validated = ReportLeaveSummarySchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("report_leave_summary" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<ReportLeaveSummaryType>) {
    return await db.updateTable("report_leave_summary" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("report_leave_summary" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const reportleavesummaryService = new ReportLeaveSummaryService();

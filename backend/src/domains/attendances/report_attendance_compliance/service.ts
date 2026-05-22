// ⚠️ Auto-generated Multi-Tenant Service for ReportAttendanceCompliance
import { db } from "../../../config/infra/database.js";
import { ReportAttendanceComplianceSchema } from "./validator.js";
import { ReportAttendanceComplianceType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ReportAttendanceComplianceService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("report_attendance_compliance" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("report_attendance_compliance" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: ReportAttendanceComplianceType) {
    const validated = ReportAttendanceComplianceSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("report_attendance_compliance" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<ReportAttendanceComplianceType>) {
    return await db.updateTable("report_attendance_compliance" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("report_attendance_compliance" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const reportattendancecomplianceService = new ReportAttendanceComplianceService();

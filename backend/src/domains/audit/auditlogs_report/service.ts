// ⚠️ Auto-generated Multi-Tenant Service for AuditlogsReport
import { db } from "../../../config/infra/database.js";
import { AuditlogsReportSchema } from "./validator.js";
import { AuditlogsReportType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AuditlogsReportService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("auditlogs_report" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("auditlogs_report" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AuditlogsReportType) {
    const validated = AuditlogsReportSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("auditlogs_report" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AuditlogsReportType>) {
    return await db.updateTable("auditlogs_report" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("auditlogs_report" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const auditlogsreportService = new AuditlogsReportService();

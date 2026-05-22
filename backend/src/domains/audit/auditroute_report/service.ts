// ⚠️ Auto-generated Multi-Tenant Service for AuditrouteReport
import { db } from "../../../config/infra/database.js";
import { AuditrouteReportSchema } from "./validator.js";
import { AuditrouteReportType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AuditrouteReportService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("auditroute_report" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("auditroute_report" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AuditrouteReportType) {
    const validated = AuditrouteReportSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("auditroute_report" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AuditrouteReportType>) {
    return await db.updateTable("auditroute_report" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("auditroute_report" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const auditroutereportService = new AuditrouteReportService();

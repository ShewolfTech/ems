// ⚠️ Auto-generated Multi-Tenant Service for CampusAccessLogs
import { db } from "../../../config/infra/database.js";
import { CampusAccessLogsSchema } from "./validator.js";
import { CampusAccessLogsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class CampusAccessLogsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("campus_access_logs" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("campus_access_logs" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: CampusAccessLogsType) {
    const validated = CampusAccessLogsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("campus_access_logs" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<CampusAccessLogsType>) {
    return await db.updateTable("campus_access_logs" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("campus_access_logs" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const campusaccesslogsService = new CampusAccessLogsService();

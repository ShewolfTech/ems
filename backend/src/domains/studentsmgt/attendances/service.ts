// ⚠️ Auto-generated Multi-Tenant Service for Attendances
import { db } from "../../../config/infra/database.js";
import { AttendancesSchema } from "./validator.js";
import { AttendancesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AttendancesService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("attendances" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("attendances" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AttendancesType) {
    const validated = AttendancesSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("attendances" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AttendancesType>) {
    return await db.updateTable("attendances" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("attendances" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const attendancesService = new AttendancesService();

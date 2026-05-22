// ⚠️ Auto-generated Multi-Tenant Service for AttendanceStatus
import { db } from "../../../config/infra/database.js";
import { AttendanceStatusSchema } from "./validator.js";
import { AttendanceStatusType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AttendanceStatusService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("attendance_status" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("attendance_status" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AttendanceStatusType) {
    const validated = AttendanceStatusSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("attendance_status" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AttendanceStatusType>) {
    return await db.updateTable("attendance_status" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("attendance_status" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const attendancestatusService = new AttendanceStatusService();

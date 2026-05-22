// ⚠️ Auto-generated Multi-Tenant Service for AttendancePolicies
import { db } from "../../../config/infra/database.js";
import { AttendancePoliciesSchema } from "./validator.js";
import { AttendancePoliciesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AttendancePoliciesService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("attendance_policies" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("attendance_policies" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AttendancePoliciesType) {
    const validated = AttendancePoliciesSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("attendance_policies" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AttendancePoliciesType>) {
    return await db.updateTable("attendance_policies" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("attendance_policies" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const attendancepoliciesService = new AttendancePoliciesService();

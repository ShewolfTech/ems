// ⚠️ Auto-generated Multi-Tenant Service for Departments
import { db } from "../../../config/infra/database.js";
import { DepartmentsSchema } from "./validator.js";
import { DepartmentsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class DepartmentsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("departments" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("departments" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: DepartmentsType) {
    const validated = DepartmentsSchema.parse({
       ...data,
       school_id: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("departments" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<DepartmentsType>) {
    return await db.updateTable("departments" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("departments" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const departmentsService = new DepartmentsService();

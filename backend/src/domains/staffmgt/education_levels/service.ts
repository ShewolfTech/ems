// ⚠️ Auto-generated Multi-Tenant Service for EducationLevels
import { db } from "../../../config/infra/database.js";
import { EducationLevelsSchema } from "./validator.js";
import { EducationLevelsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class EducationLevelsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("education_levels" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("education_levels" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: EducationLevelsType) {
    const validated = EducationLevelsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("education_levels" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<EducationLevelsType>) {
    return await db.updateTable("education_levels" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("education_levels" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const educationlevelsService = new EducationLevelsService();

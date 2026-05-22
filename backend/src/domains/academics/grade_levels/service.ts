// ⚠️ Auto-generated Multi-Tenant Service for GradeLevels
import { db } from "../../../config/infra/database.js";
import { GradeLevelsSchema } from "./validator.js";
import { GradeLevelsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class GradeLevelsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("grade_levels" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("grade_levels" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: GradeLevelsType) {
    const validated = GradeLevelsSchema.parse({
       ...data,
       school_id: context.schoolId
    });
    return await db.insertInto("grade_levels" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<GradeLevelsType>) {
    return await db.updateTable("grade_levels" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("grade_levels" as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async bulkCreate(context: UserContext, data: any[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      created: [] as any[]
    };

    await db.transaction().execute(async (trx) => {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        try {
          const validated = GradeLevelsSchema.parse({
            ...item,
            school_id: context.schoolId
          });

          const created = await trx.insertInto("grade_levels" as any)
            .values(validated as any)
            .returningAll()
            .executeTakeFirst();

          results.success++;
          results.created.push(created);
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            index: i,
            data: item,
            error: error.message || "Validation failed"
          });
        }
      }
    });

    return results;
  }
}
export const gradelevelsService = new GradeLevelsService();


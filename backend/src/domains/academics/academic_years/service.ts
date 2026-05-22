// ⚠️ Auto-generated Multi-Tenant Service for AcademicYears
import { db } from "../../../config/infra/database.js";
import { AcademicYearsSchema } from "./validator.js";
import { AcademicYearsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AcademicYearsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("academic_years" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("academic_years" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AcademicYearsType) {
    const validated = AcademicYearsSchema.parse({
       ...data,
       school_id: context.schoolId
    });
    return await db.insertInto("academic_years" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AcademicYearsType>) {
    return await db.updateTable("academic_years" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("academic_years" as any)
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

    // Use transaction for atomicity
    await db.transaction().execute(async (trx) => {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        try {
          const validated = AcademicYearsSchema.parse({
            ...item,
            school_id: context.schoolId
          });

          const created = await trx.insertInto("academic_years" as any)
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
export const academicyearsService = new AcademicYearsService();


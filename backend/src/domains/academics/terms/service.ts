// ⚠️ Auto-generated Multi-Tenant Service for Terms
import { db } from "../../../config/infra/database.js";
import { TermsSchema } from "./validator.js";
import { TermsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class TermsService {
  async findAll(context: UserContext, params?: any) {
    return await (db as any)
      .selectFrom("terms")
      .leftJoin("academic_years", "terms.academic_year_id", "academic_years.id")
      .select([
        "terms.id",
        "terms.school_id",
        "terms.academic_year_id",
        "terms.name",
        "terms.code",
        "terms.start_date",
        "terms.end_date",
        "terms.is_active",
        "terms.created_at",
        "academic_years.name as academic_year_name",
        "academic_years.is_current as academic_year_is_current",
      ])
      .where("terms.school_id", "=", context.schoolId)
      .where("terms.is_deleted", "=", false)
      .orderBy("terms.start_date", "asc")
      .execute();
  }

  async findById(context: UserContext, id: number | string) {
    return await (db as any)
      .selectFrom("terms")
      .leftJoin("academic_years", "terms.academic_year_id", "academic_years.id")
      .select([
        "terms.id",
        "terms.school_id",
        "terms.academic_year_id",
        "terms.name",
        "terms.code",
        "terms.start_date",
        "terms.end_date",
        "terms.is_active",
        "academic_years.name as academic_year_name",
        "academic_years.code as academic_year_code",
      ])
      .where("terms.id", "=", Number(id))
      .where("terms.school_id", "=", context.schoolId)
      .where("terms.is_deleted", "=", false)
      .executeTakeFirst();
  }

  async create(context: UserContext, data: TermsType) {
    const validated = TermsSchema.parse({
       ...data,
       school_id: context.schoolId
    });
    return await db.insertInto("terms" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<TermsType>) {
    return await db.updateTable("terms" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("terms" as any)
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
          const validated = TermsSchema.parse({
            ...item,
            school_id: context.schoolId
          });

          const created = await trx.insertInto("terms" as any)
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
export const termsService = new TermsService();


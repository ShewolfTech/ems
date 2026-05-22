import { db } from "../../../config/infra/database.js";
import { StreamsSchema } from "./validator.js";
import { StreamsType } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class StreamsService {
  async findAll(context: UserContext) {
    return await db
      .selectFrom("streams" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any)
      .where("is_deleted" as any, "=", false)
      .execute();
  }

  async findById(context: UserContext, id: number | string) {
    return await db
      .selectFrom("streams" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();
  }

  async create(context: UserContext, data: any) {
    const validated = StreamsSchema.parse({ ...data, school_id: context.schoolId });
    return await db.insertInto("streams" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<StreamsType>) {
    return await db.updateTable("streams" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("streams" as any)
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
          const validated = StreamsSchema.parse({
            ...item,
            school_id: context.schoolId
          });

          const created = await trx.insertInto("streams" as any)
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
export const streamsService = new StreamsService();

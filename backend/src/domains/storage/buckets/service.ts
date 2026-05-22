// ⚠️ Auto-generated Multi-Tenant Service for Buckets
import { db } from "../../../config/infra/database.js";
import { BucketsSchema } from "./validator.js";
import { BucketsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class BucketsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("buckets" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("buckets" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: BucketsType) {
    const validated = BucketsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("buckets" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<BucketsType>) {
    return await db.updateTable("buckets" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("buckets" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const bucketsService = new BucketsService();

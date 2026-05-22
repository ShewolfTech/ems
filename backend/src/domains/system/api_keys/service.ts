// ⚠️ Auto-generated Multi-Tenant Service for ApiKeys
import { db } from "../../../config/infra/database.js";
import { ApiKeysSchema } from "./validator.js";
import { ApiKeysType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ApiKeysService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("api_keys" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("api_keys" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: ApiKeysType) {
    const validated = ApiKeysSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("api_keys" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<ApiKeysType>) {
    return await db.updateTable("api_keys" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("api_keys" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const apikeysService = new ApiKeysService();

// ⚠️ Auto-generated Multi-Tenant Service for Integrations
import { db } from "../../../config/infra/database.js";
import { IntegrationsSchema } from "./validator.js";
import { IntegrationsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class IntegrationsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("integrations" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("integrations" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: IntegrationsType) {
    const validated = IntegrationsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("integrations" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<IntegrationsType>) {
    return await db.updateTable("integrations" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("integrations" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const integrationsService = new IntegrationsService();

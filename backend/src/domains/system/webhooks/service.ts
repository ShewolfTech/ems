// ⚠️ Auto-generated Multi-Tenant Service for Webhooks
import { db } from "../../../config/infra/database.js";
import { WebhooksSchema } from "./validator.js";
import { WebhooksType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class WebhooksService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("webhooks" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("webhooks" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: WebhooksType) {
    const validated = WebhooksSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("webhooks" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<WebhooksType>) {
    return await db.updateTable("webhooks" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("webhooks" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const webhooksService = new WebhooksService();

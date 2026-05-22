// ⚠️ Auto-generated Multi-Tenant Service for Notifications
import { db } from "../../../config/infra/database.js";
import { NotificationsSchema } from "./validator.js";
import { NotificationsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class NotificationsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("notifications" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("notifications" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: NotificationsType) {
    const validated = NotificationsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("notifications" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<NotificationsType>) {
    return await db.updateTable("notifications" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("notifications" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const notificationsService = new NotificationsService();

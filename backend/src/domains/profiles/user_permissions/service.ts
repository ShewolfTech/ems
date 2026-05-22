// ⚠️ Auto-generated Multi-Tenant Service for UserPermissions
import { db } from "../../../config/infra/database.js";
import { UserPermissionsSchema } from "./validator.js";
import { UserPermissionsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class UserPermissionsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("user_permissions" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("user_permissions" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: UserPermissionsType) {
    const validated = UserPermissionsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("user_permissions" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<UserPermissionsType>) {
    return await db.updateTable("user_permissions" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("user_permissions" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const userpermissionsService = new UserPermissionsService();

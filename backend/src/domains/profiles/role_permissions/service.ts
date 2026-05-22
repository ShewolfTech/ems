// ⚠️ Auto-generated Multi-Tenant Service for RolePermissions
import { db } from "../../../config/infra/database.js";
import { RolePermissionsSchema } from "./validator.js";
import { RolePermissionsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class RolePermissionsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("role_permissions" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("role_permissions" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: RolePermissionsType) {
    const validated = RolePermissionsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("role_permissions" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<RolePermissionsType>) {
    return await db.updateTable("role_permissions" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("role_permissions" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const rolepermissionsService = new RolePermissionsService();

// ⚠️ Auto-generated Multi-Tenant Service for RoutePermissions
import { db } from "../../../config/infra/database.js";
import { RoutePermissionsSchema } from "./validator.js";
import { RoutePermissionsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class RoutePermissionsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("route_permissions" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("route_permissions" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: RoutePermissionsType) {
    const validated = RoutePermissionsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("route_permissions" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<RoutePermissionsType>) {
    return await db.updateTable("route_permissions" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("route_permissions" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const routepermissionsService = new RoutePermissionsService();

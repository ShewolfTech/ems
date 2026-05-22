// ⚠️ Auto-generated Multi-Tenant Service for AssetMaintenanceLogs
import { db } from "../../../config/infra/database.js";
import { AssetMaintenanceLogsSchema } from "./validator.js";
import { AssetMaintenanceLogsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AssetMaintenanceLogsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("asset_maintenance_logs" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("asset_maintenance_logs" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AssetMaintenanceLogsType) {
    const validated = AssetMaintenanceLogsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("asset_maintenance_logs" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AssetMaintenanceLogsType>) {
    return await db.updateTable("asset_maintenance_logs" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("asset_maintenance_logs" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const assetmaintenancelogsService = new AssetMaintenanceLogsService();

// ⚠️ Auto-generated Multi-Tenant Service for AssetAssignments
import { db } from "../../../config/infra/database.js";
import { AssetAssignmentsSchema } from "./validator.js";
import { AssetAssignmentsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AssetAssignmentsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("asset_assignments" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("asset_assignments" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AssetAssignmentsType) {
    const validated = AssetAssignmentsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("asset_assignments" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AssetAssignmentsType>) {
    return await db.updateTable("asset_assignments" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("asset_assignments" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const assetassignmentsService = new AssetAssignmentsService();

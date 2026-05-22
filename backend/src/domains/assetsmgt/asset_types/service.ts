// ⚠️ Auto-generated Multi-Tenant Service for AssetTypes
import { db } from "../../../config/infra/database.js";
import { AssetTypesSchema } from "./validator.js";
import { AssetTypesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AssetTypesService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("asset_types" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("asset_types" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: AssetTypesType) {
    const validated = AssetTypesSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("asset_types" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AssetTypesType>) {
    return await db.updateTable("asset_types" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("asset_types" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const assettypesService = new AssetTypesService();

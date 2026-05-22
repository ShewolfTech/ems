// ⚠️ Auto-generated Multi-Tenant Service for RelationshipTypes
import { db } from "../../../config/infra/database.js";
import { RelationshipTypesSchema } from "./validator.js";
import { RelationshipTypesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class RelationshipTypesService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("relationship_types" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("relationship_types" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: RelationshipTypesType) {
    const validated = RelationshipTypesSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("relationship_types" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<RelationshipTypesType>) {
    return await db.updateTable("relationship_types" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("relationship_types" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const relationshiptypesService = new RelationshipTypesService();

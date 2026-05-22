// ⚠️ Auto-generated Multi-Tenant Service for DocumentTypes
import { db } from "../../../config/infra/database.js";
import { DocumentTypesSchema } from "./validator.js";
import { DocumentTypesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class DocumentTypesService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("document_types" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("document_types" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: DocumentTypesType) {
    const validated = DocumentTypesSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("document_types" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<DocumentTypesType>) {
    return await db.updateTable("document_types" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("document_types" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const documenttypesService = new DocumentTypesService();

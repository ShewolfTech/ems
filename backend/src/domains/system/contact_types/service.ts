// ⚠️ Auto-generated Multi-Tenant Service for ContactTypes
import { db } from "../../../config/infra/database.js";
import { ContactTypesSchema } from "./validator.js";
import { ContactTypesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ContactTypesService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("contact_types" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("contact_types" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: ContactTypesType) {
    const validated = ContactTypesSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("contact_types" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<ContactTypesType>) {
    return await db.updateTable("contact_types" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("contact_types" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const contacttypesService = new ContactTypesService();

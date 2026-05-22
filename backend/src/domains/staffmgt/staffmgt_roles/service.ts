// ⚠️ Auto-generated Multi-Tenant Service for StaffmgtRoles
import { db } from "../../../config/infra/database.js";
import { StaffmgtRolesSchema } from "./validator.js";
import { StaffmgtRolesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class StaffmgtRolesService {
  async findAll(context: UserContext, params?: any) {
    // Validate schoolId is a proper number
    if (typeof context.schoolId !== 'number' || isNaN(context.schoolId) || context.schoolId <= 0) {
      console.error("[staffmgt_roles_service] Invalid schoolId in findAll:", context.schoolId);
      throw new Error("Invalid schoolId provided");
    }
    
    let query = db
      .selectFrom("staffmgt_roles" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    // Validate schoolId is a proper number
    if (typeof context.schoolId !== 'number' || isNaN(context.schoolId) || context.schoolId <= 0) {
      console.error("[staffmgt_roles_service] Invalid schoolId in findById:", context.schoolId);
      throw new Error("Invalid schoolId provided");
    }
    
    let query = db
      .selectFrom("staffmgt_roles" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: StaffmgtRolesType) {
    // Validate schoolId is a proper number
    if (typeof context.schoolId !== 'number' || isNaN(context.schoolId) || context.schoolId <= 0) {
      console.error("[staffmgt_roles_service] Invalid schoolId in create:", context.schoolId);
      throw new Error("Invalid schoolId provided");
    }
    
    const validated = StaffmgtRolesSchema.parse({
       ...data,
       school_id: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("staffmgt_roles" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<StaffmgtRolesType>) {
    // Validate schoolId is a proper number
    if (typeof context.schoolId !== 'number' || isNaN(context.schoolId) || context.schoolId <= 0) {
      console.error("[staffmgt_roles_service] Invalid schoolId in update:", context.schoolId);
      throw new Error("Invalid schoolId provided");
    }
    
    return await db.updateTable("staffmgt_roles" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    // Validate schoolId is a proper number
    if (typeof context.schoolId !== 'number' || isNaN(context.schoolId) || context.schoolId <= 0) {
      console.error("[staffmgt_roles_service] Invalid schoolId in delete:", context.schoolId);
      throw new Error("Invalid schoolId provided");
    }
    
    return await db.deleteFrom("staffmgt_roles" as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const staffmgtrolesService = new StaffmgtRolesService();
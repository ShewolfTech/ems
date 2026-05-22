// ⚠️ Auto-generated Multi-Tenant Service for Leaves
import { db } from "../../../config/infra/database.js";
import { LeavesSchema } from "./validator.js";
import { LeavesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class LeavesService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("leaves" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("leaves" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: LeavesType) {
    try {
      // Transform frontend field names to database field names
      const userId = data.user_id ?? context.userId;
      if (!userId) {
        throw new Error("user_id is required");
      }
      
      // Only include fields that exist in the database
      const transformed = {
        school_id: context.schoolId,
        user_id: Number(userId),
        leave_type_id: data.leave_type_id,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date: data.end_date ? new Date(data.end_date) : undefined,
        reason: data.reason,
        document_url: data.document_url,
        status: data.status || 'pending',
        applied_at: data.applied_at ? new Date(data.applied_at) : new Date(),
        approved_by: data.approved_by,
        approved_at: data.approved_at,
        reject_reason: data.reject_reason,
        is_emergency: data.is_emergency,
        is_deleted: false,
        created_by: context.userId,
      };
      
      console.log("[LeavesService.create] Transformed:", JSON.stringify(transformed, null, 2));
      
      return await db.insertInto("leaves" as any)
        .values(transformed as any)
        .returningAll()
        .executeTakeFirst();
    } catch (error) {
      console.error("[LeavesService.create] Error:", error);
      throw error;
    }
  }

  async update(context: UserContext, id: number | string, data: Partial<LeavesType>) {
    return await db.updateTable("leaves" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("leaves" as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async getApprovers(context: UserContext) {
    // Get active users in the school who can be approvers
    return await db
      .selectFrom("users" as any)
      .select(["id", "first_name", "last_name", "email"])
      .where("school_id" as any, "=", context.schoolId as any)
      .where("is_active" as any, "=", true)
      .where("is_deleted" as any, "=", false)
      .execute();
  }
}
export const leavesService = new LeavesService();

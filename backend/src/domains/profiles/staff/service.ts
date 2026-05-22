import { db } from "../../../config/infra/database.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class StaffService {
  async findAll(context: UserContext, params?: any) {
    let query = (db as any)
      .selectFrom("staff")
      .innerJoin("users", "staff.user_id", "users.id")
      .select([
        "staff.id",
        "staff.user_id",
        "staff.employee_no",
        "staff.is_active",
        "users.first_name",
        "users.last_name",
        "users.email",
        "users.phone"
      ])
      .where("staff.school_id", "=", context.schoolId)
      .where("staff.is_deleted", "=", false);

    // Filter by active only if requested
    if (params?.active_only === 'true') {
      query = query.where("staff.is_active", "=", true);
    }

    return await query.orderBy("users.first_name", "asc").execute();
  }

  async findById(context: UserContext, id: number | string) {
    return await (db as any)
      .selectFrom("staff")
      .innerJoin("users", "staff.user_id", "users.id")
      .select([
        "staff.*",
        "users.first_name",
        "users.last_name",
        "users.email",
        "users.phone"
      ])
      .where("staff.id", "=", Number(id))
      .where("staff.school_id", "=", context.schoolId)
      .where("staff.is_deleted", "=", false)
      .executeTakeFirst();
  }
}

export const staffService = new StaffService();

// Users Service - Multi-Tenant
import { db } from "../../../config/infra/database.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class UsersService {
  async findAllActive(context: UserContext) {
    return await db
      .selectFrom("users" as any)
      .select([
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "phone",
        "role_id",
      ])
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .where("is_active" as any, "=", true)
      .orderBy("first_name" as any, "asc")
      .execute();
  }
}

export const usersService = new UsersService();

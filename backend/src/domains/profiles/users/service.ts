// ⚠️ Auto-generated Multi-Tenant Service for Users
import { db } from "../../../config/infra/database.js";
import { UsersSchema } from "./validator.js";
import { UsersType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class UsersService {
  async findAll(context: UserContext, params?: any) {
    console.log('[USERS] Fetching users for school:', context.schoolId);
    console.log('[USERS] Params:', params);
    
    // Join staff with users to get staff members with their user details
    let query = (db as any)
      .selectFrom("staff")
      .innerJoin("users", "staff.user_id", "users.id")
      .select([
        "users.id",
        "users.username",
        "users.email",
        "users.first_name",
        "users.last_name",
        "users.phone",
        "staff.employee_no",
        "staff.is_active as staff_is_active",
        "users.is_active as user_is_active",
        "users.school_id"
      ])
      .where("staff.school_id", "=", context.schoolId)
      .where("staff.is_deleted", "=", false);
    
    // Handle search parameter
    if (params?.search) {
      const search = `%${params.search}%`;
      query = query.where((eb: any) =>
        eb.or([
          eb("users.first_name", "ilike", search),
          eb("users.last_name", "ilike", search),
          eb("users.email", "ilike", search),
          eb("users.username", "ilike", search)
        ])
      );
    }
    
    // Handle limit parameter
    const limit = params?.limit ? parseInt(params.limit) : 100;
    query = query.limit(limit);
    
    query = query.orderBy("users.first_name" as any, "asc");
    
    const result = await query.execute();
    
    console.log('[USERS/STAFF] Found', result.length, 'staff members');
    
    return result;
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("users" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: UsersType) {
    const validated = UsersSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("users" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<UsersType>) {
    return await db.updateTable("users" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("users" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const usersService = new UsersService();

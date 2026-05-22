// âš ï¸ Enhanced Multi-Tenant Service for Staff Management
import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";
import { StaffSchema } from "./validator.js";
import { StaffType } from "./types.js";
import { generateSchoolId, generateUsername } from "../../../utils/generateId.js";
import bcrypt from "bcrypt";
import { z } from "zod";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class StaffService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("staff as s")
      .leftJoin("users as u", "u.id", "s.user_id")
      .leftJoin("departments as d", "d.id", "s.department_id")
      .leftJoin("staffmgt_roles as sr", "sr.id", "s.role_id")
      .select([
        "s.id",
        "s.school_id",
        "s.user_id",
        "s.employee_no",
        "s.hire_date",
        "s.department_id",
        "s.role_id",
        "s.is_active",
        "s.created_at",
        "s.updated_at",
        "u.first_name",
        "u.last_name",
        "u.email",
        "u.phone",
        "u.username",
        "d.name as department_name",
        "d.code as department_code",
        "sr.name as role_name",
        "sr.description as role_description",
      ])
      .where("s.school_id", "=", context.schoolId)
      .where("s.is_deleted", "=", false);

    // Apply filters
    if (params?.search) {
      const search = `%${params.search}%`;
      query = query.where((eb) => eb.or([
        eb("u.first_name", "like", search),
        eb("u.last_name", "like", search),
        eb("u.email", "like", search),
        eb("s.employee_no", "like", search),
      ]));
    }

    if (params?.department_id) {
      query = query.where("s.department_id", "=", Number(params.department_id));
    }

    if (params?.role_id) {
      query = query.where("s.role_id", "=", Number(params.role_id));
    }

    if (params?.employment_status) {
      // Note: employment_status might be in a separate field, fallback to is_active
      if (params.employment_status === 'active') {
        query = query.where("s.is_active", "=", true);
      } else if (params.employment_status === 'inactive') {
        query = query.where("s.is_active", "=", false);
      }
    }

    // Pagination
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 15;
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = db
      .selectFrom("staff as s")
      .leftJoin("users as u", "u.id", "s.user_id")
      .leftJoin("departments as d", "d.id", "s.department_id")
      .leftJoin("staffmgt_roles as sr", "sr.id", "s.role_id")
      .select(sql<number>`count(*)`.as("count"))
      .where("s.school_id", "=", context.schoolId)
      .where("s.is_deleted", "=", false);

    // Apply same filters to count query
    if (params?.search) {
      const search = `%${params.search}%`;
      countQuery.where((eb) => eb.or([
        eb("u.first_name", "like", search),
        eb("u.last_name", "like", search),
        eb("u.email", "like", search),
        eb("s.employee_no", "like", search),
      ]));
    }

    if (params?.department_id) {
      countQuery.where("s.department_id", "=", Number(params.department_id));
    }

    if (params?.role_id) {
      countQuery.where("s.role_id", "=", Number(params.role_id));
    }

    if (params?.employment_status) {
      if (params.employment_status === 'active') {
        countQuery.where("s.is_active", "=", true);
      } else if (params.employment_status === 'inactive') {
        countQuery.where("s.is_active", "=", false);
      }
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = Number(countResult?.count || 0);

    // Get paginated data
    const data = await query
      .orderBy("s.created_at desc")
      .limit(limit)
      .offset(offset)
      .execute();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async findById(context: UserContext, id: number | string) {
    return await db
      .selectFrom("staff as s")
      .leftJoin("users as u", "u.id", "s.user_id")
      .leftJoin("departments as d", "d.id", "s.department_id")
      .leftJoin("staffmgt_roles as sr", "sr.id", "s.role_id")
      .selectAll()
      .where("s.id", "=", Number(id))
      .where("s.school_id", "=", context.schoolId)
      .where("s.is_deleted", "=", false)
      .executeTakeFirst();
  }

  async create(context: UserContext, data: StaffType) {
    try {
      console.log("StaffService.create - Input data:", JSON.stringify(data, null, 2));
      
      // Process email and other fields before validation
      const processedData = {
        ...data,
        school_id: context.schoolId, // ðŸ›¡ï¸ Force correct school_id on creation
        email: data.email ? data.email.trim().toLowerCase() : undefined // Normalize email
      };
      
      console.log("StaffService.create - Processed data:", JSON.stringify(processedData, null, 2));
      
      const validated = StaffSchema.parse(processedData);
      console.log("StaffService.create - Validation passed, creating user...");

      // Auto-generate shared BIGINT ID (used as user_id, staff_id, employee_no)
      const sharedId = await generateSchoolId(context.schoolId);

      // Default password if not provided
      const passwordHash = (validated as any).password
        ? await bcrypt.hash((validated as any).password, 10)
        : await bcrypt.hash('Staff@123', 10);

      // Get staff role if specified
      const roleResult = await db.selectFrom("staffmgt_roles")
        .select("id")
        .where("name", "ilike", "teacher")
        .executeTakeFirst();

      // Create user with explicit ID
      const user: any = await db.insertInto("users")
        .values({
          id: sharedId,
          school_id: context.schoolId,
          username: validated.username || generateUsername(sharedId),
          email: validated.email || null,
          phone: validated.phone || null,
          password: passwordHash,
          first_name: validated.first_name,
          last_name: validated.last_name,
          name: `${validated.first_name || ''} ${validated.last_name || ''}`.trim(),
          role_id: validated.role_id || roleResult?.id || null,
          is_active: true,
          created_by: context.userId,
        })
        .returningAll()
        .executeTakeFirst();

      // Advance the users_id_seq sequence
      await sql`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))`.execute(db);

      // Create staff record (same ID links to user)
      const staff = await db.insertInto("staff")
        .values({
          id: sharedId,
          school_id: context.schoolId,
          user_id: sharedId,
          employee_no: validated.employee_no || String(sharedId),
          hire_date: validated.hire_date || new Date(),
          department_id: validated.department_id || null,
          role_id: validated.role_id || null,
          is_active: true,
          created_by: context.userId,
        })
        .returningAll()
        .executeTakeFirst();

      return { user, staff };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err: any) => {
          const field = err.path.join('.');
          const message = err.message;
          return `${field}: ${message}`;
        });
        throw new Error(`Validation error: ${errorMessages.join(', ')}`);
      }
      throw error;
    }
  }

  async update(context: UserContext, id: number | string, data: Partial<StaffType>) {
    // Update user fields if provided
    if (data.first_name || data.last_name || data.email || data.phone) {
      const userData: any = {};
      if (data.first_name) userData.first_name = data.first_name;
      if (data.last_name) userData.last_name = data.last_name;
      if (data.email) userData.email = data.email.trim().toLowerCase(); // Normalize email
      if (data.phone) userData.phone = data.phone;
      userData.updated_at = new Date();
      userData.updated_by = context.userId;

      await db.updateTable("users")
        .set(userData)
        .where("id", "=", Number(id))
        .where("school_id", "=", context.schoolId)
        .execute();
    }

    // Update staff fields
    const staffUpdateData: any = {
      updated_at: new Date(),
      updated_by: context.userId,
    };
    
    // Copy valid staff fields
    const staffFields = ['employee_no', 'hire_date', 'department_id', 'role_id', 'is_active'];
    for (const field of staffFields) {
      if (data[field] !== undefined) {
        if (field === 'employee_no' && data[field]) {
          staffUpdateData[field] = data[field]; // Keep the provided value
        } else {
          staffUpdateData[field] = data[field];
        }
      }
    }

    return await db.updateTable("staff")
      .set(staffUpdateData)
      .where("id", "=", Number(id))
      .where("school_id", "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    // Soft delete - mark as deleted
    return await db.updateTable("staff")
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: context.userId,
        updated_at: new Date(),
      })
      .where("id", "=", Number(id))
      .where("school_id", "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async getStatistics(context: UserContext) {
    const schoolId = context.schoolId;
    
    // Total staff
    const totalResult = await db.selectFrom("staff")
      .select(sql<number>`count(*)`.as("count"))
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    // Active staff
    const activeResult = await db.selectFrom("staff")
      .select(sql<number>`count(*)`.as("count"))
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .where("is_active", "=", true)
      .executeTakeFirst();

    // Inactive staff
    const inactiveResult = await db.selectFrom("staff")
      .select(sql<number>`count(*)`.as("count"))
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .where("is_active", "=", false)
      .executeTakeFirst();

    // New this month
    const newThisMonthResult = await db.selectFrom("staff")
      .select(sql<number>`count(*)`.as("count"))
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .where("hire_date", ">=", sql<Date>`current_date - interval '30 days'`)
      .executeTakeFirst();

    // Departments count
    const departmentsResult = await db.selectFrom("departments")
      .select(sql<number>`count(*)`.as("count"))
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    // Roles count
    const rolesResult = await db.selectFrom("staffmgt_roles")
      .select(sql<number>`count(*)`.as("count"))
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    return {
      total_staff: Number(totalResult?.count || 0),
      active_staff: Number(activeResult?.count || 0),
      inactive_staff: Number(inactiveResult?.count || 0),
      on_leave: 0, // TODO: Implement when leave management is ready
      new_this_month: Number(newThisMonthResult?.count || 0),
      male_count: 0, // TODO: Add gender tracking
      female_count: 0, // TODO: Add gender tracking
      departments_count: Number(departmentsResult?.count || 0),
      roles_count: Number(rolesResult?.count || 0),
      turnover_rate: 0, // TODO: Calculate based on historical data
      attendance_rate: 0, // TODO: Calculate from attendance data
    };
  }

  async getRoles(context: UserContext) {
    return await db.selectFrom("staffmgt_roles")
      .selectAll()
      .where("school_id", "=", context.schoolId)
      .where("is_deleted", "=", false)
      .orderBy("name asc")
      .execute();
  }

  async getDepartments(context: UserContext) {
    return await db.selectFrom("departments")
      .selectAll()
      .where("school_id", "=", context.schoolId)
      .where("is_deleted", "=", false)
      .orderBy("name asc")
      .execute();
  }

  async transfer(context: UserContext, staffId: string | number, transferData: any) {
    // Verify staff exists
    const staff = await db.selectFrom("staff")
      .selectAll()
      .where("id", "=", Number(staffId))
      .where("school_id", "=", context.schoolId)
      .executeTakeFirst();

    if (!staff) {
      throw new Error("Staff member not found");
    }

    // Verify new department exists
    const department = await db.selectFrom("departments")
      .selectAll()
      .where("id", "=", transferData.new_department_id)
      .where("school_id", "=", context.schoolId)
      .executeTakeFirst();

    if (!department) {
      throw new Error("Department not found");
    }

    // Create transfer record
    const transferRecord = await db.insertInto("staff_transfers")
      .values({
        school_id: context.schoolId,
        staff_id: Number(staffId),
        old_department_id: staff.department_id,
        new_department_id: transferData.new_department_id,
        transfer_date: transferData.transfer_date ? new Date(transferData.transfer_date) : new Date(),
        remarks: transferData.remarks || null,
        transferred_by: transferData.transferred_by || context.userId,
        is_active: true,
        created_at: new Date(),
        created_by: context.userId,
      } as any)
      .returningAll()
      .executeTakeFirst();

    // Update staff department
    const updatedStaff = await db.updateTable("staff")
      .set({
        department_id: transferData.new_department_id,
        updated_at: new Date(),
        updated_by: context.userId,
      })
      .where("id", "=", Number(staffId))
      .returningAll()
      .executeTakeFirst();

    return {
      transfer_record: transferRecord,
      updated_staff: updatedStaff,
      message: "Staff member transferred successfully"
    };
  }

  async promote(context: UserContext, staffId: string | number, promotionData: any) {
    // Verify staff exists
    const staff = await db.selectFrom("staff")
      .selectAll()
      .where("id", "=", Number(staffId))
      .where("school_id", "=", context.schoolId)
      .executeTakeFirst();

    if (!staff) {
      throw new Error("Staff member not found");
    }

    // Verify new role exists
    const role = await db.selectFrom("staffmgt_roles")
      .selectAll()
      .where("id", "=", promotionData.new_role_id)
      .where("school_id", "=", context.schoolId)
      .executeTakeFirst();

    if (!role) {
      throw new Error("Role not found");
    }

    // Create promotion record using staffmgt_promotions table
    const promotionRecord = await db.insertInto("staffmgt_promotions")
      .values({
        school_id: context.schoolId,
        staffmgt_id: Number(staffId),
        old_role_id: staff.role_id,
        new_role_id: promotionData.new_role_id,
        promotion_date: promotionData.promotion_date ? new Date(promotionData.promotion_date) : new Date(),
        remarks: promotionData.remarks || null,
        is_active: true,
        created_at: new Date(),
        created_by: context.userId,
        updated_by: context.userId,
      } as any)
      .returningAll()
      .executeTakeFirst();

    // Update staff role
    const updatedStaff = await db.updateTable("staff")
      .set({
        role_id: promotionData.new_role_id,
        updated_at: new Date(),
        updated_by: context.userId,
      })
      .where("id", "=", Number(staffId))
      .returningAll()
      .executeTakeFirst();

    return {
      promotion_record: promotionRecord,
      updated_staff: updatedStaff,
      message: "Staff member promoted successfully"
    };
  }

  async getTransferHistory(context: UserContext, staffId: string | number) {
    return await db.selectFrom("staff_transfers as st")
      .leftJoin("departments as d1", "d1.id", "st.old_department_id")
      .leftJoin("departments as d2", "d2.id", "st.new_department_id")
      .leftJoin("users as u", "u.id", "st.transferred_by")
      .select([
        "st.id",
        "st.staff_id",
        "st.old_department_id",
        "d1.name as old_department_name",
        "st.new_department_id",
        "d2.name as new_department_name",
        "st.transfer_date",
        "st.remarks",
        "st.transferred_by",
        "u.email as transferred_by_name",
        "st.created_at",
      ])
      .where("st.staff_id", "=", Number(staffId))
      .where("st.school_id", "=", context.schoolId)
      .where("st.is_deleted", "=", false)
      .orderBy("st.transfer_date desc")
      .execute();
  }


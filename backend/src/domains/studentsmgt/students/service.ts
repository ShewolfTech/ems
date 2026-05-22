// Students Service - Multi-Tenant Service Layer
import { db } from "../../../config/infra/database.js";
import { StudentsSchema } from "./validator.js";
import { StudentsType } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export interface StudentFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
  enrollmentStatus?: string;
  gender?: string;
  gradeId?: string;
  classId?: string;
  page?: number;
  limit?: number;
}

export class StudentsService {
  async findAll(context: UserContext, filters?: StudentFilters) {
    let query = db
      .selectFrom("students" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false);

    // Date range filter
    if (filters?.startDate) {
      query = query.where("created_at" as any, ">=", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.where("created_at" as any, "<=", filters.endDate);
    }

    // Enrollment status filter
    if (filters?.enrollmentStatus) {
      query = query.where("enrollment_status" as any, "=", filters.enrollmentStatus);
    }

    // Gender filter
    if (filters?.gender) {
      query = query.where("gender" as any, "=", filters.gender);
    }

    // Grade/class filters
    if (filters?.gradeId) {
      query = query.where("current_grade_id" as any, "=", Number(filters.gradeId));
    }
    if (filters?.classId) {
      query = query.where("current_class_id" as any, "=", Number(filters.classId));
    }

    // Search filter
    if (filters?.search) {
      const search = `%${filters.search}%`;
      query = query.where((eb: any) =>
        eb.or([
          eb("first_name" as any, "ilike", search),
          eb("last_name" as any, "ilike", search),
          eb("admission_no" as any, "ilike", search),
          eb("email" as any, "ilike", search),
        ])
      );
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    query = query.orderBy("created_at" as any, "desc");
    query = query.offset((page - 1) * limit).limit(limit);

    const students = await query.execute();

    // Get total count
    const countQuery = db
      .selectFrom("students" as any)
      .select((eb: any) => eb.fn.count("id" as any).as("total"))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false);

    if (filters?.startDate) countQuery.where("created_at" as any, ">=", filters.startDate);
    if (filters?.endDate) countQuery.where("created_at" as any, "<=", filters.endDate);
    if (filters?.enrollmentStatus) countQuery.where("enrollment_status" as any, "=", filters.enrollmentStatus);
    if (filters?.gender) countQuery.where("gender" as any, "=", filters.gender);
    if (filters?.gradeId) countQuery.where("current_grade_id" as any, "=", Number(filters.gradeId));
    if (filters?.classId) countQuery.where("current_class_id" as any, "=", Number(filters.classId));
    if (filters?.search) {
      const search = `%${filters.search}%`;
      countQuery.where((eb: any) =>
        eb.or([
          eb("first_name" as any, "ilike", search),
          eb("last_name" as any, "ilike", search),
          eb("admission_no" as any, "ilike", search),
          eb("email" as any, "ilike", search),
        ])
      );
    }

    const countResult: any = await countQuery.executeTakeFirst();
    const total = Number(countResult?.total || 0);

    return {
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(context: UserContext, id: number | string) {
    return await db
      .selectFrom("students" as any)
      .selectAll()
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();
  }

  async findByIdWithGuardians(context: UserContext, id: number | string) {
    const student = await db
      .selectFrom("students" as any)
      .selectAll()
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!student) return null;

    const guardians = await db
      .selectFrom("guardians" as any)
      .selectAll()
      .where("student_id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .orderBy("is_primary" as any, "desc")
      .execute();

    return { ...student, guardians };
  }

  async create(context: UserContext, data: StudentsType) {
    const validated = StudentsSchema.parse({
      ...data,
      school_id: context.schoolId,
      created_by: context.userId,
    });
    return await db
      .insertInto("students" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<StudentsType>) {
    return await db
      .updateTable("students" as any)
      .set({ ...data, updated_at: new Date(), updated_by: context.userId })
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db
      .updateTable("students" as any)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: context.userId,
      })
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== GUARDIANS ====================

  async getGuardians(context: UserContext, studentId: number | string) {
    return await db
      .selectFrom("guardians" as any)
      .selectAll()
      .where("student_id" as any, "=", Number(studentId))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .orderBy("is_primary" as any, "desc")
      .execute();
  }

  async createGuardian(context: UserContext, data: any) {
    return await db
      .insertInto("guardians" as any)
      .values({
        ...data,
        school_id: context.schoolId,
        created_by: context.userId,
      })
      .returningAll()
      .executeTakeFirst();
  }

  async updateGuardian(context: UserContext, id: number | string, data: any) {
    return await db
      .updateTable("guardians" as any)
      .set({ ...data, updated_at: new Date(), updated_by: context.userId })
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteGuardian(context: UserContext, id: number | string) {
    return await db
      .updateTable("guardians" as any)
      .set({ is_deleted: true, deleted_at: new Date(), deleted_by: context.userId })
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== STATUS MANAGEMENT ====================

  async changeStatus(context: UserContext, studentId: number | string, data: {
    status: string;
    reason?: string;
    notes?: string;
    effectiveDate?: string;
    documentUrl?: string;
  }) {
    // Get current status
    const student: any = await db
      .selectFrom("students" as any)
      .select(["enrollment_status", "school_id"])
      .where("id" as any, "=", Number(studentId))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!student) throw new Error("Student not found");

    // Update student
    const updated = await db
      .updateTable("students" as any)
      .set({
        enrollment_status: data.status,
        updated_at: new Date(),
        updated_by: context.userId,
      })
      .where("id" as any, "=", Number(studentId))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();

    // Record history
    await db
      .insertInto("student_status_history" as any)
      .values({
        school_id: context.schoolId,
        student_id: Number(studentId),
        status: data.status,
        previous_status: student.enrollment_status,
        reason: data.reason || null,
        effective_date: data.effectiveDate || new Date(),
        notes: data.notes || null,
        document_url: data.documentUrl || null,
        processed_by: context.userId,
        created_by: context.userId,
      })
      .execute();

    return updated;
  }

  async getStatusHistory(context: UserContext, studentId: number | string) {
    return await db
      .selectFrom("student_status_history" as any)
      .selectAll()
      .where("student_id" as any, "=", Number(studentId))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .orderBy("effective_date" as any, "desc")
      .execute();
  }

  // ==================== STATISTICS ====================

  async getStatistics(context: UserContext) {
    const result: any = await (db as any)
      .selectFrom("students")
      .select([
        (eb: any) => eb.fn.count("id").as("total_students"),
        (eb: any) => eb.fn.countAll().filterWhere("enrollment_status", "=", "active").as("active_students"),
        (eb: any) => eb.fn.countAll().filterWhere("enrollment_status", "=", "graduated").as("graduated"),
        (eb: any) => eb.fn.countAll().filterWhere("enrollment_status", "=", "transferred").as("transferred"),
        (eb: any) => eb.fn.countAll().filterWhere("enrollment_status", "=", "withdrawn").as("withdrawn"),
        (eb: any) => eb.fn.countAll().filterWhere("enrollment_status", "=", "suspended").as("suspended"),
        (eb: any) => eb.fn.countAll().filterWhere("enrollment_status", "=", "on_leave").as("on_leave"),
        (eb: any) => eb.fn.countAll().filterWhere("gender", "=", "male").as("male"),
        (eb: any) => eb.fn.countAll().filterWhere("gender", "=", "female").as("female"),
      ])
      .where("school_id", "=", context.schoolId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    return result || {};
  }
}

export const studentsService = new StudentsService();

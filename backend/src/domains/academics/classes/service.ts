// ⚠️ Auto-generated Multi-Tenant Service for Classes
import { db } from "../../../config/infra/database.js";
import { ClassesSchema } from "./validator.js";
import { ClassesType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ClassesService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("classes" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  /**
   * Phase 1: Rich list with grade level name, curriculum name, teacher name, student count
   */
  async findAllWithStats(context: UserContext, _params?: any) {
    // Get base class data
    const rows = await db
      .selectFrom("classes as c")
      .leftJoin("grade_levels as gl", "gl.id", "c.grade_level_id")
      .leftJoin("curricula as cu", "cu.id", "c.curriculum_id")
      .leftJoin("staff as st", "st.id", "c.class_teacher_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "c.id",
        "c.school_id",
        "c.grade_level_id",
        "c.curriculum_id",
        "c.class_teacher_id",
        "c.name",
        "c.code",
        "c.stream",
        "c.academic_year",
        "c.room",
        "c.capacity",
        "c.description",
        "c.is_active",
        "c.is_deleted",
        "c.created_at",
        "c.updated_at",
        "gl.name as grade_level_name",
        "gl.code as grade_level_code",
        "cu.name as curriculum_name",
        "cu.code as curriculum_code",
        "st.id as teacher_id",
        "u.first_name",
        "u.last_name",
      ])
      .where("c.school_id", "=", context.schoolId as any)
      .where("c.is_deleted", "=", false)
      .execute();

    // Get student counts per class
    const counts = await db
      .selectFrom("class_students")
      .select("class_id")
      .select((eb) => eb.fn.countAll().as("cnt"))
      .where("class_students.is_deleted", "=", false)
      .where("class_students.school_id", "=", context.schoolId as any)
      .groupBy("class_id")
      .execute();

    const countMap = new Map<number, number>();
    counts.forEach((c: any) => countMap.set(Number(c.class_id), Number(c.cnt)));

    return rows.map((r: any) => ({
      ...r,
      teacher_name: r.first_name && r.last_name
        ? `${r.first_name} ${r.last_name}`
        : null,
      student_count: countMap.get(Number(r.id)) || 0,
    }));
  }

  /**
   * Phase 1: Single class with enrolled students
   */
  async findByIdWithStudents(context: UserContext, id: number | string) {
    const cls = await db
      .selectFrom("classes as c")
      .leftJoin("grade_levels as gl", "gl.id", "c.grade_level_id")
      .leftJoin("curricula as cu", "cu.id", "c.curriculum_id")
      .leftJoin("staff as st", "st.id", "c.class_teacher_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "c.id", "c.school_id", "c.grade_level_id", "c.curriculum_id",
        "c.class_teacher_id", "c.name", "c.code", "c.description",
        "c.stream", "c.academic_year", "c.room", "c.capacity",
        "c.is_active", "c.created_at", "c.updated_at",
        "gl.name as grade_level_name", "gl.code as grade_level_code",
        "cu.name as curriculum_name", "cu.code as curriculum_code",
        "st.id as teacher_id",
        "u.first_name", "u.last_name",
      ])
      .where("c.id", "=", id as any)
      .where("c.school_id", "=", context.schoolId as any)
      .where("c.is_deleted", "=", false)
      .executeTakeFirst();

    if (!cls) return null;

    const students = await db
      .selectFrom("class_students as cs")
      .innerJoin("students as s", "s.id", "cs.student_id")
      .select([
        "s.id as student_id",
        "s.first_name",
        "s.last_name",
        "s.admission_no",
        "s.gender",
        "s.date_of_birth",
        "cs.enrollment_date",
        "cs.is_active",
      ])
      .where("cs.class_id", "=", id as any)
      .where("cs.is_deleted", "=", false)
      .where("cs.school_id", "=", context.schoolId as any)
      .orderBy("s.last_name asc")
      .execute();

    // Get teachers for this class
    const teachers = await db
      .selectFrom("class_teachers as ct")
      .innerJoin("staff as st", "st.id", "ct.teacher_id")
      .leftJoin("users as usr", "usr.id", "st.user_id")
      .leftJoin("subjects as subj", "subj.id", "ct.subject_id")
      .select([
        "ct.id",
        "ct.teacher_id",
        "ct.subject_id",
        "ct.is_primary",
        "usr.first_name",
        "usr.last_name",
        "subj.name as subject_name",
        "subj.code as subject_code",
      ])
      .where("ct.class_id", "=", id as any)
      .where("ct.school_id", "=", context.schoolId as any)
      .where("ct.is_deleted", "=", false)
      .execute();

    // Get available subjects for this class (matching grade_level_id or no grade level = all)
    const availableSubjects = await db
      .selectFrom("subjects as s")
      .select(["s.id", "s.name", "s.code"])
      .where("s.school_id", "=", context.schoolId as any)
      .where("s.is_deleted", "=", false)
      .where("s.is_active", "=", true)
      .where((eb) => eb.or([
        eb("s.grade_level_id", "=", cls.grade_level_id as any),
        eb("s.grade_level_id", "is", null),
      ]))
      .orderBy("s.name asc")
      .execute();

    const clsObj = cls as any;
    return {
      ...clsObj,
      teacher_name: clsObj.first_name && clsObj.last_name
        ? `${clsObj.first_name} ${clsObj.last_name}`
        : null,
      students,
      teachers,
      availableSubjects,
      student_count: students.length,
    };
  }

  /**
   * Phase 1.5: Get today's attendance for a class (session + records)
   */
  async getTodayAttendance(context: UserContext, classId: number | string) {
    const today = new Date().toISOString().split("T")[0];

    // Find or create today's session for this class
    let session = await db
      .selectFrom("attendance_sessions as sess")
      .selectAll()
      .where("sess.class_id", "=", classId as any)
      .where("sess.date", "=", today)
      .where("sess.is_deleted", "=", false)
      .where("sess.school_id", "=", context.schoolId as any)
      .executeTakeFirst();

    // Create session if it doesn't exist
    if (!session) {
      // Get class teacher for the session
      const classTeacher = await db
        .selectFrom("class_teachers as ct")
        .select("ct.teacher_id")
        .where("ct.class_id", "=", classId as any)
        .where("ct.is_primary", "=", true)
        .where("ct.is_deleted", "=", false)
        .executeTakeFirst();

      // Get user_id from staff
      let teacherUserId = null;
      if (classTeacher?.teacher_id) {
        const staffUser = await db
          .selectFrom("staff as s")
          .select("s.user_id")
          .where("s.id", "=", classTeacher.teacher_id as any)
          .where("s.is_deleted", "=", false)
          .executeTakeFirst();
        teacherUserId = staffUser?.user_id;
      }

      if (!teacherUserId) teacherUserId = context.userId || 1;

      session = await db
        .insertInto("attendance_sessions" as any)
        .values({
          school_id: context.schoolId,
          class_id: Number(classId),
          session_type: "class",
          date: today,
          start_time: "08:00:00",
          end_time: "15:00:00",
          status: "scheduled",
          teacher_id: teacherUserId,
          is_deleted: false,
        } as any)
        .returningAll()
        .executeTakeFirst();
    }

    if (!session) return null;

    // Get enrolled students
    const students = await db
      .selectFrom("class_students as cs")
      .innerJoin("students as s", "s.id", "cs.student_id")
      .select([
        "s.id as student_id",
        "s.first_name",
        "s.last_name",
        "s.admission_no",
      ])
      .where("cs.class_id", "=", classId as any)
      .where("cs.is_deleted", "=", false)
      .where("cs.school_id", "=", context.schoolId as any)
      .orderBy("s.last_name asc")
      .execute();

    // Get existing records for this session
    const records = await db
      .selectFrom("attendance_records as rec")
      .select(["rec.id", "rec.user_id as student_id", "rec.status", "rec.remark"])
      .where("rec.session_id", "=", (session as any).id)
      .where("rec.is_deleted", "=", false)
      .execute();

    const recordMap = new Map();
    records.forEach((r: any) => recordMap.set(r.student_id, r));

    return {
      session_id: (session as any).id,
      date: (session as any).date,
      status: (session as any).status,
      students: students.map((s: any) => ({
        student_id: s.student_id,
        first_name: s.first_name,
        last_name: s.last_name,
        admission_no: s.admission_no,
        status: recordMap.get(s.student_id)?.status || "P",
        remark: recordMap.get(s.student_id)?.remark || null,
      })),
    };
  }

  /**
   * Phase 1.5: Bulk mark attendance for a class session
   */
  async markAttendance(context: UserContext, sessionId: number, records: Array<{ studentId: number; status: string; remark?: string }>) {
    const results: any[] = [];

    for (const rec of records) {
      // Upsert: try update first, if no row exists then insert
      const updated = await db
        .updateTable("attendance_records" as any)
        .set({
          status: rec.status,
          remark: rec.remark || null,
          updated_at: new Date(),
        })
        .where("session_id" as any, "=", sessionId)
        .where("user_id" as any, "=", rec.studentId)
        .where("school_id" as any, "=", context.schoolId as any)
        .returningAll()
        .executeTakeFirst();

      if (!updated) {
        const inserted = await db
          .insertInto("attendance_records" as any)
          .values({
            school_id: context.schoolId,
            session_id: sessionId,
            user_id: rec.studentId,
            status: rec.status,
            remark: rec.remark || null,
            recorded_by: context.userId || 1,
            method: "manual",
            is_deleted: false,
          } as any)
          .returningAll()
          .executeTakeFirst();
        results.push(inserted);
      } else {
        results.push(updated);
      }
    }

    // Update session status to completed
    await db
      .updateTable("attendance_sessions" as any)
      .set({ status: "completed", updated_at: new Date() })
      .where("id", "=", sessionId)
      .execute();

    return results;
  }

  /**
   * Phase 1.6: Get teachers for a class
   */
  async getClassTeachers(context: UserContext, classId: number | string) {
    const rows = await db
      .selectFrom("class_teachers as ct")
      .innerJoin("staff as st", "st.id", "ct.teacher_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .leftJoin("subjects as subj", "subj.id", "ct.subject_id")
      .select([
        "ct.id",
        "ct.teacher_id",
        "ct.subject_id",
        "ct.is_primary",
        "ct.academic_year",
        "u.first_name",
        "u.last_name",
        "subj.name as subject_name",
        "subj.code as subject_code",
      ])
      .where("ct.class_id", "=", classId as any)
      .where("ct.school_id", "=", context.schoolId as any)
      .where("ct.is_deleted", "=", false)
      .execute();

    return rows.map((r: any) => ({
      ...r,
      teacher_name: r.first_name && r.last_name
        ? `${r.first_name} ${r.last_name}`
        : "Unknown",
    }));
  }

  /**
   * Phase 1.6: Assign teacher to class
   */
  async assignTeacher(context: UserContext, classId: number, teacherId: number, subjectId?: number, isPrimary?: boolean) {
    const result = await db
      .insertInto("class_teachers" as any)
      .values({
        school_id: context.schoolId,
        class_id: classId,
        teacher_id: teacherId,
        subject_id: subjectId || null,
        is_primary: isPrimary || false,
        is_deleted: false,
      } as any)
      .returningAll()
      .executeTakeFirst();

    // If this is a homeroom teacher, also update the classes.class_teacher_id
    if (isPrimary) {
      await db
        .updateTable("classes" as any)
        .set({
          class_teacher_id: teacherId,
          updated_at: new Date(),
        })
        .where("id", "=", classId)
        .where("school_id", "=", context.schoolId as any)
        .execute();
    }

    return result;
  }

  /**
   * Phase 1.6: Remove teacher from class
   */
  async removeTeacher(context: UserContext, classTeacherId: number) {
    // First, get the teacher assignment details
    const teacherAssignment = await db
      .selectFrom("class_teachers" as any)
      .select(["class_id", "teacher_id", "is_primary"])
      .where("id", "=", classTeacherId)
      .where("school_id", "=", context.schoolId as any)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    // Mark as deleted
    const result = await db
      .updateTable("class_teachers" as any)
      .set({ is_deleted: true })
      .where("id", "=", classTeacherId)
      .where("school_id", "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();

    // If this was the homeroom teacher, clear the class_teacher_id
    if (teacherAssignment?.is_primary) {
      await db
        .updateTable("classes" as any)
        .set({
          class_teacher_id: null,
          updated_at: new Date(),
        })
        .where("id", "=", teacherAssignment.class_id)
        .where("school_id", "=", context.schoolId as any)
        .execute();
    }

    return result;
  }

  /**
   * Add student to class
   */
  async addStudent(context: UserContext, classId: number, studentId: number) {
    return await db
      .insertInto("class_students" as any)
      .values({
        school_id: context.schoolId,
        class_id: classId,
        student_id: studentId,
        enrollment_date: new Date(),
        is_active: true,
        is_deleted: false,
      } as any)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Remove student from class
   */
  async removeStudent(context: UserContext, classId: number, studentId: number) {
    return await db
      .updateTable("class_students" as any)
      .set({ is_deleted: true })
      .where("class_id", "=", classId)
      .where("student_id", "=", studentId)
      .where("school_id", "=", context.schoolId as any)
      .where("is_deleted", "=", false)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Phase 1.6: Summary stats for dashboard card
   */
  async getStats(context: UserContext) {
    const rows = await db
      .selectFrom("classes as c")
      .leftJoin("class_students as cs", (join) =>
        join.onRef("cs.class_id", "=", "c.id")
          .on("cs.is_deleted", "=", false)
      )
      .select([
        (eb) => eb.fn.count("c.id").as("total_classes"),
        (eb) => eb.fn.count("c.id").filterWhere("c.is_active", "=", true).as("active_classes"),
        (eb) => eb.fn.count("c.id").filterWhere("c.is_active", "=", false).as("inactive_classes"),
        (eb) => eb.fn.count("cs.id").as("total_enrollments"),
        (eb) => eb.fn.avg("cs_count.cnt").as("avg_class_size"),
      ])
      .where("c.school_id", "=", context.schoolId as any)
      .where("c.is_deleted", "=", false)
      .executeTakeFirst();

    return rows;
  }

  /**
   * Feature: Bulk enroll students in a class
   */
  async bulkEnrollStudents(context: UserContext, classId: number, studentIds: number[]) {
    const results = [];
    for (const studentId of studentIds) {
      try {
        const enrolled = await db
          .insertInto("class_students" as any)
          .values({
            school_id: context.schoolId,
            class_id: classId,
            student_id: studentId,
            is_active: true,
            is_deleted: false,
          } as any)
          .returningAll()
          .executeTakeFirst();
        results.push(enrolled);
      } catch (e) {
        // Skip if already enrolled
        continue;
      }
    }
    return results;
  }

  /**
   * Feature: Update teacher subject for a class
   */
  async updateTeacherSubject(context: UserContext, classId: number, teacherRecordId: number, subjectId: number | null) {
    return db
      .updateTable("class_teachers" as any)
      .set({
        subject_id: subjectId,
        updated_at: new Date(),
      })
      .where("id", "=", teacherRecordId)
      .where("class_id", "=", classId)
      .where("school_id", "=", context.schoolId as any)
      .where("is_deleted", "=", false)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Feature: Transfer student from one class to another
   */
  async transferStudent(context: UserContext, classId: number, studentId: number, targetClassId: number) {
    // Verify target class exists and belongs to same school
    const targetClass = await db
      .selectFrom("classes as c")
      .select("c.id")
      .where("c.id", "=", targetClassId)
      .where("c.school_id", "=", context.schoolId as any)
      .where("c.is_deleted", "=", false)
      .executeTakeFirst();

    if (!targetClass) throw new Error("Target class not found");

    // Soft delete from current class
    await db
      .updateTable("class_students" as any)
      .set({ is_deleted: true, updated_at: new Date() })
      .where("class_id", "=", classId)
      .where("student_id", "=", studentId)
      .where("school_id", "=", context.schoolId as any)
      .where("is_deleted", "=", false)
      .execute();

    // Enroll in target class
    return db
      .insertInto("class_students" as any)
      .values({
        school_id: context.schoolId,
        class_id: targetClassId,
        student_id: studentId,
        is_active: true,
        is_deleted: false,
      } as any)
      .returningAll()
      .executeTakeFirst();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("classes" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: ClassesType) {
    const validated = ClassesSchema.parse({
       ...data,
       school_id: context.schoolId
    });
    return await db.insertInto("classes" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<ClassesType>) {
    return await db.updateTable("classes" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("classes" as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async bulkCreate(context: UserContext, data: any[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      created: [] as any[]
    };

    await db.transaction().execute(async (trx) => {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        try {
          const validated = ClassesSchema.parse({
            ...item,
            school_id: context.schoolId
          });

          const created = await trx.insertInto("classes" as any)
            .values(validated as any)
            .returningAll()
            .executeTakeFirst();

          results.success++;
          results.created.push(created);
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            index: i,
            data: item,
            error: error.message || "Validation failed"
          });
        }
      }
    });

    return results;
  }
}
export const classesService = new ClassesService();


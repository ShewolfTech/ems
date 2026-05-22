// ⚠️ Auto-generated Multi-Tenant Service for Lessons
import { db } from "../../../config/infra/database.js";
import { LessonsSchema } from "./validator.js";
import { LessonsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class LessonsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("lessons" as any)
      .leftJoin("classes", "lessons.class_id", "classes.id")
      .leftJoin("subjects", "lessons.subject_id", "subjects.id")
      .leftJoin("staff", "lessons.teacher_id", "staff.id")
      .leftJoin("users", "staff.user_id", "users.id")
      .leftJoin("terms", "lessons.term_id", "terms.id")
      .select([
        "lessons.id",
        "lessons.school_id",
        "lessons.class_id",
        "lessons.subject_id",
        "lessons.teacher_id",
        "lessons.term_id",
        "lessons.title",
        "lessons.description",
        "lessons.scheduled_date",
        "lessons.start_time",
        "lessons.end_time",
        "lessons.room",
        "lessons.is_active",
        "lessons.created_at",
        "classes.name as class_name",
        "classes.code as class_code",
        "subjects.name as subject_name",
        "subjects.code as subject_code",
        "users.first_name as teacher_first_name",
        "users.last_name as teacher_last_name",
        "terms.name as term_name",
      ])
      .where("lessons.school_id" as any, "=", context.schoolId as any);
    query = query.where("lessons.is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("lessons" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: LessonsType) {
    const validated = LessonsSchema.parse({
       ...data,
       school_id: context.schoolId
    });

    // Validate term dates if term_id is provided
    if (validated.term_id) {
      const term = await db
        .selectFrom("terms" as any)
        .select(["start_date", "end_date", "name"])
        .where("id", "=", validated.term_id)
        .where("school_id", "=", context.schoolId as any)
        .executeTakeFirst();

      if (!term) throw new Error("Term not found");

      const scheduledDate = new Date(validated.scheduled_date as string);
      const termEnd = new Date(term.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Block lessons for ended terms beyond 90-day window
      // (prevents data entry for completed academic periods)
      if (termEnd < today) {
        const maxBackdating = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        if (scheduledDate < maxBackdating) {
          throw new Error(`Cannot create lessons for ended term "${term.name}" (ended ${term.end_date}). Maximum backdating is 90 days from today.`);
        }
      }
    }

    return await db.insertInto("lessons" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<LessonsType>) {
    return await db.updateTable("lessons" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("lessons" as any)
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
          const validated = LessonsSchema.parse({
            ...item,
            school_id: context.schoolId
          });

          const created = await trx.insertInto("lessons" as any)
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

  async generateFromTimetable(context: UserContext, timetableId: number) {
    // Get timetable details
    const timetable = await db
      .selectFrom("timetables as tt")
      .select(["tt.id", "tt.class_id", "tt.term_id", "tt.name"])
      .where("tt.id", "=", timetableId)
      .where("tt.school_id" as any, "=", context.schoolId as any)
      .executeTakeFirst();

    if (!timetable) throw new Error("Timetable not found");

    // Get term dates
    const term = await db
      .selectFrom("terms as t")
      .select(["t.start_date", "t.end_date", "t.name"])
      .where("t.id", "=", timetable.term_id)
      .where("t.school_id" as any, "=", context.schoolId as any)
      .executeTakeFirst();

    if (!term) throw new Error("Term not found");

    // Get timetable entries
    const entries = await db
      .selectFrom("timetable_entries as te")
      .leftJoin("subjects as s", "te.subject_id", "s.id")
      .leftJoin("staff as st", "te.teacher_id", "st.id")
      .leftJoin("users as u", "st.user_id", "u.id")
      .select([
        "te.id",
        "te.subject_id",
        "te.teacher_id",
        "te.day_of_week",
        "te.start_time",
        "te.end_time",
        "te.room",
        "s.name as subject_name",
        "u.first_name as teacher_first_name",
        "u.last_name as teacher_last_name",
      ])
      .where("te.timetable_id", "=", timetableId)
      .where("te.school_id" as any, "=", context.schoolId as any)
      .execute();

    if (entries.length === 0) throw new Error("No timetable entries found");

    // Map day numbers to day names (JavaScript: 0=Sunday, 1=Monday, etc.)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      created: [] as any[]
    };

    // Generate lessons from NOW to end of term (not backwards)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    const termStart = new Date(term.start_date);
    const termEnd = new Date(term.end_date);

    // Use the later of now or term start
    const startDate = now > termStart ? now : termStart;
    const endDate = termEnd;

    if (startDate > endDate) {
      throw new Error("Term has already ended");
    }

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayName = dayNames[currentDate.getDay()]; // Get 'Monday', 'Tuesday', etc.

      // Find entries for this day by matching day names
      const dayEntries = entries.filter(e => e.day_of_week === dayName);

      for (const entry of dayEntries) {
        try {
          const lesson = await db
            .insertInto("lessons" as any)
            .values({
              school_id: context.schoolId,
              class_id: timetable.class_id,
              subject_id: entry.subject_id,
              teacher_id: entry.teacher_id,
              term_id: timetable.term_id,
              title: `${entry.subject_name} - ${timetable.name}`,
              description: `Generated from timetable: ${timetable.name}`,
              scheduled_date: currentDate.toISOString().split('T')[0],
              start_time: entry.start_time,
              end_time: entry.end_time,
              room: entry.room,
              is_active: true,
              is_deleted: false,
            } as any)
            .returningAll()
            .executeTakeFirst();

          results.success++;
          results.created.push(lesson);
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            date: currentDate.toISOString().split('T')[0],
            subject: entry.subject_name,
            error: error.message || "Failed to create lesson"
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  }

  /**
   * Get attendance records for a lesson
   */
  async getLessonAttendance(context: UserContext, lessonId: number) {
    // Get the lesson details
    const lesson = await db
      .selectFrom("lessons as l")
      .leftJoin("classes as c", "l.class_id", "c.id")
      .select(["l.id", "l.class_id", "c.name as class_name"])
      .where("l.id", "=", lessonId)
      .where("l.school_id" as any, "=", context.schoolId as any)
      .executeTakeFirst();

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Get students enrolled in the class
    const students = await db
      .selectFrom("class_students as cs")
      .innerJoin("students as s", "s.id", "cs.student_id")
      .select([
        "s.id as student_id",
        "s.first_name",
        "s.last_name",
      ])
      .where("cs.class_id", "=", lesson.class_id as any)
      .where("cs.is_deleted" as any, "=", false)
      .where("cs.school_id" as any, "=", context.schoolId as any)
      .orderBy("s.last_name asc")
      .execute();

    // Get existing attendance records for this lesson
    const records = await db
      .selectFrom("class_attendance as ca")
      .select(["ca.student_id", "ca.status", "ca.remark"])
      .where("ca.lesson_id", "=", lessonId)
      .where("ca.school_id" as any, "=", context.schoolId as any)
      .where("ca.is_deleted" as any, "=", false)
      .execute();

    // Merge students with their attendance status
    const mergedStudents = students.map((student: any) => {
      const record = records.find((r: any) => Number(r.student_id) === Number(student.student_id));
      return {
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        status: record?.status || '',
        remark: record?.remark || '',
      };
    });

    return {
      lesson_id: lessonId,
      class_name: lesson.class_name,
      students: mergedStudents,
    };
  }

  /**
   * Save attendance for a lesson (creates or updates)
   */
  async saveLessonAttendance(
    context: UserContext,
    lessonId: number,
    records: Array<{ student_id: number; status: string; remark?: string }>
  ) {
    // Verify lesson exists and belongs to school
    const lesson = await db
      .selectFrom("lessons")
      .select("id")
      .where("id", "=", lessonId)
      .where("school_id" as any, "=", context.schoolId as any)
      .executeTakeFirst();

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    let created = 0;
    let updated = 0;

    await db.transaction().execute(async (trx) => {
      for (const record of records) {
        if (record.status) {
          // Check if record exists
          const existing = await (trx as any)
            .selectFrom("class_attendance" as any)
            .select("id")
            .where("lesson_id" as any, "=", lessonId)
            .where("student_id" as any, "=", record.student_id)
            .where("school_id" as any, "=", context.schoolId as any)
            .where("is_deleted" as any, "=", false)
            .executeTakeFirst();

          if (existing) {
            // Update existing record
            await (trx as any)
              .updateTable("class_attendance" as any)
              .set({
                status: record.status,
                remark: record.remark || null,
                updated_by: context.userId,
                updated_at: new Date(),
              } as any)
              .where("id" as any, "=", existing.id)
              .execute();
            updated++;
          } else {
            // Insert new record
            await (trx as any)
              .insertInto("class_attendance" as any)
              .values({
                school_id: context.schoolId,
                lesson_id: lessonId,
                student_id: record.student_id,
                status: record.status,
                remark: record.remark || null,
                created_by: context.userId,
                is_deleted: false,
              } as any)
              .execute();
            created++;
          }
        }
      }
    });

    return { created, updated, total: records.filter(r => r.status).length };
  }
}
export const lessonsService = new LessonsService();


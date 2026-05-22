// Multi-Tenant Service for Lesson Deliveries
import { db } from "../../../config/infra/database.js";
import { LessonDeliverySchema, QuickMarkDeliverySchema } from "./validator.js";
import { LessonDeliveryType, QuickMarkDeliveryInput } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class LessonDeliveriesService {
  async findAll(context: UserContext, params?: any) {
    const today = new Date().toISOString().split('T')[0];

    // Use the database view which handles null lesson_id correctly
    // Default: show today onwards (upcoming lessons first)
    const startDate = params?.start_date || today;
    const endDate = params?.end_date || "2100-12-31";

    let query = db
      .selectFrom("v_lesson_deliveries_detail as v")
      .selectAll()
      .where("v.scheduled_date" as any, ">=", startDate)
      .where("v.scheduled_date" as any, "<=", endDate)
      .orderBy("v.scheduled_date" as any, "asc")
      .orderBy("v.lesson_start_time" as any, "asc");

    if (params?.status) {
      query = query.where("v.status" as any, "=", params.status);
    }

    const results = await query.execute();

    // Enrich with timetable entry data if teacher/time/room are missing
    const enriched = await Promise.all(results.map(async (row: any) => {
      if (row.timetable_entry_id && (!row.teacher_first_name || !row.lesson_start_time)) {
        const entry = await db
          .selectFrom("timetable_entries as te")
          .leftJoin("subjects as s", "te.subject_id", "s.id")
          .leftJoin("staff as st", "te.teacher_id", "st.id")
          .leftJoin("users as u", "st.user_id", "u.id")
          .select([
            "te.start_time",
            "te.end_time",
            "te.room",
            "te.teacher_id",
            "u.first_name as teacher_first_name",
            "u.last_name as teacher_last_name",
            "s.name as subject_name",
            "s.code as subject_code",
          ])
          .where("te.id", "=", Number(row.timetable_entry_id))
          .executeTakeFirst();

        if (entry) {
          return {
            ...row,
            start_time: row.start_time || entry.start_time,
            end_time: row.end_time || entry.end_time,
            room: row.room || entry.room,
            teacher_first_name: row.teacher_first_name || entry.teacher_first_name,
            teacher_last_name: row.teacher_last_name || entry.teacher_last_name,
            subject_name: row.subject_name || entry.subject_name,
            subject_code: row.subject_code || entry.subject_code,
          };
        }
      }
      return row;
    }));

    return enriched;
  }

  async findById(context: UserContext, id: number | string) {
    return await db
      .selectFrom("v_lesson_deliveries_detail as v")
      .selectAll()
      .where("v.delivery_id" as any, "=", id as any)
      .executeTakeFirst();
  }

  async create(context: UserContext, data: LessonDeliveryType) {
    const validated = LessonDeliverySchema.parse({
      ...data,
      school_id: context.schoolId,
    });

    // Verify lesson if provided
    if (validated.lesson_id) {
      const lesson = await db
        .selectFrom("lessons")
        .select("id")
        .where("id", "=", validated.lesson_id)
        .where("school_id" as any, "=", context.schoolId)
        .where("is_deleted" as any, "=", false)
        .executeTakeFirst();

      if (!lesson) {
        throw new Error("Lesson not found or not accessible");
      }
    }

    return await db
      .insertInto("lesson_deliveries" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<LessonDeliveryType>) {
    const existing = await db
      .selectFrom("lesson_deliveries")
      .select(["id", "status", "lesson_id", "timetable_entry_id", "scheduled_date", "school_id"])
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!existing) {
      throw new Error("Lesson delivery not found");
    }

    // If status changed to postponed with reschedule date, create new delivery
    let rescheduledDeliveryId: number | null = null;
    if (data.status === 'postponed' && (data as any).rescheduled_to_date && existing.status !== 'postponed') {
      const newDelivery = await db
        .insertInto("lesson_deliveries" as any)
        .values({
          school_id: context.schoolId,
          lesson_id: existing.lesson_id,
          timetable_entry_id: existing.timetable_entry_id,
          scheduled_date: (data as any).rescheduled_to_date,
          status: 'planned',
          rescheduled_from_id: existing.id,
          created_by: context.userId,
        } as any)
        .returning("id")
        .executeTakeFirst();

      rescheduledDeliveryId = (newDelivery as any)?.id;
    }

    const updateData: any = {
      ...data,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    // Remove rescheduled_to_date from update data (it's only used for creating new delivery)
    delete updateData.rescheduled_to_date;

    const result = await db
      .updateTable("lesson_deliveries" as any)
      .set(updateData)
      .where("id" as any, "=", id as any)
      .returningAll()
      .executeTakeFirst();

    return { ...result, rescheduled_delivery_id: rescheduledDeliveryId };
  }

  async quickMarkDelivered(
    context: UserContext,
    id: number | string,
    input: QuickMarkDeliveryInput
  ) {
    const existing = await db
      .selectFrom("lesson_deliveries")
      .select("id")
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!existing) {
      throw new Error("Lesson delivery not found");
    }

    return await db
      .updateTable("lesson_deliveries" as any)
      .set({
        status: 'delivered',
        delivered_at: new Date(),
        teacher_notes: input.teacher_notes,
        objectives_covered: input.objectives_covered ?? true,
        resources_used: input.resources_used,
        homework_assigned: input.homework_assigned,
        updated_by: context.userId,
        updated_at: new Date(),
      } as any)
      .where("id" as any, "=", id as any)
      .returningAll()
      .executeTakeFirst();
  }

  async quickMarkCancelled(
    context: UserContext,
    id: number | string,
    input: QuickMarkDeliveryInput
  ) {
    const existing = await db
      .selectFrom("lesson_deliveries")
      .select("id")
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!existing) {
      throw new Error("Lesson delivery not found");
    }

    return await db
      .updateTable("lesson_deliveries" as any)
      .set({
        status: 'cancelled',
        teacher_notes: input.teacher_notes,
        challenges_faced: input.challenges_faced,
        updated_by: context.userId,
        updated_at: new Date(),
      } as any)
      .where("id" as any, "=", id as any)
      .returningAll()
      .executeTakeFirst();
  }

  async quickMarkPostponed(
    context: UserContext,
    id: number | string,
    input: QuickMarkDeliveryInput
  ) {
    const existing = await db
      .selectFrom("lesson_deliveries")
      .select("id")
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!existing) {
      throw new Error("Lesson delivery not found");
    }

    return await db
      .updateTable("lesson_deliveries" as any)
      .set({
        status: 'postponed',
        teacher_notes: input.teacher_notes,
        follow_up_needed: input.follow_up_needed ?? true,
        follow_up_notes: input.follow_up_notes,
        updated_by: context.userId,
        updated_at: new Date(),
      } as any)
      .where("id" as any, "=", id as any)
      .returningAll()
      .executeTakeFirst();
  }

  async generateFromTimetables(
    context: UserContext,
    startDate?: string,
    endDate?: string,
    classId?: number,
    teacherId?: number
  ) {
    // If dates not provided, function defaults to current active term
    const result = await db.executeQuery({
      sql: `SELECT generate_lesson_deliveries_from_timetables(
        $1::date,
        $2::date,
        $3::bigint,
        $4::bigint,
        $5::bigint
      ) as count`,
      parameters: [startDate ?? null, endDate ?? null, classId ?? null, teacherId ?? null, context.schoolId],
    });

    const count = result.rows?.[0]?.count || 0;
    const rangeText = startDate && endDate ? `${startDate} → ${endDate}` : 'today → end of term';
    return { generated: count, dateRange: rangeText };
  }

  async getTodaysLessons(
    context: UserContext,
    teacherId?: number,
    classId?: number,
    date?: string
  ) {
    // Query the view - returns today's deliveries with full details
    const query = db
      .selectFrom('v_todays_lesson_deliveries' as any)
      .selectAll();

    return await query.execute();
  }

  async getLessonsByDate(
    context: UserContext,
    date: string,
    teacherId?: number,
    classId?: number
  ) {
    // Query the detail view with date filter
    const query = db
      .selectFrom('v_lesson_deliveries_detail' as any)
      .selectAll()
      .where('scheduled_date' as any, '=', date)
      .orderBy('lesson_start_time' as any, 'asc');

    return await query.execute();
  }

  async getDeliveryHistoryForLesson(
    context: UserContext,
    lessonId: number | string
  ) {
    return await db
      .selectFrom("lesson_deliveries as ld")
      .leftJoin("lessons as l", "ld.lesson_id", "l.id")
      .leftJoin("classes as c", "l.class_id", "c.id")
      .leftJoin("subjects as sub", "l.subject_id", "sub.id")
      .leftJoin("staff as st", "l.teacher_id", "st.id")
      .leftJoin("users as u", "st.user_id", "u.id")
      .selectAll("ld")
      .select([
        "c.name as class_name",
        "sub.name as subject_name",
        "u.first_name as teacher_first_name",
        "u.last_name as teacher_last_name",
      ])
      .where("ld.lesson_id" as any, "=", lessonId as any)
      .where("ld.school_id" as any, "=", context.schoolId)
      .where("ld.is_deleted" as any, "=", false)
      .orderBy("ld.scheduled_date", "desc")
      .execute();
  }

  async delete(context: UserContext, id: number | string) {
    return await db
      .updateTable("lesson_deliveries" as any)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: context.userId,
        updated_at: new Date(),
      } as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async getStats(context: UserContext, params?: any) {
    const startDate = params?.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endDate = params?.end_date || new Date().toISOString();

    const stats = await db
      .selectFrom("lesson_deliveries as ld")
      .select([
        db.fn.countAll().as("total"),
        db.fn.countAll().filterWhere("ld.status", "=", "delivered").as("delivered"),
        db.fn.countAll().filterWhere("ld.status", "=", "cancelled").as("cancelled"),
        db.fn.countAll().filterWhere("ld.status", "=", "postponed").as("postponed"),
        db.fn.countAll().filterWhere("ld.status", "=", "planned").as("planned"),
        db.fn.avg("ld.attendance_count").as("avg_attendance"),
      ])
      .where("ld.school_id" as any, "=", context.schoolId)
      .where("ld.scheduled_date" as any, ">=", startDate)
      .where("ld.scheduled_date" as any, "<=", endDate)
      .where("ld.is_deleted" as any, "=", false)
      .executeTakeFirst();

    return stats;
  }
}

export const lessonDeliveriesService = new LessonDeliveriesService();

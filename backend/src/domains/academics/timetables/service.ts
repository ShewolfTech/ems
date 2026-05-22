import { db } from "../../../config/infra/database.js";
import { TimetablesSchema } from "./validator.js";
import { TimetablesType } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class TimetablesService {
  async findAll(context: UserContext, params?: any) {
    return await db
      .selectFrom("timetables as t")
      .leftJoin("classes as c", "c.id", "t.class_id")
      .leftJoin("terms as tr", "tr.id", "t.term_id")
      .leftJoin("academic_years as ay", "ay.id", "tr.academic_year_id")
      .select([
        "t.id",
        "t.school_id",
        "t.class_id",
        "t.term_id",
        "t.name",
        "t.description",
        "t.is_active",
        "t.created_at",
        "c.name as class_name",
        "c.code as class_code",
        "tr.name as term_name",
        "tr.code as term_code",
        "ay.name as academic_year_name",
      ])
      .where("t.school_id" as any, "=", context.schoolId as any)
      .where("t.is_deleted" as any, "=", false)
      .orderBy("t.created_at" as any, "desc")
      .execute();
  }

  async findById(context: UserContext, id: number | string) {
    const tt = await db
      .selectFrom("timetables as t")
      .leftJoin("classes as c", "c.id", "t.class_id")
      .leftJoin("terms as tr", "tr.id", "t.term_id")
      .select([
        "t.id",
        "t.school_id",
        "t.class_id",
        "t.term_id",
        "t.name",
        "t.description",
        "t.is_active",
        "t.created_at",
        "c.name as class_name",
        "c.code as class_code",
        "tr.name as term_name",
      ])
      .where("t.id", "=", Number(id))
      .where("t.school_id" as any, "=", context.schoolId as any)
      .where("t.is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!tt) return null;

    const entries = await db
      .selectFrom("timetable_entries as te")
      .leftJoin("subjects as s", "s.id", "te.subject_id")
      .leftJoin("staff as st", "st.id", "te.teacher_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "te.id",
        "te.timetable_id",
        "te.day_of_week",
        "te.start_time",
        "te.end_time",
        "te.subject_id",
        "te.teacher_id",
        "te.room",
        "te.is_active",
        "s.name as subject_name",
        "s.code as subject_code",
        "u.first_name as teacher_first_name",
        "u.last_name as teacher_last_name",
      ])
      .where("te.timetable_id", "=", Number(id))
      .where("te.school_id" as any, "=", context.schoolId as any)
      .where("te.is_deleted" as any, "=", false)
      .orderBy("te.day_of_week" as any, "asc")
      .orderBy("te.start_time" as any, "asc")
      .execute();

    return { ...tt, entries };
  }

  async create(context: UserContext, data: TimetablesType) {
    const validated = TimetablesSchema.parse({ ...data, school_id: context.schoolId });
    return await db.insertInto("timetables" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<TimetablesType>) {
    return await db.updateTable("timetables" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    await db.updateTable("timetable_entries" as any)
      .set({ is_deleted: true, updated_at: new Date() })
      .where("timetable_id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .execute();

    return await db.updateTable("timetables" as any)
      .set({ is_deleted: true, updated_at: new Date() })
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async addEntry(context: UserContext, timetableId: number, entry: any) {
    const conflicts = await this._checkConflicts(context, timetableId, entry);
    if (conflicts.length > 0) throw new Error(conflicts[0]);

    return await db.insertInto("timetable_entries" as any)
      .values({
        school_id: context.schoolId,
        timetable_id: timetableId,
        day_of_week: entry.dayOfWeek,
        start_time: entry.startTime,
        end_time: entry.endTime,
        subject_id: entry.subjectId || null,
        teacher_id: entry.teacherId || null,
        room: entry.room || null,
        is_active: true,
        is_deleted: false,
      } as any)
      .returningAll()
      .executeTakeFirst();
  }

  async updateEntry(context: UserContext, timetableId: number, entryId: number, entry: any) {
    const conflicts = await this._checkConflicts(context, timetableId, entry, entryId);
    if (conflicts.length > 0) throw new Error(conflicts[0]);

    return await db.updateTable("timetable_entries" as any)
      .set({
        day_of_week: entry.dayOfWeek,
        start_time: entry.startTime,
        end_time: entry.endTime,
        subject_id: entry.subjectId || null,
        teacher_id: entry.teacherId || null,
        room: entry.room || null,
        updated_at: new Date(),
      })
      .where("id" as any, "=", entryId)
      .where("timetable_id" as any, "=", timetableId)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteEntry(context: UserContext, timetableId: number, entryId: number) {
    return await db.updateTable("timetable_entries" as any)
      .set({ is_deleted: true, updated_at: new Date() })
      .where("id" as any, "=", entryId)
      .where("timetable_id" as any, "=", timetableId)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async clone(context: UserContext, sourceTimetableId: number, targetTimetableId: number) {
    // Verify both timetables belong to this school
    const source = await db
      .selectFrom("timetables")
      .select(["id", "school_id"])
      .where("id", "=", sourceTimetableId)
      .where("school_id", "=", context.schoolId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    if (!source) throw new Error("Source timetable not found");

    const target = await db
      .selectFrom("timetables")
      .select(["id", "school_id"])
      .where("id", "=", targetTimetableId)
      .where("school_id", "=", context.schoolId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    if (!target) throw new Error("Target timetable not found");

    // Get all active entries from source
    const sourceEntries = await db
      .selectFrom("timetable_entries")
      .select(["day_of_week", "start_time", "end_time", "subject_id", "teacher_id", "room"])
      .where("timetable_id", "=", sourceTimetableId)
      .where("school_id", "=", context.schoolId)
      .where("is_deleted", "=", false)
      .execute();

    if (sourceEntries.length === 0) {
      throw new Error("Source timetable has no entries to clone");
    }

    // Insert entries into target timetable
    const entriesToInsert = sourceEntries.map(entry => ({
      school_id: context.schoolId,
      timetable_id: targetTimetableId,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      subject_id: entry.subject_id,
      teacher_id: entry.teacher_id,
      room: entry.room,
      is_active: true,
      is_deleted: false,
    }));

    const inserted = await db
      .insertInto("timetable_entries" as any)
      .values(entriesToInsert as any)
      .returningAll()
      .execute();

    return {
      clonedEntries: inserted.length,
      targetTimetableId,
      sourceTimetableId,
    };
  }

  async generateSmartTimetable(context: UserContext, timetableId: number) {
    // Get timetable details
    const timetable = await db
      .selectFrom("timetables")
      .select(["id", "class_id", "term_id", "school_id"])
      .where("id", "=", timetableId)
      .where("school_id", "=", context.schoolId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    if (!timetable) throw new Error("Timetable not found");

    // Get class teachers and subjects
    const classTeachers: any[] = await db
      .selectFrom("class_teachers as ct")
      .leftJoin("staff as s", "ct.teacher_id", "s.id")
      .leftJoin("users as u", "s.user_id", "u.id")
      .leftJoin("subjects as sub", "ct.subject_id", "sub.id")
      .select([
        "ct.teacher_id",
        "ct.subject_id",
        "ct.is_primary",
        "u.first_name",
        "u.last_name",
        "sub.name as subject_name",
        "sub.code as subject_code",
      ])
      .where("ct.class_id", "=", timetable.class_id)
      .where("ct.is_deleted", "=", false)
      .execute();

    if (classTeachers.length === 0) {
      throw new Error("No teachers assigned to this class. Assign teachers first.");
    }

    // Get term dates to determine school days
    const term = await db
      .selectFrom("terms")
      .select(["id", "start_date", "end_date"])
      .where("id", "=", timetable.term_id)
      .executeTakeFirst();

    // Define time slots (standard school day: 7:30 - 15:30, 40-min periods + breaks)
    const timeSlots = [
      { start: "07:30:00", end: "08:10:00" },
      { start: "08:10:00", end: "08:50:00" },
      { start: "08:50:00", end: "09:30:00" },
      { start: "09:30:00", end: "09:50:00", isBreak: true, breakName: "Morning Break" },
      { start: "09:50:00", end: "10:30:00" },
      { start: "10:30:00", end: "11:10:00" },
      { start: "11:10:00", end: "11:50:00" },
      { start: "11:50:00", end: "12:30:00", isBreak: true, breakName: "Lunch" },
      { start: "12:30:00", end: "13:10:00" },
      { start: "13:10:00", end: "13:50:00" },
      { start: "13:50:00", end: "14:30:00" },
      { start: "14:30:00", end: "15:10:00" },
    ];

    const schoolDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const teachingSlots = timeSlots.filter(s => !s.isBreak);

    // Calculate periods per subject per week
    const totalTeachingSlots = teachingSlots.length * schoolDays.length; // ~40
    const subjectCount = classTeachers.length;
    const periodsPerSubject = Math.floor(totalTeachingSlots / subjectCount);

    // Build teacher schedule map to avoid double-booking
    const teacherSchedule: Record<string, Record<string, boolean>> = {};
    classTeachers.forEach(ct => {
      if (ct.teacher_id) {
        teacherSchedule[ct.teacher_id] = {};
      }
    });

    // Check other timetables for teacher availability
    const otherEntries: any[] = await db
      .selectFrom("timetable_entries")
      .select(["teacher_id", "day_of_week", "start_time", "end_time"])
      .where("school_id", "=", context.schoolId)
      .where("timetable_id", "!=", timetableId)
      .where("is_deleted", "=", false)
      .where("is_active", "=", true)
      .execute();

    otherEntries.forEach(entry => {
      if (entry.teacher_id) {
        const key = `${entry.day_of_week}_${entry.start_time}`;
        if (teacherSchedule[entry.teacher_id]) {
          teacherSchedule[entry.teacher_id][key] = true;
        }
      }
    });

    // Generate timetable entries
    const entriesToInsert: any[] = [];
    const subjectPeriodsUsed: Record<number, number> = {};
    const daySubjectCount: Record<string, Record<number, number>> = {};

    schoolDays.forEach(day => {
      daySubjectCount[day] = {};
      classTeachers.forEach(ct => {
        if (ct.subject_id) {
          daySubjectCount[day][ct.subject_id] = 0;
          if (!subjectPeriodsUsed[ct.subject_id]) subjectPeriodsUsed[ct.subject_id] = 0;
        }
      });
    });

    // Greedy algorithm: fill slots ensuring balanced distribution
    for (const day of schoolDays) {
      for (const slot of teachingSlots) {
        // Find best subject for this slot
        let bestSubject: any = null;
        let bestScore = -1;

        for (const ct of classTeachers) {
          if (!ct.subject_id || !ct.teacher_id) continue;

          const subjectId = ct.subject_id;
          const teacherId = ct.teacher_id;

          // Skip if teacher is already booked
          const teacherKey = `${day}_${slot.start}`;
          if (teacherSchedule[teacherId]?.[teacherKey]) continue;

          // Calculate score (prefer subjects with fewer periods, avoid repeating same day)
          const periodsUsed = subjectPeriodsUsed[subjectId] || 0;
          const dayCount = daySubjectCount[day][subjectId] || 0;

          // Score: prefer under-represented subjects, penalize same-day repeats
          const score = (periodsPerSubject - periodsUsed) - (dayCount * 2);

          if (score > bestScore) {
            bestScore = score;
            bestSubject = ct;
          }
        }

        if (bestSubject) {
          const subjectId = bestSubject.subject_id;
          const teacherId = bestSubject.teacher_id;

          entriesToInsert.push({
            school_id: context.schoolId,
            timetable_id: timetableId,
            day_of_week: day,
            start_time: slot.start,
            end_time: slot.end,
            subject_id: subjectId,
            teacher_id: teacherId,
            room: null,
            is_active: true,
            is_deleted: false,
          });

          // Mark teacher as busy
          teacherSchedule[teacherId][`${day}_${slot.start}`] = true;

          // Update counts
          subjectPeriodsUsed[subjectId] = (subjectPeriodsUsed[subjectId] || 0) + 1;
          daySubjectCount[day][subjectId] = (daySubjectCount[day][subjectId] || 0) + 1;
        }
      }
    }

    // Insert all entries
    if (entriesToInsert.length === 0) {
      throw new Error("Could not generate timetable. Check teacher/subject assignments.");
    }

    const inserted = await db
      .insertInto("timetable_entries" as any)
      .values(entriesToInsert as any)
      .returningAll()
      .execute();

    return {
      generatedEntries: inserted.length,
      timetableId,
      periodsPerSubject,
      schedule: daySubjectCount,
    };
  }

  async getSchoolWorkload(context: UserContext) {
    // Single query: join all timetables + entries + teachers
    const entries: any[] = await (db as any)
      .selectFrom("timetable_entries as te")
      .leftJoin("timetables as tt", "tt.id", "te.timetable_id")
      .leftJoin("classes as c", "c.id", "tt.class_id")
      .leftJoin("staff as st", "st.id", "te.teacher_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "te.teacher_id",
        "u.first_name as teacher_first_name",
        "u.last_name as teacher_last_name",
        "c.name as class_name",
        "te.start_time",
        "te.end_time",
        "te.room",
      ])
      .where("te.school_id", "=", context.schoolId)
      .where("te.is_deleted", "=", false)
      .where("te.is_active", "=", true)
      .execute();

    // Aggregate in JS
    const teacherMap: Record<string, { name: string, periods: number, totalMinutes: number, classCount: number, classNames: string[] }> = {};

    entries.forEach((e: any) => {
      // Skip breaks and entries without teacher
      if (!e.teacher_id) return;
      if (e.room && e.room.startsWith("BREAK:")) return;
      
      const tKey = String(e.teacher_id);
      if (!teacherMap[tKey]) {
        teacherMap[tKey] = {
          name: `${e.teacher_first_name || ''} ${e.teacher_last_name || ''}`.trim() || `Teacher ${tKey}`,
          periods: 0, totalMinutes: 0, classCount: 0, classNames: []
        };
      }
      const [sh, sm] = (e.start_time || "00:00:00").split(":").map(Number);
      const [eh, em] = (e.end_time || "00:00:00").split(":").map(Number);
      const minutes = (eh * 60 + em) - (sh * 60 + sm);
      teacherMap[tKey].periods++;
      teacherMap[tKey].totalMinutes += minutes;
      if (e.class_name && !teacherMap[tKey].classNames.includes(e.class_name)) {
        teacherMap[tKey].classNames.push(e.class_name);
        teacherMap[tKey].classCount = teacherMap[tKey].classNames.length;
      }
    });

    const teachers = Object.values(teacherMap).sort((a, b) => b.totalMinutes - a.totalMinutes);

    return { teachers };
  }

  async copyTimetable(context: UserContext, fromTimetableId: number, toClassId: number, toTermId: number, name: string) {
    const existing = await db
      .selectFrom("timetables" as any)
      .select("id")
      .where("school_id" as any, "=", context.schoolId as any)
      .where("class_id" as any, "=", toClassId)
      .where("term_id" as any, "=", toTermId)
      .where("name" as any, "=", name)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (existing) throw new Error("A timetable with this name already exists for this class/term");

    const newTt = await db.insertInto("timetables" as any)
      .values({
        school_id: context.schoolId,
        class_id: toClassId,
        term_id: toTermId,
        name,
        is_active: true,
        is_deleted: false,
        created_by: context.userId,
      } as any)
      .returningAll()
      .executeTakeFirst();

    const entries = await db
      .selectFrom("timetable_entries" as any)
      .selectAll()
      .where("timetable_id" as any, "=", fromTimetableId)
      .where("school_id" as any, "=", context.schoolId as any)
      .where("is_deleted" as any, "=", false)
      .execute();

    for (const entry of entries) {
      await db.insertInto("timetable_entries" as any)
        .values({
          school_id: context.schoolId,
          timetable_id: (newTt as any).id,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          subject_id: entry.subject_id,
          teacher_id: entry.teacher_id,
          room: entry.room,
          is_active: true,
          is_deleted: false,
          created_by: context.userId,
        } as any)
        .execute();
    }

    return newTt;
  }

  private async _checkConflicts(context: UserContext, timetableId: number, entry: any, excludeEntryId?: number): Promise<string[]> {
    const conflicts: string[] = [];

    // Check teacher double-booking
    if (entry.teacherId) {
      const teacherConflict: any = await (db as any)
        .selectFrom("timetable_entries as te")
        .leftJoin("timetables as t", "t.id", "te.timetable_id")
        .select([
          "te.id",
          "t.name as timetable_name",
          "te.teacher_id",
        ] as any)
        .where("te.school_id", "=", context.schoolId)
        .where("te.teacher_id", "=", entry.teacherId)
        .where("te.day_of_week", "=", entry.dayOfWeek)
        .where("te.is_deleted", "=", false)
        .where("te.is_active", "=", true)
        .where("te.start_time", "<", entry.endTime)
        .where("te.end_time", ">", entry.startTime)
        .execute();

      const filtered = excludeEntryId ? teacherConflict.filter((c: any) => c.id !== excludeEntryId) : teacherConflict;
      if (filtered.length > 0) {
        // Fetch teacher name for the error message
        const staff: any = await (db as any)
          .selectFrom("staff as s")
          .leftJoin("users as u", "u.id", "s.user_id")
          .select(["u.first_name", "u.last_name"])
          .where("s.id", "=", entry.teacherId)
          .executeTakeFirst();

        const teacherName = staff ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() : 'Unknown';
        conflicts.push(`Teacher "${teacherName}" is already scheduled at this time in timetable "${filtered[0].timetable_name}"`);
      }
    }

    // Check room double-booking
    if (entry.room) {
      const roomConflict: any = await (db as any)
        .selectFrom("timetable_entries as te")
        .leftJoin("timetables as t", "t.id", "te.timetable_id")
        .select(["te.id", "t.name as timetable_name", "te.room"])
        .where("te.school_id", "=", context.schoolId)
        .where("te.room", "=", entry.room)
        .where("te.day_of_week", "=", entry.dayOfWeek)
        .where("te.is_deleted", "=", false)
        .where("te.is_active", "=", true)
        .where("te.start_time", "<", entry.endTime)
        .where("te.end_time", ">", entry.startTime)
        .execute();

      const filtered = excludeEntryId ? roomConflict.filter((c: any) => c.id !== excludeEntryId) : roomConflict;
      if (filtered.length > 0) {
        conflicts.push(`Room "${entry.room}" is already in use at this time in timetable "${filtered[0].timetable_name}"`);
      }
    }

    return conflicts;
  }
}
export const timetablesService = new TimetablesService();

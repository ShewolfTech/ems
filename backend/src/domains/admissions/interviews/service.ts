// Interviews Service
import { db } from "../../../config/infra/database.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class InterviewsService {
  async findAll(context: UserContext, filters?: any) {
    let query = (db as any)
      .selectFrom("interviews")
      .innerJoin("applications", "interviews.application_id", "applications.id")
      .innerJoin("applicants", "applications.applicant_id", "applicants.id")
      .select([
        "interviews.id",
        "interviews.application_id",
        "interviews.interview_type",
        "interviews.scheduled_date",
        "interviews.scheduled_end_time",
        "interviews.location",
        "interviews.interview_notes",
        "interviews.interview_score",
        "interviews.interview_outcome",
        "interviews.is_completed",
        "interviews.is_deleted",
        "applications.id as application_id",
        "applications.application_no",
        "applicants.first_name",
        "applicants.last_name",
        "applicants.email as applicant_email",
        "applicants.phone as applicant_phone"
      ])
      .where("interviews.school_id", "=", context.schoolId)
      .where("interviews.is_deleted", "=", false);

    if (filters?.application_id) {
      query = query.where("interviews.application_id", "=", filters.application_id);
    }

    if (filters?.status === 'pending') {
      query = query.where("interviews.is_completed", "=", false);
    } else if (filters?.status === 'completed') {
      query = query.where("interviews.is_completed", "=", true);
    }

    if (filters?.date_from) {
      query = query.where("interviews.scheduled_date", ">=", filters.date_from);
    }

    if (filters?.date_to) {
      query = query.where("interviews.scheduled_date", "<=", filters.date_to);
    }

    return await query.orderBy("interviews.scheduled_date", "asc").execute();
  }

  async findById(context: UserContext, id: number | string) {
    return await (db as any)
      .selectFrom("interviews")
      .innerJoin("applications", "interviews.application_id", "applications.id")
      .innerJoin("applicants", "applications.applicant_id", "applicants.id")
      .select([
        "interviews.*",
        "applications.application_no",
        "applicants.first_name",
        "applicants.last_name",
        "applicants.email as applicant_email",
        "applicants.phone as applicant_phone",
        "applicants.date_of_birth",
        "applicants.gender"
      ])
      .where("interviews.id", "=", Number(id))
      .where("interviews.school_id", "=", context.schoolId)
      .where("interviews.is_deleted", "=", false)
      .executeTakeFirst();
  }

  async create(context: UserContext, data: any) {
    console.log('[INTERVIEWS] Creating interview with data:', data);

    // Check for duplicate interview
    const existing = await db
      .selectFrom("interviews" as any)
      .select("id")
      .where("application_id", "=", data.application_id)
      .where("school_id", "=", context.schoolId)
      .where("is_completed", "=", false)
      .where("is_deleted", "=", false)
      .executeTakeFirst();
    
    if (existing) {
      throw new Error('An interview is already scheduled for this application. Please complete or cancel it first.');
    }

    // Convert scheduled_end_time (time string) to timestamp if needed
    let scheduled_end_time = null;
    if (data.scheduled_end_time && data.scheduled_date) {
      // Combine date with end time
      const datePart = new Date(data.scheduled_date).toISOString().split('T')[0];
      scheduled_end_time = `${datePart}T${data.scheduled_end_time}:00`;
    } else if (data.scheduled_end_time) {
      // If only time provided, use today's date
      const today = new Date().toISOString().split('T')[0];
      scheduled_end_time = `${today}T${data.scheduled_end_time}:00`;
    }

    const values = {
      application_id: data.application_id,
      interview_type: data.interview_type,
      scheduled_date: data.scheduled_date,
      scheduled_end_time: scheduled_end_time,
      location: data.location || null,
      interviewer_ids: data.interviewer_ids || null,
      interview_notes: data.interview_notes || null,
      school_id: context.schoolId,
      created_by: context.userId,
      is_completed: false,
    };

    console.log('[INTERVIEWS] Inserting values:', values);

    try {
      const result = await db
        .insertInto("interviews" as any)
        .values(values)
        .returningAll()
        .executeTakeFirst();

      console.log('[INTERVIEWS] Interview created:', result);
      return result;
    } catch (error: any) {
      console.error('[INTERVIEWS] Error creating interview:', error.message);
      console.error('[INTERVIEWS] Error details:', error);
      throw error;
    }
  }

  async update(context: UserContext, id: number | string, data: any) {
    console.log('[INTERVIEWS] Updating interview:', id, data);
    
    const values = {
      interview_type: data.interview_type,
      scheduled_date: data.scheduled_date,
      scheduled_end_time: data.scheduled_end_time || null,
      location: data.location || null,
      interviewer_ids: data.interviewer_ids || null,
      interview_notes: data.interview_notes || null,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    try {
      const result = await db
        .updateTable("interviews" as any)
        .set(values)
        .where("id", "=", Number(id))
        .where("school_id", "=", context.schoolId)
        .returningAll()
        .executeTakeFirst();
      
      console.log('[INTERVIEWS] Interview updated:', result);
      return result;
    } catch (error: any) {
      console.error('[INTERVIEWS] Error updating interview:', error.message);
      throw error;
    }
  }

  async complete(context: UserContext, id: number | string, data: any) {
    const values = {
      is_completed: true,
      completed_at: new Date(),
      interview_outcome: data.outcome,
      interview_score: data.score,
      interview_notes: data.notes,
      outcome_notes: data.outcome_notes,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    return await db
      .updateTable("interviews" as any)
      .set(values)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    // Hard delete since interviews table doesn't have soft delete columns
    return await db
      .deleteFrom("interviews" as any)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .execute();
  }

  async getPendingInterviews(context: UserContext) {
    return await (db as any)
      .selectFrom("interviews")
      .innerJoin("applications", "interviews.application_id", "applications.id")
      .innerJoin("applicants", "applications.applicant_id", "applicants.id")
      .select([
        "interviews.id",
        "interviews.application_id",
        "interviews.interview_type",
        "interviews.scheduled_date",
        "interviews.location",
        "interviews.interview_notes",
        "interviews.is_completed",
        "applications.application_no",
        "applicants.first_name",
        "applicants.last_name",
        "applicants.email as applicant_email",
        "applicants.phone as applicant_phone",
        "applications.applying_for_grade",
      ])
      .where("interviews.school_id", "=", context.schoolId)
      .where("interviews.is_completed", "=", false)
      .where("interviews.is_deleted", "=", false)
      .orderBy("interviews.scheduled_date", "asc")
      .execute();
  }

  async getStatistics(context: UserContext, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    let query = db
      .selectFrom("interviews" as any)
      .select([
        (eb: any) => eb.fn.count("interviews.id").as("total"),
        (eb: any) => eb.fn.count(eb.case()
          .when("interviews.is_completed", "=", false)
          .then(1)
        ).as("pending"),
        (eb: any) => eb.fn.count(eb.case()
          .when("interviews.is_completed", "=", true)
          .then(1)
        ).as("completed")
      ])
      .where("interviews.school_id" as any, "=", context.schoolId)
      .where("interviews.is_deleted" as any, "=", false);

    // Date range filter
    if (filters?.startDate) {
      query = query.where("interviews.scheduled_date" as any, ">=", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.where("interviews.scheduled_date" as any, "<=", filters.endDate);
    }

    return await query.executeTakeFirst();
  }
}

export const interviewsService = new InterviewsService();

// Decisions & Enrollment Service
import { db } from "../../../config/infra/database.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class DecisionsService {
  // ==================== DECISIONS ====================
  
  async makeDecision(context: UserContext, applicationId: number, decisionData: any) {
    const { decision_type, offer_details, rejection_reason, waitlist_position } = decisionData;

    // Check if decision already exists
    const existing = await db
      .selectFrom("application_decisions" as any)
      .select("id")
      .where("application_id", "=", applicationId)
      .where("school_id", "=", context.schoolId)
      .executeTakeFirst();

    let decision;

    if (existing) {
      // Update existing decision
      decision = await db
        .updateTable("application_decisions" as any)
        .set({
          decision_type,
          offer_details: decision_type === 'offered' ? JSON.stringify(offer_details) : null,
          rejection_reason: decision_type === 'rejected' ? rejection_reason : null,
          waitlist_position: decision_type === 'waitlisted' ? waitlist_position : null,
          decision_by: context.userId,
          updated_at: new Date(),
        })
        .where("application_id", "=", applicationId)
        .where("school_id", "=", context.schoolId)
        .returningAll()
        .executeTakeFirst();
    } else {
      // Create new decision
      decision = await db
        .insertInto("application_decisions" as any)
        .values({
          school_id: context.schoolId,
          application_id: applicationId,
          decision_type,
          offer_details: decision_type === 'offered' ? JSON.stringify(offer_details) : null,
          rejection_reason: decision_type === 'rejected' ? rejection_reason : null,
          waitlist_position: decision_type === 'waitlisted' ? waitlist_position : null,
          decision_by: context.userId,
          decision_date: new Date(),
        })
        .returningAll()
        .executeTakeFirst();
    }

    // Update application status based on decision
    let statusCode = 'PENDING';
    if (decision_type === 'offered') statusCode = 'OFFERED';
    else if (decision_type === 'waitlisted') statusCode = 'WAITLISTED';
    else if (decision_type === 'rejected') statusCode = 'REJECTED';

    await db
      .updateTable("applications" as any)
      .set({
        admission_status_id: await this.getStatusIdByCode(context.schoolId, statusCode),
        decision_made_at: new Date(),
      })
      .where("id", "=", applicationId)
      .execute();

    // ==================== AUTO-CREATE ENROLLMENT FOR OFFERED DECISIONS ====================
    if (decision_type === 'offered' && offer_details) {
      // Check if enrollment already exists for this application
      const existingEnrollment = await db
        .selectFrom("enrollments" as any)
        .select("id")
        .where("application_id", "=", applicationId)
        .where("school_id", "=", context.schoolId)
        .executeTakeFirst();

      if (!existingEnrollment) {
        // Auto-create enrollment record with pending_confirmation status
        await db
          .insertInto("enrollments" as any)
          .values({
            school_id: context.schoolId,
            application_id: applicationId,
            enrollment_date: new Date(),
            academic_year: offer_details.academic_year || new Date().getFullYear().toString(),
            grade_id: offer_details.grade_id || null,
            stream_id: offer_details.stream_id || null,
            fees_category: offer_details.fees_category || null,
            enrollment_status: 'pending_confirmation',
            created_by: context.userId,
          })
          .execute();

        console.log(`[DECISIONS] Auto-created enrollment for offered application ${applicationId}`);
      }
    }

    return decision;
  }

  async getDecisionByApplication(context: UserContext, applicationId: number) {
    return await db
      .selectFrom("application_decisions" as any)
      .selectAll()
      .where("application_id", "=", applicationId)
      .where("school_id", "=", context.schoolId)
      .executeTakeFirst();
  }

  async updateDecisionResponse(context: UserContext, decisionId: number, response: string, responseNotes?: string) {
    return await db
      .updateTable("application_decisions" as any)
      .set({
        applicant_response: response,
        response_date: new Date(),
        response_notes: responseNotes,
      })
      .where("id", "=", decisionId)
      .where("school_id", "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== ENROLLMENTS ====================

  async createEnrollment(context: UserContext, data: any) {
    const { application_id, student_id, grade_id, stream_id, academic_year, fees_category } = data;

    // Create enrollment record
    const enrollment = await db
      .insertInto("enrollments" as any)
      .values({
        school_id: context.schoolId,
        application_id,
        student_id,
        enrollment_date: new Date(),
        academic_year,
        grade_id,
        stream_id,
        fees_category,
        enrollment_status: 'pending_documents',
        created_by: context.userId,
      })
      .returningAll()
      .executeTakeFirst();

    // Update application status to ENROLLED
    await db
      .updateTable("applications" as any)
      .set({
        admission_status_id: await this.getStatusIdByCode(context.schoolId, 'ENROLLED'),
        enrolled_student_id: student_id,
        enrolled_at: new Date(),
      })
      .where("id", "=", application_id)
      .execute();

    // Update decision response to accepted
    await db
      .updateTable("application_decisions" as any)
      .set({
        applicant_response: 'accepted',
        response_date: new Date(),
      })
      .where("application_id", "=", application_id)
      .execute();

    return enrollment;
  }

  async completeEnrollment(context: UserContext, enrollmentId: number, _data?: any) {
    // Delegated to enrollments controller for single source of truth
    throw new Error("Use POST /admissions/enrollments/:id/confirm instead");
  }

  async getEnrollmentByApplication(context: UserContext, applicationId: number) {
    return await db
      .selectFrom("enrollments" as any)
      .selectAll()
      .where("application_id", "=", applicationId)
      .where("school_id", "=", context.schoolId)
      .executeTakeFirst();
  }

  // ==================== HELPERS ====================

  private async getStatusIdByCode(schoolId: number, code: string) {
    const result = await db
      .selectFrom("admission_statuses" as any)
      .select("id")
      .where("school_id", "=", schoolId)
      .where("code", "=", code)
      .where("is_deleted", "=", false)
      .executeTakeFirst();
    
    return result?.id || null;
  }

  async getPipelineStatistics(context: UserContext, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    let query = (db as any)
      .selectFrom("applications")
      .leftJoin("admission_statuses", "applications.admission_status_id", "admission_statuses.id")
      .select([
        "admission_statuses.name as status",
        "admission_statuses.code as status_code",
        (eb: any) => eb.fn.count("applications.id").as("count")
      ])
      .where("applications.school_id", "=", context.schoolId)
      .where("applications.is_deleted", "=", false);

    // Apply date range filters
    if (filters?.startDate) {
      query = query.where("applications.submission_date", ">=", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.where("applications.submission_date", "<=", filters.endDate);
    }

    const stats: any = await query
      .groupBy(["admission_statuses.name", "admission_statuses.code"])
      .execute();

    const total = stats.reduce((sum: number, s: any) => sum + Number(s.count), 0);
    const enrolled = stats.find((s: any) => s.status_code === 'ENROLLED')?.count || 0;
    const rejected = stats.find((s: any) => s.status_code === 'REJECTED')?.count || 0;

    return {
      by_status: stats,
      total_applications: total,
      enrolled: Number(enrolled),
      rejected: Number(rejected),
      conversion_rate: total > 0 ? ((Number(enrolled) / total) * 100).toFixed(1) : 0,
    };
  }

  // ==================== BACKFILL: Create enrollments for existing offered decisions ====================
  async backfillEnrollments(context: UserContext) {
    console.log('[DECISIONS] Backfilling enrollments for offered decisions...');

    // Find all offered decisions without enrollments
    const offeredDecisions = await (db as any)
      .selectFrom("application_decisions as ad")
      .innerJoin("applications as a", "ad.application_id", "a.id")
      .leftJoin("enrollments as e", "a.id", "e.application_id")
      .select([
        "ad.id as decision_id",
        "ad.application_id",
        "ad.offer_details",
        "ad.decision_by",
        "a.id as application_id",
        "a.academic_year",
        "a.applying_for_grade",
        "a.applying_for_stream"
      ])
      .where("ad.decision_type", "=", "offered")
      .where("ad.school_id", "=", context.schoolId)
      .where("e.id", "=", null)
      .execute();

    console.log(`[DECISIONS] Found ${offeredDecisions.length} offered decisions without enrollments`);

    const created = [];
    for (const decision of offeredDecisions) {
      const offerDetails = decision.offer_details ? (typeof decision.offer_details === 'string' ? JSON.parse(decision.offer_details) : decision.offer_details) : {};

      await db
        .insertInto("enrollments" as any)
        .values({
          school_id: context.schoolId,
          application_id: decision.application_id,
          enrollment_date: new Date(),
          academic_year: offerDetails.academic_year || decision.academic_year || new Date().getFullYear().toString(),
          grade_id: offerDetails.grade_id || null,
          stream_id: offerDetails.stream_id || null,
          fees_category: offerDetails.fees_category || null,
          enrollment_status: 'pending_confirmation',
          created_by: decision.decision_by || context.userId,
        })
        .execute();

      created.push(decision.application_id);
      console.log(`[DECISIONS] Created enrollment for application ${decision.application_id}`);
    }

    return { created_count: created.length, application_ids: created };
  }
}

export const decisionsService = new DecisionsService();

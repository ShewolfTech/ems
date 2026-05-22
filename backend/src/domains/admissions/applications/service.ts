// Admissions Service - Applications (Simple, matching enquiries pattern)
import { db } from "../../../config/infra/database.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AdmissionsService {
  // ==================== STATUSES ====================

  async findAllStatuses(context: UserContext) {
    return await db
      .selectFrom("admission_statuses" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .where("is_active" as any, "=", true)
      .orderBy("display_order" as any, "asc")
      .execute();
  }

  // ==================== TYPES ====================

  async findAllTypes(context: UserContext) {
    console.log('[TYPES] Fetching types for school:', context.schoolId);
    const result = await db
      .selectFrom("application_types" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .where("is_active" as any, "=", true)
      .orderBy("name" as any, "asc")
      .execute();
    console.log('[TYPES] Result:', result);
    return result;
  }

  // ==================== APPLICANTS ====================

  async findAllApplicants(context: UserContext, filters?: any) {
    let query = db
      .selectFrom("applicants" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false);

    // Date range filter (created_at)
    if (filters?.startDate) {
      query = query.where("created_at" as any, ">=", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.where("created_at" as any, "<=", filters.endDate);
    }

    if (filters?.search) {
      const search = `%${filters.search}%`;
      query = query.where((eb: any) =>
        eb.or([
          eb("first_name", "ilike", search),
          eb("last_name", "ilike", search),
          eb("email", "ilike", search)
        ])
      );
    }

    const result = await query.execute();

    return {
      data: result,
      pagination: { total: result.length, page: 1, limit: 20, totalPages: 1 },
    };
  }

  async findApplicantById(context: UserContext, id: number | string) {
    return await db
      .selectFrom("applicants" as any)
      .selectAll()
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false)
      .executeTakeFirst();
  }

  async createApplicant(context: UserContext, data: any) {
    console.log('[SERVICE] Creating applicant with data:', data);
    
    const values = {
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name || null,
      email: data.email || null,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      nationality: data.nationality || 'Ugandan',
      address: data.address || null,
      city: data.city || null,
      district: data.district || null,
      guardian_name: data.guardian_name || null,
      guardian_phone: data.guardian_phone || null,
      guardian_email: data.guardian_email || null,
      guardian_relationship: data.guardian_relationship || null,
      previous_school: data.previous_school || null,
      previous_grade: data.previous_grade || null,
      school_id: context.schoolId,
      created_by: context.userId,
    };

    console.log('[SERVICE] Inserting with values:', values);

    try {
      const result = await db
        .insertInto("applicants" as any)
        .values(values)
        .returningAll()
        .executeTakeFirst();
      
      console.log('[SERVICE] Applicant created:', result);
      return result;
    } catch (error: any) {
      console.error('[SERVICE] Error creating applicant:', error.message);
      console.error('[SERVICE] Error details:', error);
      throw error;
    }
  }

  async updateApplicant(context: UserContext, id: number | string, data: any) {
    const values = {
      ...data,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    return await db
      .updateTable("applicants" as any)
      .set(values)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteApplicant(context: UserContext, id: number | string) {
    return await db
      .updateTable("applicants" as any)
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

  // ==================== APPLICATIONS ====================

  async findAllApplications(context: UserContext, filters?: any) {
    let query = (db as any)
      .selectFrom("applications")
      .innerJoin("applicants", "applications.applicant_id", "applicants.id")
      .select([
        "applications.id",
        "applications.applicant_id",
        "applications.application_type_id",
        "applications.admission_status_id",
        "applications.enquiry_id",
        "applications.applying_for_grade",
        "applications.applying_for_stream",
        "applications.academic_year",
        "applications.intended_start_date",
        "applications.application_no",
        "applications.submission_date",
        "applications.review_date",
        "applications.reviewed_by",
        "applications.decision_date",
        "applications.decision_type",
        "applications.decision_notes",
        "applications.enrollment_date",
        "applications.student_id",
        "applications.is_active",
        "applications.created_at",
        "applications.created_by",
        "applications.updated_at",
        "applications.updated_by",
        "applications.is_deleted",
        "applicants.first_name as applicantFirstName",
        "applicants.last_name as applicantLastName",
        "applicants.email as applicantEmail",
        "applicants.phone as applicantPhone"
      ])
      .where("applications.school_id", "=", context.schoolId)
      .where("applications.is_deleted", "=", false);

    // Date range filters
    if (filters?.startDate) {
      query = query.where("applications.submission_date", ">=", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.where("applications.submission_date", "<=", filters.endDate);
    }
    if (filters?.status) {
      query = query.where("applications.admission_status_id", "=", filters.status);
    }

    if (filters?.search) {
      const search = `%${filters.search}%`;
      query = query.where((eb: any) =>
        eb.or([
          eb("applicants.first_name", "ilike", search),
          eb("applicants.last_name", "ilike", search),
          eb("applicants.email", "ilike", search)
        ])
      );
    }

    // Get total count for pagination
    const countQuery = (db as any)
      .selectFrom("applications")
      .innerJoin("applicants", "applications.applicant_id", "applicants.id")
      .where("applications.school_id", "=", context.schoolId)
      .where("applications.is_deleted", "=", false);

    // Apply same filters to count query
    if (filters?.startDate) {
      countQuery.where("applications.submission_date", ">=", filters.startDate);
    }
    if (filters?.endDate) {
      countQuery.where("applications.submission_date", "<=", filters.endDate);
    }
    if (filters?.status) {
      countQuery.where("applications.admission_status_id", "=", filters.status);
    }

    if (filters?.search) {
      const search = `%${filters.search}%`;
      countQuery.where((eb: any) =>
        eb.or([
          eb("applicants.first_name", "ilike", search),
          eb("applicants.last_name", "ilike", search),
          eb("applicants.email", "ilike", search)
        ])
      );
    }

    const totalResult: any = await countQuery
      .select((eb: any) => eb.fn.count("applications.id").as("total"))
      .executeTakeFirst();
    
    const total = Number(totalResult?.total) || 0;
    const page = filters?.page ? parseInt(filters.page) : 1;
    const limit = filters?.limit ? parseInt(filters.limit) : 100;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    query = query.offset((page - 1) * limit).limit(limit);
    
    const result = await query.orderBy("applications.submission_date", "desc").execute();

    return {
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findApplicationById(context: UserContext, id: number | string) {
    return await (db as any)
      .selectFrom("applications")
      .innerJoin("applicants", "applications.applicant_id", "applicants.id")
      .select([
        "applications.id",
        "applications.applicant_id",
        "applications.application_type_id",
        "applications.admission_status_id",
        "applications.enquiry_id",
        "applications.applying_for_grade",
        "applications.applying_for_stream",
        "applications.academic_year",
        "applications.intended_start_date",
        "applications.application_no",
        "applications.submission_date",
        "applications.review_date",
        "applications.reviewed_by",
        "applications.decision_date",
        "applications.decision_notes",
        "applications.enrollment_date",
        "applications.student_id",
        "applications.is_active",
        "applications.created_at",
        "applications.created_by",
        "applications.updated_at",
        "applications.updated_by",
        "applications.is_deleted",
        "applicants.first_name as applicantFirstName",
        "applicants.last_name as applicantLastName",
        "applicants.email as applicantEmail",
        "applicants.phone as applicantPhone",
        "applicants.guardian_name as guardianName",
        "applicants.guardian_phone as guardianPhone"
      ])
      .where("applications.id", "=", Number(id))
      .where("applications.school_id", "=", context.schoolId)
      .where("applications.is_deleted", "=", false)
      .executeTakeFirst();
  }

  async createApplication(context: UserContext, data: any) {
    const values = {
      ...data,
      school_id: context.schoolId,
      created_by: context.userId,
    };

    return await db
      .insertInto("applications" as any)
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  async updateApplication(context: UserContext, id: number | string, data: any) {
    const values = {
      ...data,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    return await db
      .updateTable("applications" as any)
      .set(values)
      .where("id" as any, "=", Number(id))
      .where("school_id" as any, "=", context.schoolId)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteApplication(context: UserContext, id: number | string) {
    return await db
      .updateTable("applications" as any)
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

  async convertEnquiryToApplication(context: UserContext, enquiryId: number, data: any) {
    const values = {
      ...data,
      enquiry_id: enquiryId,
      school_id: context.schoolId,
      created_by: context.userId,
    };

    return await db
      .insertInto("applications" as any)
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  // ==================== STATISTICS ====================

  async getStatistics(context: UserContext, filters?: {
    startDate?: string;
    endDate?: string;
    statusId?: string;
  }) {
    try {
      // Build base query with filters
      let query = (db as any)
        .selectFrom("applications" as any)
        .select((eb: any) => eb.fn.count("id").as("total"))
        .where("school_id" as any, "=", context.schoolId)
        .where("is_deleted" as any, "=", false);

      // Apply date range filter
      if (filters?.startDate) {
        query = query.where("submission_date" as any, ">=", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where("submission_date" as any, "<=", filters.endDate);
      }
      // Apply status filter
      if (filters?.statusId) {
        query = query.where("admission_status_id" as any, "=", Number(filters.statusId));
      }

      const totalResult: any = await query.executeTakeFirst();

      const totalCount = Number(totalResult?.total) || 0;

      // Get counts by status with JOIN to get status codes (with same filters)
      let statusQuery = (db as any)
        .selectFrom("applications")
        .leftJoin("admission_statuses", "applications.admission_status_id", "admission_statuses.id")
        .select([
          "admission_statuses.name as status",
          "admission_statuses.code as status_code",
          (eb: any) => eb.fn.count("applications.id").as("count")
        ])
        .where("applications.school_id", "=", context.schoolId)
        .where("applications.is_deleted", "=", false);

      // Apply same filters to status breakdown
      if (filters?.startDate) {
        statusQuery = statusQuery.where("applications.submission_date", ">=", filters.startDate);
      }
      if (filters?.endDate) {
        statusQuery = statusQuery.where("applications.submission_date", "<=", filters.endDate);
      }

      const statusCounts: any = await statusQuery
        .groupBy(["admission_statuses.name", "admission_statuses.code"])
        .execute();

      // Calculate summary stats
      const stats: any = {
        total: totalCount,
        pending: 0,
        under_review: 0,
        interview_scheduled: 0,
        interviewed: 0,
        offered: 0,
        waitlisted: 0,
        rejected: 0,
        enrolled: 0,
        withdrawn: 0,
        by_status: statusCounts,
      };

      // Map status counts to summary
      statusCounts.forEach((s: any) => {
        const code = s.status_code?.toLowerCase();
        if (code) {
          stats[code] = Number(s.count);
        }
      });

      // Calculate pending (all non-final statuses)
      stats.pending = (stats.applied || 0) + (stats.under_review || 0);

      return stats;
    } catch (error) {
      console.error('ERROR in getStatistics:', error);
      return { total: 0, pending: 0, by_status: [] };
    }
  }

  // ==================== DASHBOARD STATISTICS ====================

  async getDashboardStats(context: UserContext) {
    const schoolId = context.schoolId;

    // Applications by month (last 6 months)
    const appsByMonth: any = await (db as any)
      .selectFrom("applications")
      .select([
        (eb: any) => eb.fn.dateTrunc('month', eb.ref('submission_date')).as('month'),
        (eb: any) => eb.fn.count('id').as('count'),
      ])
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .where("submission_date", ">=", (eb: any) => eb.raw(`NOW() - INTERVAL '6 months'`))
      .groupBy('month')
      .orderBy('month', 'asc')
      .execute();

    // Applications by grade
    const appsByGrade: any = await (db as any)
      .selectFrom("applications")
      .select([
        "applying_for_grade as grade",
        (eb: any) => eb.fn.count('id').as('count'),
      ])
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .where("applying_for_grade", "!=", null)
      .groupBy("applying_for_grade")
      .orderBy("count", "desc")
      .execute();

    // Gender distribution (from applicants)
    const genderByGrade: any = await (db as any)
      .selectFrom("applications")
      .innerJoin("applicants", "applications.applicant_id", "applicants.id")
      .select([
        "applications.applying_for_grade as grade",
        "applicants.gender",
        (eb: any) => eb.fn.count('applicants.id').as('count'),
      ])
      .where("applications.school_id", "=", schoolId)
      .where("applications.is_deleted", "=", false)
      .groupBy(["applications.applying_for_grade", "applicants.gender"])
      .execute();

    // Upcoming interviews count
    const upcomingInterviews: any = await (db as any)
      .selectFrom("interviews")
      .select([
        (eb: any) => eb.fn.count('id').as('count'),
        (eb: any) => eb.fn.count(eb.case().when("scheduled_date", ">=", eb.raw(`NOW()`)).then(1)).as('this_week'),
      ])
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .where("is_completed", "=", false)
      .executeTakeFirst();

    // Enquiries by source
    const enquiriesBySource: any = await (db as any)
      .selectFrom("enquiries")
      .leftJoin("enquiry_sources", "enquiries.enquiry_source_id", "enquiry_sources.id")
      .select([
        "enquiry_sources.name as source",
        (eb: any) => eb.fn.count('enquiries.id').as('count'),
      ])
      .where("enquiries.school_id", "=", schoolId)
      .where("enquiries.is_deleted", "=", false)
      .groupBy("enquiry_sources.name")
      .execute();

    // Conversion funnel
    const funnel: any = await (db as any)
      .selectFrom("enquiries")
      .select([
        (eb: any) => eb.fn.count('enquiries.id').as('enquiries'),
      ])
      .where("enquiries.school_id", "=", schoolId)
      .where("enquiries.is_deleted", "=", false)
      .executeTakeFirst();

    const appsCount: any = await (db as any)
      .selectFrom("applications")
      .select((eb: any) => eb.fn.count('id').as('applications'))
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .executeTakeFirst();

    const enrolledCount: any = await (db as any)
      .selectFrom("enrollments")
      .select((eb: any) => eb.fn.count('id').as('enrolled'))
      .where("school_id", "=", schoolId)
      .where("is_deleted", "=", false)
      .where("enrollment_status", "=", 'completed')
      .executeTakeFirst();

    return {
      applications_by_month: appsByMonth,
      applications_by_grade: appsByGrade,
      gender_by_grade: genderByGrade,
      upcoming_interviews: upcomingInterviews,
      enquiries_by_source: enquiriesBySource,
      funnel: {
        enquiries: Number(funnel?.enquiries || 0),
        applications: Number(appsCount?.applications || 0),
        enrolled: Number(enrolledCount?.enrolled || 0),
      },
    };
  }
}

export const admissionsService = new AdmissionsService();

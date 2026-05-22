import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";
import { AssignmentsSchema, BulkAssignmentSubmissionsSchema } from "./validator.js";
import { AssignmentsType } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AssignmentsService {
  async findAll(context: UserContext, params?: any) {
    try {
      console.log('[AssignmentsService.findAll] Fetching assignments for school:', context.schoolId);
      
      const now = new Date();
      
      const assignments = await db
        .selectFrom("assignments as a")
        .leftJoin("classes as c", "c.id", "a.class_id")
        .leftJoin("subjects as s", "s.id", "a.subject_id")
        .leftJoin("terms as t", "t.id", "a.term_id")
        .select([
          "a.id",
          "a.school_id",
          "a.class_id",
          "a.subject_id",
          "a.term_id",
          "a.title",
          "a.description",
          "a.start_date",
          "a.due_date",
          "a.max_score",
          "a.weight",
          "a.status_id",
          "a.teacher_id",
          "a.is_active",
          "a.created_at",
          "a.updated_at",
          "c.name as class_name",
          "c.code as class_code",
          "s.name as subject_name",
          "s.code as subject_code",
          "t.name as term_name",
        ])
        .where("a.school_id" as any, "=", context.schoolId as any)
        .where("a.is_deleted" as any, "=", false)
        .where((eb) => 
          eb.or([
            eb.and([
              eb("a.is_active" as any, "=", true),
              eb.or([
                eb("a.due_date" as any, ">=", now),
                eb("a.start_date" as any, ">", now)
              ])
            ])
          ])
        )
        .orderBy("a.due_date" as any, "desc")
        .execute();

      console.log('[AssignmentsService.findAll] Found', assignments.length, 'assignments from database');

      // Enrich with submission counts
      const result = await Promise.all(
        assignments.map(async (assignment) => {
          try {
            // Get total students in class
            let totalStudents = 0;
            if (assignment.class_id) {
              const studentsResult = await db
                .selectFrom("class_students as cs")
                .select(sql<number>`COUNT(cs.student_id)`.as("total_students"))
                .where("cs.class_id", "=", assignment.class_id)
                .where("cs.school_id", "=", context.schoolId)
                .where("cs.is_deleted" as any, "=", false)
                .where("cs.is_active", "=", true)
                .executeTakeFirst();

              totalStudents = studentsResult?.total_students || 0;
            }

            // Get submissions count
            const submissionsResult = await db
              .selectFrom("assignment_submissions as asub")
              .select(sql<number>`COUNT(asub.id)`.as("submissions_count"))
              .where("asub.assignment_id", "=", assignment.id)
              .where("asub.school_id", "=", context.schoolId)
              .where("asub.is_deleted" as any, "=", false)
              .executeTakeFirst();

            const submissionsCount = submissionsResult?.submissions_count || 0;

            return {
              ...assignment,
              submissions_count: submissionsCount,
              total_students: totalStudents,
              pending_count: totalStudents - submissionsCount,
              submission_rate: totalStudents > 0 ? (submissionsCount / totalStudents) * 100 : 0,
            };
          } catch (err: any) {
            console.error('[AssignmentsService.findAll] Error enriching assignment:', assignment.id, err.message);
            return {
              ...assignment,
              submissions_count: 0,
              total_students: 0,
              pending_count: 0,
              submission_rate: 0,
            };
          }
        })
      );

      // Apply filters
      let filtered = result;
      if (params?.class_id) {
        filtered = filtered.filter((a: any) => a.class_id === Number(params.class_id));
      }
      if (params?.subject_id) {
        filtered = filtered.filter((a: any) => a.subject_id === Number(params.subject_id));
      }
      if (params?.term_id) {
        filtered = filtered.filter((a: any) => a.term_id === Number(params.term_id));
      }
      if (params?.status === "overdue") {
        filtered = filtered.filter((a: any) => {
          const dueDate = new Date(a.due_date);
          return dueDate < new Date() && a.is_active;
        });
      }
      if (params?.status === "upcoming") {
        filtered = filtered.filter((a: any) => {
          const dueDate = new Date(a.due_date);
          return dueDate >= new Date() && a.is_active;
        });
      }

      console.log('[AssignmentsService.findAll] Returning', filtered.length, 'assignments after filtering');
      return filtered;
    } catch (error: any) {
      console.error('[AssignmentsService.findAll] Error:', error.message);
      console.error('[AssignmentsService.findAll] Stack:', error.stack);
      throw error;
    }
  }

  async findById(context: UserContext, id: number | string) {
    try {
      const assignment = await db
        .selectFrom("assignments as a")
        .leftJoin("classes as c", "c.id", "a.class_id")
        .leftJoin("subjects as s", "s.id", "a.subject_id")
        .leftJoin("terms as t", "t.id", "a.term_id")
        .leftJoin("staff as st", "st.id", "a.teacher_id")
        .leftJoin("users as u", "u.id", "st.user_id")
        .select([
          "a.id",
          "a.school_id",
          "a.class_id",
          "a.subject_id",
          "a.term_id",
          "a.title",
          "a.description",
          "a.due_date",
          "a.max_score",
          "a.weight",
          "a.status_id",
          "a.teacher_id",
          "a.is_active",
          "a.created_at",
          "a.updated_at",
          "c.name as class_name",
          "c.code as class_code",
          "s.name as subject_name",
          "s.code as subject_code",
          "t.name as term_name",
          sql<string>`concat(u.first_name, ' ', u.last_name)`.as("teacher_name"),
        ])
        .where("a.id" as any, "=", id as any)
        .where("a.school_id" as any, "=", context.schoolId as any)
        .where("a.is_deleted" as any, "=", false)
        .executeTakeFirst();

      if (!assignment) return null;

      // Get submissions
      const submissions = await db
        .selectFrom("assignment_submissions as asub")
        .innerJoin("students as s", "s.id", "asub.student_id")
        .select([
          "asub.id",
          "asub.student_id",
          "asub.score",
          "asub.grade_letter",
          "asub.grade_point",
          "asub.remarks",
          "asub.submission_date",
          "asub.graded_by",
          "asub.updated_at as graded_on",
          "asub.status_id",
          "s.first_name",
          "s.last_name",
          "s.admission_no",
        ])
        .where("asub.assignment_id", "=", Number(id))
        .where("asub.school_id", "=", context.schoolId)
        .where("asub.is_deleted" as any, "=", false)
        .orderBy("asub.submission_date" as any, "desc")
        .execute();

      return { ...assignment, submissions };
    } catch (error: any) {
      console.error('[AssignmentsService.findById] Error:', error.message);
      throw error;
    }
  }

  async create(context: UserContext, data: AssignmentsType) {
    const validated = AssignmentsSchema.parse({
      ...data,
      school_id: context.schoolId,
      created_by: context.userId,
      updated_by: context.userId,
    });

    const result = await db
      .insertInto("assignments" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async update(context: UserContext, id: number | string, data: Partial<AssignmentsType>) {
    const validated = AssignmentsSchema.partial().parse(data);

    const updateData: any = {
      ...validated,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    const result = await db
      .updateTable("assignments" as any)
      .set(updateData)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async delete(context: UserContext, id: number | string) {
    return await db
      .updateTable("assignments" as any)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: context.userId,
        updated_at: new Date(),
      } as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async bulkCreateSubmissions(context: UserContext, data: any) {
    // Start a database transaction for atomicity
    const transaction = await db.transaction().execute(async (trx) => {
      // First verify the assignment and get max_score
      const assignment = await trx
        .selectFrom("assignments")
        .select(["id", "school_id", "max_score", "title", "class_id", "is_active", "due_date", "start_date"])
        .where("id", "=", data.assignment_id)
        .where("school_id", "=", context.schoolId)
        .executeTakeFirst();

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      const now = new Date();
      const isWithinDeadline = assignment.due_date && new Date(assignment.due_date) >= now;
      const isBeforeStart = assignment.start_date && new Date(assignment.start_date) > now;
      
      if (!assignment.is_active || (!isWithinDeadline && !isBeforeStart)) {
        throw new Error("Assignment is no longer accepting submissions (expired or inactive)");
      }

      // Validate max_score
      const validated = BulkAssignmentSubmissionsSchema.parse({
        ...data,
        max_score: Number(assignment.max_score),
      });
      const { assignment_id, submissions } = validated;

      let success = 0;
      let failed = 0;
      const changeLog: any[] = [];

      // Process each submission
      for (const submission of submissions) {
        try {
          // Validate score range
          if (submission.score > assignment.max_score) {
            throw new Error(`Score ${submission.score} exceeds max ${assignment.max_score}`);
          }
          if (submission.score < 0) {
            throw new Error(`Score cannot be negative`);
          }

          // Check if active submission already exists
          const existing = await trx
            .selectFrom("assignment_submissions")
            .selectAll()
            .where("assignment_id", "=", assignment_id)
            .where("student_id", "=", submission.student_id)
            .where("school_id", "=", context.schoolId)
            .where("is_deleted" as any, "=", false)
            .executeTakeFirst();

          const submissionData: any = {
            school_id: context.schoolId,
            assignment_id,
            student_id: submission.student_id,
            score: submission.score,
            grade_letter: submission.grade_letter,
            grade_point: submission.grade_point,
            remarks: submission.remarks,
            submission_date: submission.submission_date || new Date(),
            graded_by: context.userId,
            updated_by: context.userId,
          };

          if (existing) {
            // Audit trail: Log the change
            changeLog.push({
              action: "UPDATE",
              student_id: submission.student_id,
              old_score: existing.score,
              new_score: submission.score,
              old_grade: existing.grade_letter,
              new_grade: submission.grade_letter,
              changed_by: context.userId,
              changed_at: new Date(),
            });

            // Soft delete the old record
            await trx
              .updateTable("assignment_submissions" as any)
              .set({
                is_deleted: true,
                deleted_at: new Date(),
                deleted_by: context.userId,
                updated_at: new Date(),
              } as any)
              .where("id", "=", existing.id)
              .execute();

            // Insert new record
            submissionData.created_by = context.userId;
            await trx
              .insertInto("assignment_submissions" as any)
              .values(submissionData)
              .execute();
          } else {
            // New submission
            changeLog.push({
              action: "INSERT",
              student_id: submission.student_id,
              new_score: submission.score,
              new_grade: submission.grade_letter,
              changed_by: context.userId,
              changed_at: new Date(),
            });

            submissionData.created_by = context.userId;
            await trx
              .insertInto("assignment_submissions" as any)
              .values(submissionData)
              .execute();
          }

          success++;
        } catch (err: any) {
          console.error(`Failed to save submission for student ${submission.student_id}:`, err.message);
          failed++;
          // Continue processing other submissions
        }
      }

      // Log the bulk operation summary
      console.log(`[Bulk Submissions] Assignment ${assignment_id}: ${success} succeeded, ${failed} failed`);
      if (changeLog.length > 0) {
        console.log(`[Audit Trail] ${changeLog.length} changes logged`);
      }

      return { success, failed, changeLog };
    });

    return transaction;
  }

  async getAnalytics(context: UserContext, classId: number, termId?: number) {
    try {
      console.log('[AssignmentsService.getAnalytics] Fetching analytics for class:', classId, 'term:', termId);

      // Get all assignments for this class
      let assignmentsQuery = db
        .selectFrom("assignments as a")
        .select([
          "a.id",
          "a.title",
          "a.class_id",
          "a.subject_id",
          "a.term_id",
          "a.due_date",
          "a.max_score",
          "a.is_active",
        ])
        .where("a.class_id", "=", classId)
        .where("a.school_id", "=", context.schoolId)
        .where("a.is_deleted" as any, "=", false);

      if (termId) {
        assignmentsQuery = assignmentsQuery.where("a.term_id", "=", termId);
      }

      const assignments = await assignmentsQuery.orderBy("a.due_date", "asc").execute();

      if (assignments.length === 0) {
        return {
          totalAssignments: 0,
          totalStudents: 0,
          submissionRate: null,
          averageScore: null,
          overdueCount: 0,
          upcomingCount: 0,
          gradeDistribution: [],
          statusDistribution: [],
          trendData: [],
          subjectPerformance: [],
          trend: 'stable',
        };
      }

      // Get all students in class
      const students = await db
        .selectFrom("class_students as cs")
        .innerJoin("students as s", "s.id", "cs.student_id")
        .select(["s.id as student_id", "s.first_name", "s.last_name"])
        .where("cs.class_id", "=", classId)
        .where("cs.school_id", "=", context.schoolId)
        .where("cs.is_deleted" as any, "=", false)
        .where("cs.is_active", "=", true)
        .execute();

      // Get all submissions for these assignments
      const assignmentIds = assignments.map(a => a.id);
      let submissionsQuery = db
        .selectFrom("assignment_submissions as asub")
        .innerJoin("assignments as a", "a.id", "asub.assignment_id")
        .leftJoin("subjects as s", "s.id", "a.subject_id")
        .select([
          "asub.id",
          "asub.assignment_id",
          "asub.student_id",
          "asub.score",
          "asub.grade_letter",
          "asub.grade_point",
          "asub.submission_date",
          "a.title as assignment_title",
          "a.max_score",
          "a.subject_id",
          "s.name as subject_name",
          "a.due_date",
        ])
        .where("asub.assignment_id", "in", assignmentIds)
        .where("asub.school_id", "=", context.schoolId)
        .where("asub.is_deleted" as any, "=", false);

      const submissions = await submissionsQuery.execute();

      // Calculate statistics
      const totalAssignments = assignments.length;
      const totalStudents = students.length;
      const totalPossibleSubmissions = totalAssignments * totalStudents;

      // Calculate submission rate
      const totalSubmissions = submissions.length;
      const submissionRate = totalPossibleSubmissions > 0 ? (totalSubmissions / totalPossibleSubmissions) * 100 : 0;

      // Calculate average scores
      let totalScore = 0;
      let totalPercentage = 0;
      let scoredSubmissions = 0;

      const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
      const statusDistribution: Record<string, number> = { submitted: 0, not_submitted: 0 };

      for (const submission of submissions) {
        if (submission.score !== null && submission.max_score > 0) {
          const percentage = (submission.score / submission.max_score) * 100;
          totalPercentage += percentage;
          scoredSubmissions++;

          // Count grades
          if (submission.grade_letter) {
            const grade = submission.grade_letter.toUpperCase();
            if (grade in gradeDistribution) {
              gradeDistribution[grade]++;
            }
          }
        }
      }

      // Calculate not submitted count
      statusDistribution.not_submitted = totalPossibleSubmissions - totalSubmissions;
      statusDistribution.submitted = totalSubmissions;

      const averageScore = scoredSubmissions > 0 ? totalPercentage / scoredSubmissions : null;

      // Grade distribution with percentages
      const gradeDistributionArray = Object.entries(gradeDistribution).map(([grade, count]) => ({
        grade,
        count,
        percentage: totalStudents > 0 ? (count / totalStudents) * 100 : 0,
      }));

      // Status distribution
      const statusDistributionArray = Object.entries(statusDistribution).map(([status, count]) => ({
        status,
        count,
        percentage: totalPossibleSubmissions > 0 ? (count / totalPossibleSubmissions) * 100 : 0,
      }));

      // Trend data (submission rate per assignment)
      const trendData = assignments.map(assignment => {
        const assignmentSubmissions = submissions.filter(s => s.assignment_id === assignment.id);
        const submissionRate = totalStudents > 0 ? (assignmentSubmissions.length / totalStudents) * 100 : 0;

        let averagePercentage = 0;
        if (assignmentSubmissions.length > 0 && assignment.max_score > 0) {
          const total = assignmentSubmissions.reduce((sum, s) => {
            return sum + (s.score !== null ? (s.score / assignment.max_score) * 100 : 0);
          }, 0);
          averagePercentage = total / assignmentSubmissions.length;
        }

        const isOverdue = new Date(assignment.due_date) < new Date();

        return {
          title: assignment.title,
          date: assignment.due_date,
          submissionRate,
          averageScore: averagePercentage,
          totalSubmissions: assignmentSubmissions.length,
          isOverdue,
        };
      });

      // Subject performance
      const subjectMap: Record<number, any> = {};
      for (const submission of submissions) {
        if (submission.subject_id && submission.score !== null && submission.max_score > 0) {
          if (!subjectMap[submission.subject_id]) {
            subjectMap[submission.subject_id] = {
              subject_id: submission.subject_id,
              subject_name: submission.subject_name,
              totalScore: 0,
              totalSubmissions: 0,
              students: new Set<number>(),
            };
          }
          const percentage = (submission.score / submission.max_score) * 100;
          subjectMap[submission.subject_id].totalScore += percentage;
          subjectMap[submission.subject_id].totalSubmissions++;
          subjectMap[submission.subject_id].students.add(submission.student_id);
        }
      }

      const subjectPerformance = Object.values(subjectMap).map((subj: any) => ({
        ...subj,
        average: subj.totalSubmissions > 0 ? subj.totalScore / subj.totalSubmissions : 0,
        totalStudents: subj.students.size,
        students: undefined, // Remove Set from output
      }));

      // Calculate overdue and upcoming counts
      const overdueCount = assignments.filter(a => new Date(a.due_date) < new Date()).length;
      const upcomingCount = assignments.filter(a => new Date(a.due_date) >= new Date()).length;

      // Determine trend
      let trend = 'stable';
      if (trendData.length >= 2) {
        const recent = trendData.slice(-3);
        const older = trendData.slice(0, 3);
        const recentRate = recent.reduce((sum, t) => sum + t.submissionRate, 0) / recent.length;
        const olderRate = older.reduce((sum, t) => sum + t.submissionRate, 0) / older.length;

        if (recentRate > olderRate + 10) trend = 'improving';
        else if (recentRate < olderRate - 10) trend = 'declining';
      }

      return {
        totalAssignments,
        totalStudents,
        submissionRate,
        averageScore,
        overdueCount,
        upcomingCount,
        gradeDistribution: gradeDistributionArray,
        statusDistribution: statusDistributionArray,
        trendData,
        subjectPerformance,
        trend,
      };
    } catch (error: any) {
      console.error('[AssignmentsService.getAnalytics] Error:', error.message);
      console.error('[AssignmentsService.getAnalytics] Stack:', error.stack);
      throw error;
    }
  }
}

export const assignmentsService = new AssignmentsService();


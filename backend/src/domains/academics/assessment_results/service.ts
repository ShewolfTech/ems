import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";
import { AssessmentResultSchema, BulkGradeEntrySchema } from "./validator.js";
import { AssessmentResultType, BulkGradeEntryInput, BulkGradeResult } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AssessmentResultsService {
  /**
   * Get all results for an assessment with student details
   */
  async findByAssessment(context: UserContext, assessmentId: number) {
    return await db
      .selectFrom("assessment_results as ar")
      .leftJoin("students as s", "s.id", "ar.student_id")
      .select([
        "ar.id",
        "ar.assessment_id",
        "ar.student_id",
        "ar.score",
        "ar.grade_letter",
        "ar.grade_point",
        "ar.remarks",
        "ar.graded_by",
        "ar.is_final",
        "ar.created_at",
        "ar.updated_at",
        sql<string>`concat(s.first_name, ' ', s.last_name)`.as("student_name"),
        "s.first_name as student_first_name",
        "s.last_name as student_last_name",
        "s.admission_no as student_reg_no",
      ])
      .where("ar.assessment_id", "=", assessmentId)
      .where("ar.school_id" as any, "=", context.schoolId as any)
      .where("ar.is_deleted" as any, "=", false)
      .orderBy("student_name" as any, "asc")
      .execute();
  }

  /**
   * Get all results for a student
   */
  async findByStudent(context: UserContext, studentId: number) {
    return await db
      .selectFrom("assessment_results as ar")
      .leftJoin("assessments as a", "a.id", "ar.assessment_id")
      .leftJoin("classes as c", "c.id", "a.class_id")
      .leftJoin("subjects as s", "s.id", "a.subject_id")
      .select([
        "ar.id",
        "ar.assessment_id",
        "ar.student_id",
        "ar.score",
        "ar.grade_letter",
        "ar.grade_point",
        "ar.remarks",
        "ar.is_final",
        "a.title as assessment_title",
        "a.max_score as assessment_max_score",
        "a.date as assessment_date",
        "a.weight",
        "c.name as class_name",
        "s.name as subject_name",
      ])
      .where("ar.student_id", "=", studentId)
      .where("ar.school_id" as any, "=", context.schoolId as any)
      .where("ar.is_deleted" as any, "=", false)
      .orderBy("a.date" as any, "desc")
      .execute();
  }

  /**
   * Bulk grade entry - create/update results for multiple students
   * Uses transaction for atomicity and maintains audit trail
   */
  async bulkGradeEntry(context: UserContext, input: BulkGradeEntryInput): Promise<any> {
    const validated = BulkGradeEntrySchema.parse(input);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      changeLog: [] as any[]
    };

    // Use transaction for atomicity
    await db.transaction().execute(async (trx) => {
      // Get assessment details for validation
      const assessment = await trx
        .selectFrom("assessments")
        .select(["id", "max_score", "title", "class_id"])
        .where("id", "=", validated.assessment_id)
        .where("school_id" as any, "=", context.schoolId as any)
        .executeTakeFirst();

      if (!assessment) {
        throw new Error("Assessment not found");
      }

      // Process each grade entry
      for (const grade of validated.grades) {
        try {
          // Validate score doesn't exceed max
          if (grade.score > Number(assessment.max_score)) {
            throw new Error(`Score ${grade.score} exceeds maximum ${assessment.max_score}`);
          }

          if (grade.score < 0) {
            throw new Error("Score cannot be negative");
          }

          // Compute grade letter and point
          const { grade_letter, grade_point } = this.computeGrade(grade.score, Number(assessment.max_score));

          // Check if result exists
          const existing = await trx
            .selectFrom("assessment_results")
            .selectAll()
            .where("assessment_id", "=", validated.assessment_id)
            .where("student_id", "=", grade.student_id)
            .where("school_id" as any, "=", context.schoolId as any)
            .where("is_deleted" as any, "=", false)
            .executeTakeFirst();

          const resultData: any = {
            school_id: context.schoolId,
            assessment_id: validated.assessment_id,
            student_id: grade.student_id,
            score: grade.score,
            grade_letter,
            grade_point,
            remarks: grade.remarks,
            graded_by: context.userId,
            updated_by: context.userId,
          };

          if (existing) {
            // Audit trail: Log the change
            results.changeLog.push({
              action: "UPDATE",
              student_id: grade.student_id,
              old_score: existing.score,
              new_score: grade.score,
              old_grade: existing.grade_letter,
              new_grade: grade_letter,
              changed_by: context.userId,
              changed_at: new Date(),
            });

            // Soft delete the old record (audit trail preservation)
            await trx
              .updateTable("assessment_results" as any)
              .set({
                is_deleted: true,
                deleted_at: new Date(),
                deleted_by: context.userId,
                updated_at: new Date(),
              } as any)
              .where("id" as any, "=", existing.id)
              .execute();

            // Insert new record
            resultData.is_final = false;
            resultData.created_by = context.userId;

            await trx
              .insertInto("assessment_results" as any)
              .values(resultData)
              .execute();

            results.success++;
          } else {
            // Create new
            resultData.is_final = false;
            resultData.created_by = context.userId;

            await trx
              .insertInto("assessment_results" as any)
              .values(resultData)
              .execute();

            results.success++;
          }
        } catch (err: any) {
          results.failed++;
          results.errors.push({
            student_id: grade.student_id,
            error: err.message || "Validation failed"
          });
        }
      }
    });

    return results;
  }

  /**
   * Compute grade letter and point from score percentage
   * Standard grading scale - can be customized per school later
   */
  private computeGrade(score: number, maxScore: number): { grade_letter: string | null; grade_point: number | null } {
    if (maxScore <= 0) return { grade_letter: null, grade_point: null };

    const percentage = (score / maxScore) * 100;

    let grade_letter: string;
    let grade_point: number;

    if (percentage >= 90) { grade_letter = "A"; grade_point = 4.0; }
    else if (percentage >= 80) { grade_letter = "B"; grade_point = 3.0; }
    else if (percentage >= 70) { grade_letter = "C"; grade_point = 2.0; }
    else if (percentage >= 60) { grade_letter = "D"; grade_point = 1.0; }
    else if (percentage >= 50) { grade_letter = "E"; grade_point = 0.5; }
    else { grade_letter = "F"; grade_point = 0.0; }

    return { grade_letter, grade_point };
  }

  async create(context: UserContext, data: AssessmentResultType) {
    const validated = AssessmentResultSchema.parse({
      ...data,
      school_id: context.schoolId,
    });

    // Compute grade
    const assessment = await db
      .selectFrom("assessments")
      .select("max_score")
      .where("id", "=", validated.assessment_id)
      .executeTakeFirst();

    if (assessment) {
      const { grade_letter, grade_point } = this.computeGrade(
        Number(validated.score),
        Number(assessment.max_score)
      );
      validated.grade_letter = grade_letter;
      validated.grade_point = grade_point;
    }

    return await db
      .insertInto("assessment_results" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<AssessmentResultType>) {
    const existing = await db
      .selectFrom("assessment_results")
      .select(["id", "assessment_id", "is_final"])
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .executeTakeFirst();

    if (!existing) throw new Error("Result not found");
    if (existing.is_final) throw new Error("Cannot update finalized result");

    const updateData: any = {
      ...data,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    // Recompute grade if score changed
    if (data.score !== undefined) {
      const assessment = await db
        .selectFrom("assessments")
        .select("max_score")
        .where("id", "=", existing.assessment_id)
        .executeTakeFirst();

      if (assessment) {
        const { grade_letter, grade_point } = this.computeGrade(
          Number(data.score),
          Number(assessment.max_score)
        );
        updateData.grade_letter = grade_letter;
        updateData.grade_point = grade_point;
      }
    }

    return await db
      .updateTable("assessment_results" as any)
      .set(updateData)
      .where("id" as any, "=", id as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    const existing = await db
      .selectFrom("assessment_results")
      .select("is_final")
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .executeTakeFirst();

    if (!existing) throw new Error("Result not found");
    if (existing.is_final) throw new Error("Cannot delete finalized result");

    return await db
      .updateTable("assessment_results" as any)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: context.userId,
        updated_at: new Date(),
      } as any)
      .where("id" as any, "=", id as any)
      .returningAll()
      .executeTakeFirst();
  }

  async finalize(context: UserContext, id: number | string) {
    return await db
      .updateTable("assessment_results" as any)
      .set({
        is_final: true,
        updated_by: context.userId,
        updated_at: new Date(),
      } as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}

export const assessmentResultsService = new AssessmentResultsService();

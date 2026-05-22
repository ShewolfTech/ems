import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";
import { ExamsSchema, BulkExamResultsSchema } from "./validator.js";
import { ExamsType } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ExamsService {
  async findAll(context: UserContext, params?: any) {
    const exams = await db
      .selectFrom("exams as e")
      .leftJoin("classes as c", "c.id", "e.class_id")
      .leftJoin("subjects as s", "s.id", "e.subject_id")
      .leftJoin("terms as t", "t.id", "e.term_id")
      .leftJoin("exam_conductors as ec", "ec.exam_id", "e.id")
      .leftJoin("staff as st", "st.id", "ec.staff_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "e.id",
        "e.school_id",
        "e.class_id",
        "e.subject_id",
        "e.term_id",
        "e.title",
        "e.description",
        "e.exam_date",
        "e.start_time",
        "e.end_time",
        "e.max_score",
        "e.weight",
        "e.status_id",
        "e.teacher_comments",
        "e.is_active",
        "e.created_at",
        "e.updated_at",
        "c.name as class_name",
        "c.code as class_code",
        "s.name as subject_name",
        "s.code as subject_code",
        "t.name as term_name",
        "st.id as staff_id",
        sql<string>`concat(u.first_name, ' ', u.last_name)`.as("conductor_name"),
        "ec.role as conductor_role",
      ])
      .where("e.school_id" as any, "=", context.schoolId as any)
      .where("e.is_deleted" as any, "=", false)
      .orderBy("e.exam_date" as any, "desc")
      .execute();

    // Group conductors by exam
    const grouped: Record<number, any> = {};
    for (const row of exams) {
      const id = row.id as number;
      if (!grouped[id]) {
        const { conductor_name, conductor_role, staff_id, ...rest } = row as any;
        grouped[id] = { ...rest, conductors: [] };
      }
      if ((row as any).conductor_name) {
        grouped[id].conductors.push({
          staff_id: (row as any).staff_id,
          name: (row as any).conductor_name,
          role: (row as any).conductor_role,
        });
      }
    }

    let result = Object.values(grouped);

    // Add results count to each exam
    for (const exam of result) {
      const countResult = await db
        .selectFrom("exam_results as er")
        .select(sql<number>`COUNT(er.id)`.as("results_count"))
        .where("er.exam_id", "=", exam.id)
        .where("er.is_deleted" as any, "=", false)
        .executeTakeFirst();
      
      exam.resultsCount = countResult?.results_count || 0;
    }

    if (params?.class_id) {
      result = result.filter((a: any) => a.class_id === Number(params.class_id));
    }
    if (params?.subject_id) {
      result = result.filter((a: any) => a.subject_id === Number(params.subject_id));
    }
    if (params?.term_id) {
      result = result.filter((a: any) => a.term_id === Number(params.term_id));
    }

    return result;
  }

  async findById(context: UserContext, id: number | string) {
    const exam = await db
      .selectFrom("exams as e")
      .leftJoin("classes as c", "c.id", "e.class_id")
      .leftJoin("subjects as s", "s.id", "e.subject_id")
      .leftJoin("terms as t", "t.id", "e.term_id")
      .selectAll("e")
      .select([
        "c.name as class_name",
        "s.name as subject_name",
        "t.name as term_name",
      ])
      .where("e.id" as any, "=", id as any)
      .where("e.school_id" as any, "=", context.schoolId as any)
      .where("e.is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!exam) return null;

    // Get conductors
    const conductors = await db
      .selectFrom("exam_conductors as ec")
      .innerJoin("staff as st", "st.id", "ec.staff_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "ec.staff_id",
        "ec.role",
        sql<string>`concat(u.first_name, ' ', u.last_name)`.as("name"),
      ])
      .where("ec.exam_id", "=", Number(id))
      .execute();

    return { ...exam, conductors };
  }

  async create(context: UserContext, data: ExamsType) {
    const validated = ExamsSchema.parse({
      ...data,
      school_id: context.schoolId,
      created_by: context.userId,
      updated_by: context.userId,
    });

    const { conductors, ...examData } = validated;

    // If teacher_id not provided, use the lead conductor
    let teacherId = examData.teacher_id;
    if (!teacherId && conductors && conductors.length > 0) {
      const leadConductor = conductors.find(c => c.role === 'lead') || conductors[0];
      teacherId = leadConductor.staff_id;
    }

    const result = await db
      .insertInto("exams" as any)
      .values({ 
        ...examData, 
        teacher_id: teacherId,
        weight: examData.weight || 1.0 
      } as any)
      .returningAll()
      .executeTakeFirst();

    // Insert conductors
    if (conductors && conductors.length > 0 && result) {
      const conductorRows = conductors.map(c => ({
        exam_id: (result as any).id,
        staff_id: c.staff_id,
        role: c.role || 'invigilator',
        created_by: context.userId,
      }));

      await db
        .insertInto("exam_conductors" as any)
        .values(conductorRows as any)
        .execute();
    }

    return result;
  }

  async update(context: UserContext, id: number | string, data: Partial<ExamsType>) {
    const validated = ExamsSchema.partial().parse(data);
    const { conductors, ...examData } = validated;

    // If teacher_id not provided, use the lead conductor
    let teacherId = examData.teacher_id;
    if (!teacherId && conductors && conductors.length > 0) {
      const leadConductor = conductors.find(c => c.role === 'lead') || conductors[0];
      teacherId = leadConductor.staff_id;
    }

    const updateData: any = {
      ...examData,
      teacher_id: teacherId,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    const result = await db
      .updateTable("exams" as any)
      .set(updateData)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();

    // Update conductors: delete old, insert new
    if (conductors !== undefined && result) {
      await db
        .deleteFrom("exam_conductors")
        .where("exam_id", "=", Number(id))
        .execute();

      if (conductors.length > 0) {
        const conductorRows = conductors.map(c => ({
          exam_id: Number(id),
          staff_id: c.staff_id,
          role: c.role || 'invigilator',
          created_by: context.userId,
        }));

        await db
          .insertInto("exam_conductors" as any)
          .values(conductorRows as any)
          .execute();
      }
    }

    return result;
  }

  async delete(context: UserContext, id: number | string) {
    return await db
      .updateTable("exams" as any)
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

  async bulkCreateResults(context: UserContext, data: any) {
    // Start a database transaction for atomicity
    const transaction = await db.transaction().execute(async (trx) => {
      // First verify the exam and get max_score
      const exam = await trx
        .selectFrom("exams")
        .select(["id", "school_id", "max_score", "title"])
        .where("id", "=", data.exam_id)
        .where("school_id", "=", context.schoolId)
        .executeTakeFirst();

      if (!exam) {
        throw new Error("Exam not found");
      }

      // Validate max_score
      const validated = BulkExamResultsSchema.parse({
        ...data,
        max_score: Number(exam.max_score),
      });
      const { exam_id, results } = validated;

      let success = 0;
      let failed = 0;
      const changeLog: any[] = [];

      // Process each result
      for (const result of results) {
        try {
          // Double-check score range (backend validation)
          if (result.score > exam.max_score) {
            throw new Error(`Score ${result.score} exceeds max ${exam.max_score}`);
          }
          if (result.score < 0) {
            throw new Error(`Score cannot be negative`);
          }

          // Check if active result already exists
          const existing = await trx
            .selectFrom("exam_results")
            .selectAll()
            .where("exam_id", "=", exam_id)
            .where("student_id", "=", result.student_id)
            .where("school_id", "=", context.schoolId)
            .where("is_deleted" as any, "=", false)
            .executeTakeFirst();

          const resultData: any = {
            school_id: context.schoolId,
            exam_id,
            student_id: result.student_id,
            score: result.score,
            grade_letter: result.grade_letter,
            grade_point: result.grade_point,
            remarks: result.remarks,
            is_final: result.is_final || false,
            graded_by: context.userId,
            updated_by: context.userId,
          };

          if (existing) {
            // Audit trail: Log the change
            changeLog.push({
              action: "UPDATE",
              student_id: result.student_id,
              old_score: existing.score,
              new_score: result.score,
              old_grade: existing.grade_letter,
              new_grade: result.grade_letter,
              changed_by: context.userId,
              changed_at: new Date(),
            });

            // Soft delete the old record
            await trx
              .updateTable("exam_results" as any)
              .set({
                is_deleted: true,
                deleted_at: new Date(),
                deleted_by: context.userId,
                updated_at: new Date(),
              } as any)
              .where("id", "=", existing.id)
              .execute();

            // Insert new record
            resultData.created_by = context.userId;
            resultData.updated_by = context.userId;
            await trx
              .insertInto("exam_results" as any)
              .values(resultData)
              .execute();
          } else {
            // New record
            changeLog.push({
              action: "INSERT",
              student_id: result.student_id,
              new_score: result.score,
              new_grade: result.grade_letter,
              changed_by: context.userId,
              changed_at: new Date(),
            });

            resultData.created_by = context.userId;
            await trx
              .insertInto("exam_results" as any)
              .values(resultData)
              .execute();
          }

          success++;
        } catch (err: any) {
          console.error(`Failed to save result for student ${result.student_id}:`, err.message);
          failed++;
          // Continue processing other results (don't rollback for single failures)
        }
      }

      // Log the bulk operation summary
      console.log(`[Bulk Results] Exam ${exam_id}: ${success} succeeded, ${failed} failed`);
      if (changeLog.length > 0) {
        console.log(`[Audit Trail] ${changeLog.length} changes logged`);
      }

      return { success, failed, changeLog };
    });

    return transaction;
  }

  async getAnalytics(context: UserContext, classId: number, termId?: number) {
    // Get all exams for this class
    let examsQuery = db
      .selectFrom("exams as e")
      .select([
        "e.id",
        "e.title",
        "e.class_id",
        "e.subject_id",
        "e.term_id",
        "e.exam_date",
        "e.max_score",
        "e.weight",
      ])
      .where("e.class_id", "=", classId)
      .where("e.school_id", "=", context.schoolId)
      .where("e.is_deleted" as any, "=", false);

    if (termId) {
      examsQuery = examsQuery.where("e.term_id", "=", termId);
    }

    const exams = await examsQuery.orderBy("e.exam_date", "asc").execute();

    if (exams.length === 0) {
      return {
        totalExams: 0,
        totalStudents: 0,
        averageScore: null,
        passRate: null,
        gradeDistribution: [],
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

    // Get all exam results for these exams
    const examIds = exams.map(e => e.id);
    let resultsQuery = db
      .selectFrom("exam_results as er")
      .innerJoin("exams as e", "e.id", "er.exam_id")
      .leftJoin("subjects as s", "s.id", "e.subject_id")
      .select([
        "er.id",
        "er.exam_id",
        "er.student_id",
        "er.score",
        "er.grade_letter",
        "er.grade_point",
        "e.title as exam_title",
        "e.max_score",
        "e.subject_id",
        "s.name as subject_name",
      ])
      .where("er.exam_id", "in", examIds)
      .where("er.school_id", "=", context.schoolId)
      .where("er.is_deleted" as any, "=", false);

    const results = await resultsQuery.execute();

    // Calculate statistics
    const totalExams = exams.length;
    const totalStudents = students.length;

    // Calculate averages and pass rate
    let totalScore = 0;
    let totalPercentage = 0;
    let passCount = 0;
    let scoredResults = 0;

    const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

    for (const result of results) {
      if (result.score !== null && result.max_score > 0) {
        const percentage = (result.score / result.max_score) * 100;
        totalPercentage += percentage;
        scoredResults++;

        if (percentage >= 50) {
          passCount++;
        }

        // Count grades
        if (result.grade_letter) {
          const grade = result.grade_letter.toUpperCase();
          if (grade in gradeDistribution) {
            gradeDistribution[grade]++;
          }
        }
      }
    }

    const averageScore = scoredResults > 0 ? totalPercentage / scoredResults : null;
    const passRate = scoredResults > 0 ? (passCount / scoredResults) * 100 : null;

    // Grade distribution with percentages
    const gradeDistributionArray = Object.entries(gradeDistribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: totalStudents > 0 ? (count / totalStudents) * 100 : 0,
    }));

    // Trend data (average score per exam)
    const trendData = exams.map(exam => {
      const examResults = results.filter(r => r.exam_id === exam.id && r.score !== null);
      let average = 0;
      if (examResults.length > 0 && exam.max_score > 0) {
        const total = examResults.reduce((sum, r) => sum + (r.score / exam.max_score) * 100, 0);
        average = total / examResults.length;
      }
      return {
        title: exam.title,
        date: exam.exam_date,
        average,
        totalStudents: examResults.length,
      };
    });

    // Subject performance
    const subjectMap: Record<number, any> = {};
    for (const result of results) {
      if (result.subject_id && result.score !== null && result.max_score > 0) {
        if (!subjectMap[result.subject_id]) {
          subjectMap[result.subject_id] = {
            subject_id: result.subject_id,
            subject_name: result.subject_name,
            totalScore: 0,
            totalExams: 0,
            students: new Set<number>(),
          };
        }
        const percentage = (result.score / result.max_score) * 100;
        subjectMap[result.subject_id].totalScore += percentage;
        subjectMap[result.subject_id].totalExams++;
        subjectMap[result.subject_id].students.add(result.student_id);
      }
    }

    const subjectPerformance = Object.values(subjectMap).map((subj: any) => ({
      ...subj,
      average: subj.totalExams > 0 ? subj.totalScore / subj.totalExams : 0,
      totalStudents: subj.students.size,
      students: undefined, // Remove Set from output
    }));

    // Determine trend
    let trend = 'stable';
    if (trendData.length >= 2) {
      const recent = trendData.slice(-3).reduce((sum, t) => sum + t.average, 0) / Math.min(3, trendData.length);
      const older = trendData.slice(0, 3).reduce((sum, t) => sum + t.average, 0) / Math.min(3, trendData.length);
      
      if (recent > older + 5) trend = 'improving';
      else if (recent < older - 5) trend = 'declining';
    }

    return {
      totalExams,
      totalStudents,
      averageScore,
      passRate,
      gradeDistribution: gradeDistributionArray,
      trendData,
      subjectPerformance,
      trend,
    };
  }
}

export const examsService = new ExamsService();

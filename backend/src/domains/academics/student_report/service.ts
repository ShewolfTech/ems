import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export interface StudentReportParams {
  student_id?: number;
  class_id?: number;
  term_id?: number;
  academic_year_id?: number;
}

interface SubjectGrade {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  assignments_score: number | null;
  exams_score: number | null;
  overall_score: number | null;
  grade_letter: string | null;
  grade_point: number | null;
}

interface TermReport {
  term_id: number;
  term_name: string;
  term_code: string;
  subjects: SubjectGrade[];
  term_average: number | null;
  term_grade_letter: string | null;
  term_grade_point: number | null;
}

export class StudentReportService {
  async getStudentReport(context: UserContext, params: StudentReportParams) {
    const { student_id, class_id, term_id, academic_year_id } = params;

    console.log('[StudentReport] getStudentReport called:', { student_id, class_id, term_id, academic_year_id });

    if (!student_id) {
      throw new Error("student_id is required");
    }

    // Get student info
    const student = await db
      .selectFrom("students" as any)
      .select(["id", "first_name", "last_name", "admission_no", "gender", "date_of_birth"])
      .where("id" as any, "=", student_id)
      .where("school_id" as any, "=", context.schoolId)
      .executeTakeFirst();

    if (!student) {
      throw new Error("Student not found");
    }

    // Get class info if class_id provided, otherwise find student's class
    let targetClassId = class_id;
    if (!targetClassId) {
      const classStudent = await db
        .selectFrom("class_students" as any)
        .select(["class_id"])
        .where("student_id" as any, "=", student_id)
        .where("school_id" as any, "=", context.schoolId)
        .where("is_active" as any, "=", true)
        .where("is_deleted" as any, "=", false)
        .executeTakeFirst();
      targetClassId = classStudent?.class_id;
    }

    const classInfo = targetClassId ? await db
      .selectFrom("classes" as any)
      .select(["id", "name", "code"])
      .where("id" as any, "=", targetClassId)
      .executeTakeFirst() : null;

    // Get grading configuration
    const gradingConfig = await db
      .selectFrom("grading_configurations" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId)
      .where("is_active" as any, "=", true)
      .executeTakeFirst();

    // Build base query conditions
    const getTerms = async () => {
      let query = db
        .selectFrom("terms" as any)
        .select(["id", "name", "code", "start_date", "end_date"])
        .where("school_id" as any, "=", context.schoolId);
      
      if (academic_year_id) {
        query = query.where("academic_year_id" as any, "=", academic_year_id);
      }
      if (term_id) {
        query = query.where("id" as any, "=", term_id);
      }
      
      return await query.orderBy("start_date" as any, "asc").execute();
    };

    const terms = await getTerms();
    const termReports: TermReport[] = [];

    for (const term of terms) {
      const termSubjects = await this.getTermSubjects(context, student_id, term.id, targetClassId);
      
      const termAverage = this.calculateAverage(termSubjects.map(s => s.overall_score).filter(Boolean) as number[]);
      const { grade_letter, grade_point } = this.calculateGrade(termAverage, gradingConfig);

      termReports.push({
        term_id: term.id,
        term_name: term.name,
        term_code: term.code,
        subjects: termSubjects,
        term_average: termAverage,
        term_grade_letter: grade_letter,
        term_grade_point: grade_point,
      });
    }

    // Calculate overall average across all terms
    const allScores = termReports.flatMap(t => t.subjects.map(s => s.overall_score).filter(Boolean));
    const overallAverage = this.calculateAverage(allScores);
    const { grade_letter: overallGrade, grade_point: overallGPA } = this.calculateGrade(overallAverage, gradingConfig);

    // Get class ranking
    const ranking = await this.getClassRanking(context, targetClassId, student_id, academic_year_id);
    const totalStudents = ranking.totalStudents;
    const classPosition = ranking.position;

    // Calculate attendance for the period
    const attendance = await this.getStudentAttendance(context, student_id, terms);

    return {
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        admission_no: student.admission_no,
        gender: student.gender,
        date_of_birth: student.date_of_birth,
      },
      class: classInfo,
      academic_year: academic_year_id ? await this.getAcademicYear(context, academic_year_id) : null,
      terms: termReports,
      overall: {
        average: overallAverage,
        grade_letter: overallGrade,
        grade_point: overallGPA,
        total_subjects: allScores.length,
        total_terms: terms.length,
      },
      ranking: {
        position: classPosition,
        total_students: totalStudents,
        percentile: totalStudents > 0 ? Math.round(((totalStudents - classPosition) / totalStudents) * 100) : 0,
      },
      attendance,
      grading_scale: gradingConfig ? this.getGradingScale(gradingConfig) : null,
    };
  }

  private async getTermSubjects(context: UserContext, studentId: number, termId: number, classId?: number) {
    // Get subjects for the class/term
    let subjects: any[] = [];
    
    if (classId) {
      subjects = await db
        .selectFrom("subjects as s")
        .leftJoin("class_subjects as cs", "cs.subject_id", "s.id")
        .select(["s.id", "s.name", "s.code"])
        .where("cs.class_id" as any, "=", classId)
        .where("s.school_id" as any, "=", context.schoolId)
        .where("s.is_deleted" as any, "=", false)
        .execute();
    } else {
      subjects = await db
        .selectFrom("subjects" as any)
        .select(["id", "name", "code"])
        .where("school_id" as any, "=", context.schoolId)
        .where("is_deleted" as any, "=", false)
        .execute();
    }

    const subjectGrades: SubjectGrade[] = [];

    for (const subject of subjects) {
      // Get assignment submissions for this student/subject/term
      const assignments = await db
        .selectFrom("assignment_submissions as asub")
        .innerJoin("assignments as a", "a.id", "asub.assignment_id")
        .select([
          sql<number>`SUM(asub.score)`.as("total_score"),
          sql<number>`COUNT(asub.id)`.as("count"),
          sql<number>`MAX(a.max_score)`.as("max_score"),
        ])
        .where("asub.student_id" as any, "=", studentId)
        .where("a.subject_id" as any, "=", subject.id)
        .where("a.term_id" as any, "=", termId)
        .where("asub.school_id" as any, "=", context.schoolId)
        .where("asub.is_deleted" as any, "=", false)
        .executeTakeFirst();

      // Get exam results for this student/subject/term
      const exams = await db
        .selectFrom("exam_results as er")
        .innerJoin("exams as e", "e.id", "er.exam_id")
        .select([
          sql<number>`SUM(er.score)`.as("total_score"),
          sql<number>`COUNT(er.id)`.as("count"),
          sql<number>`MAX(e.max_score)`.as("max_score"),
        ])
        .where("er.student_id" as any, "=", studentId)
        .where("e.subject_id" as any, "=", subject.id)
        .where("e.term_id" as any, "=", termId)
        .where("er.school_id" as any, "=", context.schoolId)
        .where("er.is_deleted" as any, "=", false)
        .executeTakeFirst();

      // Calculate scores as percentage
      const assignmentsScore = assignments?.total_score && assignments?.max_score
        ? (Number(assignments.total_score) / Number(assignments.max_score)) * 100
        : null;
      
      const examsScore = exams?.total_score && exams?.max_score
        ? (Number(exams.total_score) / Number(exams.max_score)) * 100
        : null;

      // Calculate overall (weighted by config or 50/50)
      let overallScore: number | null = null;
      if (assignmentsScore !== null && examsScore !== null) {
        const assignmentsWeight = 0.3; // 30% for assignments
        const examsWeight = 0.7; // 70% for exams
        overallScore = (assignmentsScore * assignmentsWeight) + (examsScore * examsWeight);
      } else if (assignmentsScore !== null) {
        overallScore = assignmentsScore;
      } else if (examsScore !== null) {
        overallScore = examsScore;
      }

      subjectGrades.push({
        subject_id: subject.id,
        subject_name: subject.name,
        subject_code: subject.code,
        assignments_score: assignmentsScore,
        exams_score: examsScore,
        overall_score: overallScore,
        grade_letter: overallScore !== null ? this.getGradeLetter(overallScore) : null,
        grade_point: overallScore !== null ? this.getGradePoint(overallScore) : null,
      });
    }

    return subjectGrades;
  }

  private async getClassRanking(context: UserContext, classId: number | undefined, studentId: number, academicYearId?: number) {
    if (!classId) {
      return { position: 0, totalStudents: 0 };
    }

    // Get all students in class with their averages
    const studentAverages = await db
      .selectFrom("class_students as cs")
      .leftJoin("students as st", "st.id", "cs.student_id")
      .select([
        "cs.student_id as id",
        sql<number>`0`.as("average"), // Placeholder - would need complex aggregation
      ])
      .where("cs.class_id" as any, "=", classId)
      .where("cs.school_id" as any, "=", context.schoolId)
      .where("cs.is_active" as any, "=", true)
      .where("cs.is_deleted" as any, "=", false)
      .execute();

    // Simple ranking - find position of student
    const totalStudents = studentAverages.length;
    const position = studentAverages.findIndex(s => s.id === studentId) + 1;

    return { position, totalStudents };
  }

  private async getStudentAttendance(context: UserContext, studentId: number, terms: any[]) {
    // Get attendance records for the student across all terms
    const startDate = terms[0]?.start_date;
    const endDate = terms[terms.length - 1]?.end_date;

    if (!startDate || !endDate) {
      return { present: 0, absent: 0, total: 0, percentage: 100 };
    }

    const attendance = await db
      .selectFrom("attendances as a")
      .select([
        sql<number>`SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)`.as("present"),
        sql<number>`SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END)`.as("absent"),
        sql<number>`COUNT(*)`.as("total"),
      ])
      .where("a.student_id" as any, "=", studentId)
      .where("a.school_id" as any, "=", context.schoolId)
      .where("a.attendance_date" as any, ">=", startDate)
      .where("a.attendance_date" as any, "<=", endDate)
      .executeTakeFirst();

    const present = Number(attendance?.present || 0);
    const total = Number(attendance?.total || 0);
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      present,
      absent: Number(attendance?.absent || 0),
      total,
      percentage,
    };
  }

  private async getAcademicYear(context: UserContext, academicYearId: number) {
    return await db
      .selectFrom("academic_years" as any)
      .select(["id", "name", "code", "start_date", "end_date"])
      .where("id" as any, "=", academicYearId)
      .executeTakeFirst();
  }

  private calculateAverage(scores: number[]): number | null {
    if (scores.length === 0) return null;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 100) / 100;
  }

  private calculateGrade(score: number | null, config: any | null): { grade_letter: string | null; grade_point: number | null } {
    if (score === null) return { grade_letter: null, grade_point: null };

    // Default grading scale if no config
    const gradeScale = config ? {
      a_cutoff: config.a_cutoff || 80,
      b_cutoff: config.b_cutoff || 70,
      c_cutoff: config.c_cutoff || 60,
      d_cutoff: config.d_cutoff || 50,
    } : { a_cutoff: 80, b_cutoff: 70, c_cutoff: 60, d_cutoff: 50 };

    if (score >= gradeScale.a_cutoff) return { grade_letter: "A", grade_point: 4.0 };
    if (score >= gradeScale.b_cutoff) return { grade_letter: "B", grade_point: 3.0 };
    if (score >= gradeScale.c_cutoff) return { grade_letter: "C", grade_point: 2.0 };
    if (score >= gradeScale.d_cutoff) return { grade_letter: "D", grade_point: 1.0 };
    return { grade_letter: "F", grade_point: 0.0 };
  }

  private getGradeLetter(score: number): string {
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  }

  private getGradePoint(score: number): number {
    if (score >= 80) return 4.0;
    if (score >= 70) return 3.0;
    if (score >= 60) return 2.0;
    if (score >= 50) return 1.0;
    return 0.0;
  }

  private getGradingScale(config: any) {
    return {
      a: { min: config.a_cutoff || 80, max: 100, grade: "A", point: 4.0, description: "Excellent" },
      b: { min: config.b_cutoff || 70, max: (config.a_cutoff || 80) - 1, grade: "B", point: 3.0, description: "Very Good" },
      c: { min: config.c_cutoff || 60, max: (config.b_cutoff || 70) - 1, grade: "C", point: 2.0, description: "Good" },
      d: { min: config.d_cutoff || 50, max: (config.c_cutoff || 60) - 1, grade: "D", point: 1.0, description: "Pass" },
      f: { min: 0, max: (config.d_cutoff || 50) - 1, grade: "F", point: 0.0, description: "Fail" },
    };
  }

  // Get list of students for report selection
  async getStudentsForReport(context: UserContext, params: { class_id?: number; search?: string }) {
    let query = db
      .selectFrom("students" as any)
      .select(["id", "first_name", "last_name"])
      .select([
        sql<string>`cast("admission_no" as text)`.as("registration_number")
      ])
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false);

    if (params.class_id) {
      const studentIds = await db
        .selectFrom("class_students" as any)
        .select(["student_id"])
        .where("class_id" as any, "=", params.class_id)
        .where("school_id" as any, "=", context.schoolId)
        .where("is_active" as any, "=", true)
        .where("is_deleted" as any, "=", false)
        .execute();
      
      const ids = studentIds.map(s => s.student_id);
      if (ids.length > 0) {
        query = query.where("id" as any, "in", ids);
      } else {
        // No students in this class, return empty
        return [];
      }
    }

    if (params.search) {
      const searchVal = `%${params.search}%`;
      // Use raw SQL expression for admission_no since it's BIGINT
      query = query.where(sql`cast("admission_no" as text) ilike ${searchVal}`);
      // Also filter by first/last name
      query = query.where((eb) =>
        eb.or([
          eb("first_name" as any, "ilike", searchVal),
          eb("last_name" as any, "ilike", searchVal),
        ])
      );
    }

    return await query.limit(50).execute();
  }

  // Get classes for report selection
  async getClassesForReport(context: UserContext) {
    console.log("getClassesForReport called with schoolId:", context.schoolId);
    return await db
      .selectFrom("classes" as any)
      .select(["id", "name", "code"])
      .where("school_id" as any, "=", context.schoolId)
      .execute();
  }

  // Get academic years for report selection
  async getAcademicYearsForReport(context: UserContext) {
    console.log("getAcademicYearsForReport called with schoolId:", context.schoolId);
    return await db
      .selectFrom("academic_years" as any)
      .select(["id", "name", "code"])
      .where("school_id" as any, "=", context.schoolId)
      .execute();
  }

  // Get terms for report selection
  async getTermsForReport(context: UserContext, academicYearId?: number) {
    let query = db
      .selectFrom("terms" as any)
      .select(["id", "name", "code"])
      .where("school_id" as any, "=", context.schoolId)
      .where("is_deleted" as any, "=", false);

    if (academicYearId) {
      query = query.where("academic_year_id" as any, "=", academicYearId);
    }

    return await query.orderBy("start_date" as any, "asc").execute();
  }
}

export const studentreportService = new StudentReportService();
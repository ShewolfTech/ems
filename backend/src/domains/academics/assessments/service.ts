import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";
import { AssessmentsSchema } from "./validator.js";
import { AssessmentsType } from "./types.js";

export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AssessmentsService {
  async findAll(context: UserContext, params?: any) {
    const assessments = await db
      .selectFrom("assessments as a")
      .leftJoin("classes as c", "c.id", "a.class_id")
      .leftJoin("subjects as s", "s.id", "a.subject_id")
      .leftJoin("terms as t", "t.id", "a.term_id")
      .leftJoin("assessment_conductors as ac", "ac.assessment_id", "a.id")
      .leftJoin("staff as st", "st.id", "ac.staff_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "a.id",
        "a.school_id",
        "a.class_id",
        "a.subject_id",
        "a.term_id",
        "a.assessment_type_id",
        "a.title",
        "a.description",
        "a.max_score",
        "a.weight",
        "a.date",
        "a.status_id",
        "a.teacher_comments",
        "a.is_active",
        "a.created_at",
        "a.updated_at",
        "c.name as class_name",
        "c.code as class_code",
        "s.name as subject_name",
        "s.code as subject_code",
        "t.name as term_name",
        "st.id as staff_id",
        sql<string>`concat(u.first_name, ' ', u.last_name)`.as("conductor_name"),
        "ac.role as conductor_role",
      ])
      .where("a.school_id" as any, "=", context.schoolId as any)
      .where("a.is_deleted" as any, "=", false)
      .orderBy("a.date" as any, "desc")
      .execute();

    // Group conductors by assessment
    const grouped: Record<number, any> = {};
    for (const row of assessments) {
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

    if (params?.class_id) {
      result = result.filter((a: any) => a.class_id === Number(params.class_id));
    }
    if (params?.subject_id) {
      result = result.filter((a: any) => a.subject_id === Number(params.subject_id));
    }
    if (params?.term_id) {
      result = result.filter((a: any) => a.term_id === Number(params.term_id));
    }

    // Add stats
    for (const assessment of result) {
      const stats = await db
        .selectFrom("assessment_results as ar")
        .select([
          sql<number>`COUNT(ar.id)`.as("total_results"),
          sql<number>`AVG(ar.score)`.as("average_score"),
          sql<number>`MAX(ar.score)`.as("highest_score"),
          sql<number>`MIN(ar.score)`.as("lowest_score"),
        ])
        .where("ar.assessment_id", "=", assessment.id)
        .where("ar.is_deleted" as any, "=", false)
        .executeTakeFirst();

      Object.assign(assessment, stats);
    }

    return result;
  }

  async findById(context: UserContext, id: number | string) {
    const assessment = await db
      .selectFrom("assessments as a")
      .leftJoin("classes as c", "c.id", "a.class_id")
      .leftJoin("subjects as s", "s.id", "a.subject_id")
      .leftJoin("terms as t", "t.id", "a.term_id")
      .selectAll("a")
      .select([
        "c.name as class_name",
        "s.name as subject_name",
        "t.name as term_name",
      ])
      .where("a.id" as any, "=", id as any)
      .where("a.school_id" as any, "=", context.schoolId as any)
      .where("a.is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!assessment) return null;

    // Get conductors
    const conductors = await db
      .selectFrom("assessment_conductors as ac")
      .innerJoin("staff as st", "st.id", "ac.staff_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "ac.staff_id",
        "ac.role",
        sql<string>`concat(u.first_name, ' ', u.last_name)`.as("name"),
      ])
      .where("ac.assessment_id", "=", Number(id))
      .execute();

    return { ...assessment, conductors };
  }

  async create(context: UserContext, data: AssessmentsType) {
    const validated = AssessmentsSchema.parse({
      ...data,
      school_id: context.schoolId,
      created_by: context.userId,
      updated_by: context.userId,
    });

    const { conductors, ...assessmentData } = validated;

    const result = await db
      .insertInto("assessments" as any)
      .values(assessmentData as any)
      .returningAll()
      .executeTakeFirst();

    // Insert conductors
    if (conductors && conductors.length > 0 && result) {
      const conductorRows = conductors.map(c => ({
        assessment_id: (result as any).id,
        staff_id: c.staff_id,
        role: c.role || 'invigilator',
        created_by: context.userId,
      }));

      await db
        .insertInto("assessment_conductors" as any)
        .values(conductorRows as any)
        .execute();
    }

    return result;
  }

  async update(context: UserContext, id: number | string, data: Partial<AssessmentsType>) {
    const validated = AssessmentsSchema.partial().parse(data);
    const { conductors, ...assessmentData } = validated;

    const updateData: any = {
      ...assessmentData,
      updated_by: context.userId,
      updated_at: new Date(),
    };

    const result = await db
      .updateTable("assessments" as any)
      .set(updateData)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();

    // Update conductors: delete old, insert new
    if (conductors !== undefined && result) {
      await db
        .deleteFrom("assessment_conductors")
        .where("assessment_id", "=", Number(id))
        .execute();

      if (conductors.length > 0) {
        const conductorRows = conductors.map(c => ({
          assessment_id: Number(id),
          staff_id: c.staff_id,
          role: c.role || 'invigilator',
          created_by: context.userId,
        }));

        await db
          .insertInto("assessment_conductors" as any)
          .values(conductorRows as any)
          .execute();
      }
    }

    return result;
  }

  async delete(context: UserContext, id: number | string) {
    return await db
      .updateTable("assessments" as any)
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

  async getUnifiedGradeBook(context: UserContext, classId: number, termId?: number, studentId?: number, itemType?: string, dateFrom?: string, dateTo?: string) {
    // 1. Get ALL students in this class (never filter the data — filtering is for display only)
    let studentsQuery = db
      .selectFrom("class_students as cs")
      .innerJoin("students as s", "s.id", "cs.student_id")
      .select([
        "s.id as student_id",
        "s.first_name",
        "s.last_name",
        "s.admission_no",
      ])
      .where("cs.class_id", "=", classId)
      .where("cs.school_id" as any, "=", context.schoolId as any)
      .where("cs.is_deleted" as any, "=", false)
      .where("cs.is_active" as any, "=", true);

    // Don't filter students by studentId — we need all students for chart comparisons
    // The studentId filter will be applied client-side for display purposes

    const students = await studentsQuery
      .orderBy("s.last_name" as any, "asc")
      .execute();

    if (students.length === 0) {
      return { gradedItems: [], students: [], stats: { totalStudents: 0, totalItems: 0, classAverage: null } };
    }

    const studentIds = students.map(s => s.student_id);

    // 2. Get all graded items (assessments + exams + assignments)
    let gradedItems: any[] = [];

    // Assessments
    let assessmentsQuery = db
      .selectFrom("assessments as a")
      .select([
        sql<string>`'assessment'`.as("item_type"),
        "a.id as item_id",
        "a.title as item_title",
        "a.subject_id",
        "a.date as item_date",
        "a.max_score",
        "a.weight",
      ])
      .where("a.class_id", "=", classId)
      .where("a.school_id" as any, "=", context.schoolId as any)
      .where("a.is_deleted" as any, "=", false);

    if (termId) assessmentsQuery = assessmentsQuery.where("a.term_id", "=", termId);
    if (dateFrom) assessmentsQuery = assessmentsQuery.where("a.date" as any, ">=", dateFrom);
    if (dateTo) assessmentsQuery = assessmentsQuery.where("a.date" as any, "<=", dateTo);

    const assessments = await assessmentsQuery.execute();

    // Exams
    let examsQuery = db
      .selectFrom("exams as e")
      .select([
        sql<string>`'exam'`.as("item_type"),
        "e.id as item_id",
        "e.title as item_title",
        "e.subject_id",
        "e.exam_date as item_date",
        "e.max_score",
        sql<number>`1`.as("weight"),
      ])
      .where("e.class_id", "=", classId)
      .where("e.school_id" as any, "=", context.schoolId as any)
      .where("e.is_deleted" as any, "=", false);

    if (termId) examsQuery = examsQuery.where("e.term_id", "=", termId);
    if (dateFrom) examsQuery = examsQuery.where("e.exam_date" as any, ">=", dateFrom);
    if (dateTo) examsQuery = examsQuery.where("e.exam_date" as any, "<=", dateTo);

    const exams = await examsQuery.execute();

    // Assignments
    let assignmentsQuery = db
      .selectFrom("assignments as asgn")
      .select([
        sql<string>`'assignment'`.as("item_type"),
        "asgn.id as item_id",
        "asgn.title as item_title",
        "asgn.subject_id",
        "asgn.due_date as item_date",
        "asgn.max_score",
        sql<number>`1`.as("weight"),
      ])
      .where("asgn.class_id", "=", classId)
      .where("asgn.school_id" as any, "=", context.schoolId as any)
      .where("asgn.is_deleted" as any, "=", false);

    if (termId) assignmentsQuery = assignmentsQuery.where("asgn.term_id", "=", termId);
    if (dateFrom) assignmentsQuery = assignmentsQuery.where("asgn.due_date" as any, ">=", dateFrom);
    if (dateTo) assignmentsQuery = assignmentsQuery.where("asgn.due_date" as any, "<=", dateTo);

    const assignments = await assignmentsQuery.execute();

    // Merge all graded items
    gradedItems = [...assessments, ...exams, ...assignments]
      .filter(item => {
        if (!itemType) return true;
        return item.item_type === itemType;
      })
      .sort((a, b) => (a.item_date < b.item_date ? -1 : 1));

    // 3. Get all results for each item type
    const itemIds = {
      assessment: gradedItems.filter(i => i.item_type === 'assessment').map(i => i.item_id),
      exam: gradedItems.filter(i => i.item_type === 'exam').map(i => i.item_id),
      assignment: gradedItems.filter(i => i.item_type === 'assignment').map(i => i.item_id),
    };

    // Assessment results
    let assessmentResults: any[] = [];
    if (itemIds.assessment.length > 0) {
      assessmentResults = await db
        .selectFrom("assessment_results as ar")
        .select(["ar.assessment_id as item_id", "ar.student_id", "ar.score", "ar.grade_letter", "ar.grade_point"])
        .where("ar.assessment_id", "in", itemIds.assessment)
        .where("ar.student_id", "in", studentIds)
        .where("ar.is_deleted" as any, "=", false)
        .execute();
    }

    // Exam results
    let examResults: any[] = [];
    if (itemIds.exam.length > 0) {
      examResults = await db
        .selectFrom("exam_results as er")
        .select(["er.exam_id as item_id", "er.student_id", "er.score", "er.grade_letter", "er.grade_point"])
        .where("er.exam_id", "in", itemIds.exam)
        .where("er.student_id", "in", studentIds)
        .where("er.is_deleted" as any, "=", false)
        .execute();
    }

    // Assignment submissions
    let assignmentResults: any[] = [];
    if (itemIds.assignment.length > 0) {
      assignmentResults = await db
        .selectFrom("assignment_submissions as asub")
        .select(["asub.assignment_id as item_id", "asub.student_id", "asub.score", "asub.grade_letter", "asub.grade_point"])
        .where("asub.assignment_id", "in", itemIds.assignment)
        .where("asub.student_id", "in", studentIds)
        .where("asub.is_deleted" as any, "=", false)
        .execute();
    }

    // Merge all results by item type
    const resultsByItem: Record<string, Record<number, any>> = {};
    for (const r of assessmentResults) {
      const key = `assessment_${r.item_id}`;
      if (!resultsByItem[key]) resultsByItem[key] = {};
      resultsByItem[key][r.student_id] = r;
    }
    for (const r of examResults) {
      const key = `exam_${r.item_id}`;
      if (!resultsByItem[key]) resultsByItem[key] = {};
      resultsByItem[key][r.student_id] = r;
    }
    for (const r of assignmentResults) {
      const key = `assignment_${r.item_id}`;
      if (!resultsByItem[key]) resultsByItem[key] = {};
      resultsByItem[key][r.student_id] = r;
    }

    // 4. Build student rows
    const studentRows = students.map(student => {
      const row: any = {
        student_id: student.student_id,
        student_name: `${student.first_name} ${student.last_name}`,
        admission_no: student.admission_no,
        items: {},
      };

      for (const item of gradedItems) {
        const key = `${item.item_type}_${item.item_id}`;
        const result = resultsByItem[key]?.[student.student_id];
        if (result) {
          row.items[key] = {
            score: Number(result.score),
            max_score: Number(item.max_score),
            grade_letter: result.grade_letter,
            grade_point: result.grade_point ? Number(result.grade_point) : null,
            percentage: Number(item.max_score) > 0 ? (Number(result.score) / Number(item.max_score)) * 100 : 0,
          };
        }
      }

      return row;
    });

    // 5. Calculate class stats
    let totalScores = 0, totalCount = 0;
    for (const student of studentRows) {
      for (const itemId of Object.keys(student.items)) {
        const item = student.items[itemId];
        if (item.percentage !== null && item.percentage !== undefined) {
          totalScores += item.percentage;
          totalCount++;
        }
      }
    }

    return {
      gradedItems: gradedItems.map(item => ({
        item_type: item.item_type,
        item_id: item.item_id,
        item_title: item.item_title,
        subject_id: item.subject_id,
        item_date: item.item_date,
        max_score: Number(item.max_score),
        weight: Number(item.weight),
      })),
      students: studentRows,
      stats: {
        totalStudents: students.length,
        totalItems: gradedItems.length,
        classAverage: totalCount > 0 ? totalScores / totalCount : null,
      },
    };
  }

  async getGradeBook(context: UserContext, classId: number, termId?: number) {
    // Get all assessments for this class/term
    let assessmentsQuery = db
      .selectFrom("assessments as a")
      .select(["a.id", "a.title", "a.max_score", "a.date", "a.weight"])
      .where("a.class_id", "=", classId)
      .where("a.school_id" as any, "=", context.schoolId as any)
      .where("a.is_deleted" as any, "=", false)
      .orderBy("a.date" as any, "asc");

    if (termId) {
      assessmentsQuery = assessmentsQuery.where("a.term_id", "=", termId);
    }

    const assessments = await assessmentsQuery.execute();

    // Get all students in this class
    const students = await db
      .selectFrom("class_students as cs")
      .innerJoin("students as s", "s.id", "cs.student_id")
      .select([
        "s.id as student_id",
        "s.first_name",
        "s.last_name",
        "s.admission_no",
      ])
      .where("cs.class_id", "=", classId)
      .where("cs.school_id" as any, "=", context.schoolId as any)
      .where("cs.is_deleted" as any, "=", false)
      .where("cs.is_active" as any, "=", true)
      .orderBy("s.last_name" as any, "asc")
      .execute();

    // Get all results for these assessments
    const assessmentIds = assessments.map(a => a.id);
    let results: any[] = [];
    if (assessmentIds.length > 0) {
      results = await db
        .selectFrom("assessment_results as ar")
        .select(["ar.assessment_id", "ar.student_id", "ar.score", "ar.grade_letter", "ar.grade_point"])
        .where("ar.assessment_id", "in", assessmentIds)
        .where("ar.school_id" as any, "=", context.schoolId as any)
        .where("ar.is_deleted" as any, "=", false)
        .execute();
    }

    // Build grade book matrix
    const gradeBook = students.map(student => {
      const row: any = {
        student_id: student.student_id,
        student_name: `${student.first_name} ${student.last_name}`,
        admission_no: student.admission_no,
        assessments: {},
      };

      for (const assessment of assessments) {
        const result = results.find(
          r => r.assessment_id === assessment.id && r.student_id === student.student_id
        );
        row.assessments[assessment.id] = result ? {
          score: Number(result.score),
          grade_letter: result.grade_letter,
          grade_point: result.grade_point ? Number(result.grade_point) : null,
          max_score: Number(assessment.max_score),
          weight: Number(assessment.weight),
          percentage: Number(assessment.max_score) > 0 ? (Number(result.score) / Number(assessment.max_score)) * 100 : 0,
        } : null;
      }

      return row;
    });

    return {
      assessments: assessments.map(a => ({
        id: a.id,
        title: a.title,
        subject_id: (a as any).subject_id,
        max_score: Number(a.max_score),
        date: a.date,
        weight: Number(a.weight),
      })),
      students: gradeBook,
    };
  }

  async getStudentReport(context: UserContext, studentId: number, params?: { academic_year_id?: number; term_id?: number; include_all_terms?: boolean }) {
    const { academic_year_id, term_id, include_all_terms } = params || {};

    console.log('[getStudentReport] Called with:', { studentId, academic_year_id, term_id, include_all_terms });

    // Get student info with more details
    const student = await db
      .selectFrom("students as s")
      .leftJoin("class_students as cs", (join) => join
        .onRef("cs.student_id", "=", "s.id")
        .on("cs.is_deleted", "=", false)
      )
      .leftJoin("classes as c", "c.id", "cs.class_id")
      .select([
        "s.id as student_id",
        "s.first_name",
        "s.last_name",
        "s.admission_no",
        "s.date_of_birth",
        "s.gender",
        "c.name as class_name",
        "c.id as class_id",
      ])
      .where("s.id", "=", studentId)
      .where("s.school_id" as any, "=", context.schoolId as any)
      .where("s.is_deleted" as any, "=", false)
      .executeTakeFirst();

    if (!student) throw new Error("Student not found");

    const classId = (student as any).class_id;
    if (!classId) return { student: { ...student, class_name: "Unassigned" }, subjects: [] };

    // Get subjects for this class
    const subjects = await db
      .selectFrom("class_teachers as ct")
      .innerJoin("subjects as s", "s.id", "ct.subject_id")
      .leftJoin("staff as st", "st.id", "ct.teacher_id")
      .leftJoin("users as u", "u.id", "st.user_id")
      .select([
        "s.id as subject_id",
        "s.name as subject_name",
        "s.code as subject_code",
        sql<string>`concat(u.first_name, ' ', u.last_name)`.as("teacher_name"),
      ])
      .where("ct.class_id", "=", classId)
      .where("ct.is_deleted" as any, "=", false)
      .where("s.is_deleted" as any, "=", false)
      .where("s.id" as any, "is not", null)
      .groupBy(["s.id", "s.name", "s.code", "u.first_name", "u.last_name"])
      .execute();

    console.log('[getStudentReport] Found subjects:', subjects.length);

    // Get term info
    let termInfo: any = null;
    if (term_id) {
      termInfo = await db
        .selectFrom("terms")
        .select(["id", "name", "start_date", "end_date"])
        .where("id", "=", term_id)
        .executeTakeFirst();
    }

    // Get academic year info
    let yearInfo: any = null;
    if (academic_year_id) {
      yearInfo = await db
        .selectFrom("academic_years")
        .select(["id", "name", "start_date", "end_date"])
        .where("id", "=", academic_year_id)
        .executeTakeFirst();
    }

    // Get all terms for comparison if requested
    let allTerms: any[] = [];
    if (include_all_terms && academic_year_id) {
      allTerms = await db
        .selectFrom("terms")
        .select(["id", "name", "start_date", "end_date"])
        .where("academic_year_id", "=", academic_year_id)
        .orderBy("start_date", "asc")
        .execute();
    }

    // Helper function to get subject performance for a specific term
    const getSubjectPerformance = async (subject: any, selectedTermId?: number) => {
      // Get assignments for this subject/term
      let assignmentsQuery = db
        .selectFrom("assignments as a")
        .select(["a.id", "a.title", "a.max_score", "a.due_date as date", "a.teacher_comments"])
        .where("a.subject_id", "=", subject.subject_id)
        .where("a.class_id", "=", classId)
        .where("a.is_deleted" as any, "=", false);

      if (selectedTermId) {
        assignmentsQuery = assignmentsQuery.where("a.term_id", "=", selectedTermId);
      }

      const assignments = await assignmentsQuery.execute();

      // Get exam results for this subject/term
      let examsQuery = db
        .selectFrom("exams as e")
        .select(["e.id", "e.title", "e.max_score", "e.exam_date as date"])
        .where("e.subject_id", "=", subject.subject_id)
        .where("e.class_id", "=", classId)
        .where("e.is_deleted" as any, "=", false);

      if (selectedTermId) {
        examsQuery = examsQuery.where("e.term_id", "=", selectedTermId);
      }

      const exams = await examsQuery.execute();

      // Get assignment submissions
      const assignmentIds = assignments.map(a => a.id);
      let assignmentSubmissions: any[] = [];
      if (assignmentIds.length > 0) {
        assignmentSubmissions = await db
          .selectFrom("assignment_submissions as asub")
          .select(["asub.assignment_id", "asub.score", "asub.grade_letter", "asub.grade_point", "asub.teacher_comments"])
          .where("asub.student_id", "=", studentId)
          .where("asub.assignment_id", "in", assignmentIds)
          .where("asub.is_deleted" as any, "=", false)
          .execute();
      }

      // Get exam results
      const examIds = exams.map(e => e.id);
      let examResults: any[] = [];
      if (examIds.length > 0) {
        examResults = await db
          .selectFrom("exam_results as er")
          .select(["er.exam_id", "er.score", "er.grade_letter", "er.grade_point", "er.teacher_comments"])
          .where("er.student_id", "=", studentId)
          .where("er.exam_id", "in", examIds)
          .where("er.is_deleted" as any, "=", false)
          .execute();
      }

      // Calculate assignment average
      const assignmentScores = assignmentSubmissions
        .map(sub => {
          const assignment = assignments.find(a => a.id === sub.assignment_id);
          if (!assignment || !assignment.max_score) return null;
          return (Number(sub.score) / Number(assignment.max_score)) * 100;
        })
        .filter(score => score !== null) as number[];

      const assignmentAverage = assignmentScores.length > 0
        ? assignmentScores.reduce((a, b) => a + b, 0) / assignmentScores.length
        : null;

      // Calculate exam average
      const examScores = examResults
        .map(res => {
          const exam = exams.find(e => e.id === res.exam_id);
          if (!exam || !exam.max_score) return null;
          return (Number(res.score) / Number(exam.max_score)) * 100;
        })
        .filter(score => score !== null) as number[];

      const examAverage = examScores.length > 0
        ? examScores.reduce((a, b) => a + b, 0) / examScores.length
        : null;

      // Calculate overall (40% assignments + 60% exams)
      let overallScore: number | null = null;
      if (assignmentAverage !== null && examAverage !== null) {
        overallScore = (assignmentAverage * 0.4) + (examAverage * 0.6);
      } else if (assignmentAverage !== null) {
        overallScore = assignmentAverage;
      } else if (examAverage !== null) {
        overallScore = examAverage;
      }

      // Get class average for this subject
      const allStudentScores: number[] = [];
      if (examIds.length > 0) {
        const allExamResults = await db
          .selectFrom("exam_results as er")
          .innerJoin("exams as e", "e.id", "er.exam_id")
          .select(["er.score", "e.max_score"])
          .where("er.exam_id", "in", examIds)
          .where("er.is_deleted" as any, "=", false)
          .execute();

        allExamResults.forEach(res => {
          if (res.score !== null && res.max_score) {
            allStudentScores.push((Number(res.score) / Number(res.max_score)) * 100);
          }
        });
      }

      const classAverage = allStudentScores.length > 0
        ? allStudentScores.reduce((a, b) => a + b, 0) / allStudentScores.length
        : null;

      // Get grade letter
      const gradeLetter = overallScore !== null
        ? overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C' : overallScore >= 50 ? 'D' : 'F'
        : null;

      // Collect teacher comments from assignments and exams
      const teacherComments = [
        ...assignmentSubmissions.map(s => s.teacher_comments).filter(Boolean),
        ...examResults.map(r => r.teacher_comments).filter(Boolean)
      ];

      return {
        subject_id: subject.subject_id,
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        teacher_name: subject.teacher_name,
        assignment_average: assignmentAverage,
        exam_average: examAverage,
        overall_score: overallScore,
        grade_letter: gradeLetter,
        class_average: classAverage,
        assignments_count: assignments.length,
        exams_count: exams.length,
        teacher_comments: teacherComments.length > 0 ? teacherComments[teacherComments.length - 1] : null,
      };
    };

    // Build subject performance data for current term
    const subjectPerformance = await Promise.all(
      subjects.map(subject => getSubjectPerformance(subject, term_id))
    );

    // Build term comparison data if requested
    const termComparison = include_all_terms && allTerms.length > 0
      ? await Promise.all(
          allTerms.map(async (term) => {
            const termSubjects = await Promise.all(
              subjects.map(subject => getSubjectPerformance(subject, term.id))
            );
            const scoredSubjects = termSubjects.filter(s => s.overall_score !== null);
            const termAverage = scoredSubjects.length > 0
              ? scoredSubjects.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scoredSubjects.length
              : null;

            return {
              term_id: term.id,
              term_name: term.name,
              term_average: termAverage,
              subjects: termSubjects,
            };
          })
        )
      : [];

    // Calculate overall stats
    const scoredSubjects = subjectPerformance.filter(s => s.overall_score !== null);
    const overallAverage = scoredSubjects.length > 0
      ? scoredSubjects.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scoredSubjects.length
      : null;

    // Get student ranking
    const classStudents = await db
      .selectFrom("class_students as cs")
      .select(["cs.student_id"])
      .where("cs.class_id", "=", classId)
      .where("cs.is_deleted" as any, "=", false)
      .where("cs.is_active", "=", true)
      .execute();

    const totalStudents = classStudents.length;

    // Get attendance
    let attendanceData: any = { present: 0, absent: 0, total: 0, percentage: 0, monthly_breakdown: [] };
    if (termInfo) {
      try {
        const attendance = await db
          .selectFrom("attendances as a")
          .select([
            sql<number>`SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)`.as("present"),
            sql<number>`SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END)`.as("absent"),
            sql<number>`COUNT(*)`.as("total"),
          ])
          .where("a.student_id", "=", studentId)
          .where("a.attendance_date", ">=", termInfo.start_date)
          .where("a.attendance_date", "<=", termInfo.end_date)
          .executeTakeFirst();

        if (attendance) {
          const present = Number(attendance.present || 0);
          const total = Number(attendance.total || 0);
          attendanceData = {
            present,
            absent: Number(attendance.absent || 0),
            total,
            percentage: total > 0 ? (present / total) * 100 : 0,
          };
        }

        // Get monthly breakdown
        const monthlyAttendance = await db
          .selectFrom("attendances as a")
          .select([
            sql<string>`EXTRACT(MONTH FROM a.attendance_date)`.as("month"),
            sql<number>`SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)`.as("present"),
            sql<number>`SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END)`.as("absent"),
            sql<number>`COUNT(*)`.as("total"),
          ])
          .where("a.student_id", "=", studentId)
          .where("a.attendance_date", ">=", termInfo.start_date)
          .where("a.attendance_date", "<=", termInfo.end_date)
          .groupBy(sql<string>`EXTRACT(MONTH FROM a.attendance_date)`)
          .orderBy(sql<string>`EXTRACT(MONTH FROM a.attendance_date)`)
          .execute();

        attendanceData.monthly_breakdown = monthlyAttendance.map(m => ({
          month: Number(m.month),
          present: Number(m.present || 0),
          absent: Number(m.absent || 0),
          total: Number(m.total || 0),
          percentage: m.total > 0 ? (Number(m.present) / Number(m.total)) * 100 : 0,
        }));
      } catch (err) {
        console.log('[getStudentReport] Attendance table may not exist, skipping:', (err as Error).message);
      }
    }

    // Get behavioral notes (if you have a behavior/incidents table, add it here)
    const behavioralNotes = []; // Placeholder for future behavioral tracking

    // Get school info (logo, next term info, etc.)
    let schoolInfo: any = null;
    try {
      schoolInfo = await db
        .selectFrom("schools")
        .select(["id", "name"])
        .where("id", "=", context.schoolId)
        .executeTakeFirst();
    } catch (err) {
      console.log('[getStudentReport] Schools table query failed, using fallback:', (err as Error).message);
      schoolInfo = { id: context.schoolId, name: "School" };
    }

    // Get next term info
    let nextTermInfo: any = null;
    if (term_id) {
      nextTermInfo = await db
        .selectFrom("terms")
        .select(["id", "name", "start_date", "end_date"])
        .where("start_date", ">", termInfo.end_date || new Date())
        .orderBy("start_date", "asc")
        .limit(1)
        .executeTakeFirst();
    }

    return {
      student: {
        id: (student as any).student_id,
        first_name: (student as any).first_name,
        last_name: (student as any).last_name,
        full_name: `${(student as any).first_name} ${(student as any).last_name}`,
        admission_no: (student as any).admission_no,
        gender: (student as any).gender,
        date_of_birth: (student as any).date_of_birth,
        class_name: (student as any).class_name,
        class_id: (student as any).class_id,
      },
      school: schoolInfo,
      academic_year: yearInfo,
      term: termInfo,
      next_term: nextTermInfo,
      subjects: subjectPerformance,
      term_comparison: termComparison,
      statistics: {
        overall_average: overallAverage,
        total_subjects: subjects.length,
        scored_subjects: scoredSubjects.length,
        class_position: 0, // Would need complex calculation
        total_students: totalStudents,
        attendance: attendanceData,
        behavioral_notes: behavioralNotes,
      },
      grading_scale: {
        A: { min: 80, max: 100, description: "Excellent", point: 5.0 },
        B: { min: 70, max: 79, description: "Very Good", point: 4.0 },
        C: { min: 60, max: 69, description: "Good", point: 3.0 },
        D: { min: 50, max: 59, description: "Satisfactory", point: 2.0 },
        E: { min: 40, max: 49, description: "Pass", point: 1.0 },
        F: { min: 0, max: 39, description: "Needs Improvement", point: 0.0 },
      },
    };
  }

  async getAnalytics(context: UserContext, assessmentId: number) {
    const assessment = await db
      .selectFrom("assessments")
      .select(["max_score", "weight", "class_id", "subject_id", "title"])
      .where("id" as any, "=", assessmentId)
      .where("school_id" as any, "=", context.schoolId)
      .executeTakeFirst();

    if (!assessment) throw new Error("Assessment not found");

    const stats = await db
      .selectFrom("assessment_results as ar")
      .leftJoin("students as s", "s.id", "ar.student_id")
      .select([
        sql<number>`COUNT(ar.id)`.as("total_students"),
        sql<number>`AVG(ar.score)`.as("average"),
        sql<number>`MAX(ar.score)`.as("highest"),
        sql<number>`MIN(ar.score)`.as("lowest"),
        sql<number>`AVG(ar.score) / ${assessment.max_score} * 100`.as("average_percentage"),
      ])
      .where("ar.assessment_id", "=", assessmentId)
      .where("ar.is_deleted" as any, "=", false)
      .executeTakeFirst();

    const distribution = await db
      .selectFrom("assessment_results")
      .select(["grade_letter", sql<number>`COUNT(id)`.as("count")])
      .where("assessment_id", "=", assessmentId)
      .where("is_deleted" as any, "=", false)
      .groupBy("grade_letter")
      .orderBy("grade_letter" as any, "asc")
      .execute();

    return { assessment, stats, distribution };
  }
}

export const assessmentsService = new AssessmentsService();

import { Request, Response } from "express";
import { db } from "../../../config/infra/database.js";

export class ExamsController {
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  // Auto-calculate grade from percentage
  private calculateGrade(marksObtained: number, totalMarks: number): string {
    if (!totalMarks || totalMarks === 0) return 'F';
    const percentage = (marksObtained / totalMarks) * 100;
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  // ==================== EXAM SESSIONS ====================

  async getAllSessions(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .selectFrom("exam_sessions")
        .selectAll()
        .where("school_id", "=", context.schoolId)
        .where("is_deleted", "=", false)
        .orderBy("start_date", "desc")
        .execute();

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getAllSessions:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createSession(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .insertInto("exam_sessions")
        .values({
          ...req.body,
          school_id: context.schoolId,
          created_by: context.userId,
        })
        .returningAll()
        .executeTakeFirst();

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in createSession:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateSession(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .updateTable("exam_sessions")
        .set({
          ...req.body,
          updated_by: context.userId,
          updated_at: new Date(),
        })
        .where("id", "=", Number(req.params.id))
        .where("school_id", "=", context.schoolId)
        .returningAll()
        .executeTakeFirst();

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in updateSession:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== EXAM DEFINITIONS ====================

  async getAllDefinitions(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .selectFrom("exam_definitions")
        .selectAll()
        .where("school_id", "=", context.schoolId)
        .where("is_deleted", "=", false)
        .orderBy("exam_name", "asc")
        .execute();

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getAllDefinitions:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createDefinition(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .insertInto("exam_definitions")
        .values({
          ...req.body,
          school_id: context.schoolId,
          created_by: context.userId,
        })
        .returningAll()
        .executeTakeFirst();

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in createDefinition:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateDefinition(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .updateTable("exam_definitions")
        .set({
          ...req.body,
          updated_by: context.userId,
          updated_at: new Date(),
        })
        .where("id", "=", Number(req.params.id))
        .where("school_id", "=", context.schoolId)
        .returningAll()
        .executeTakeFirst();

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in updateDefinition:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== EXAM RESULTS ====================

  async getAllExams(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      let query = (db as any)
        .selectFrom("entrance_exams")
        .innerJoin("applications", "entrance_exams.application_id", "applications.id")
        .innerJoin("applicants", "applications.applicant_id", "applicants.id")
        .leftJoin("exam_sessions", "entrance_exams.session_id", "exam_sessions.id")
        .leftJoin("exam_definitions", "entrance_exams.exam_definition_id", "exam_definitions.id")
        .select([
          "entrance_exams.id",
          "entrance_exams.school_id",
          "entrance_exams.application_id",
          "entrance_exams.session_id",
          "entrance_exams.exam_definition_id",
          "entrance_exams.exam_date",
          "entrance_exams.total_marks",
          "entrance_exams.marks_obtained",
          "entrance_exams.percentage",
          "entrance_exams.grade",
          "entrance_exams.supervisor_id",
          "entrance_exams.supervisor_name",
          "entrance_exams.marker_id",
          "entrance_exams.marker_name",
          "entrance_exams.examiner_id",
          "entrance_exams.examiner_name",
          "entrance_exams.exam_venue",
          "entrance_exams.remarks",
          "entrance_exams.moderation_notes",
          "entrance_exams.created_at",
          "applications.application_no",
          "applicants.first_name",
          "applicants.last_name",
          "exam_sessions.session_name",
          "exam_definitions.exam_name",
          "exam_definitions.subject_area"
        ])
        .where("entrance_exams.school_id", "=", context.schoolId)
        .where("entrance_exams.is_deleted", "=", false);

      // Apply filters
      if (req.query.session_id) {
        query = query.where("entrance_exams.session_id", "=", Number(req.query.session_id));
      }

      if (req.query.exam_definition_id) {
        query = query.where("entrance_exams.exam_definition_id", "=", Number(req.query.exam_definition_id));
      }

      if (req.query.date_from) {
        query = query.where("entrance_exams.exam_date", ">=", req.query.date_from as string);
      }

      if (req.query.date_to) {
        query = query.where("entrance_exams.exam_date", "<=", req.query.date_to as string);
      }

      const result = await query.orderBy("entrance_exams.exam_date", "desc").execute();

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getAllExams:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getExamsByApplication(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .selectFrom("entrance_exams")
        .leftJoin("exam_definitions", "entrance_exams.exam_definition_id", "exam_definitions.id")
        .selectAll("entrance_exams")
        .select([
          "exam_definitions.exam_name",
          "exam_definitions.subject_area",
          "exam_definitions.total_marks as definition_total_marks"
        ])
        .where("entrance_exams.application_id", "=", Number(req.params.applicationId))
        .where("entrance_exams.school_id", "=", context.schoolId)
        .where("entrance_exams.is_deleted", "=", false)
        .orderBy("exam_definitions.exam_name", "asc")
        .execute();

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createExam(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { application_id, session_id, exam_definition_id, exam_date, total_marks, marks_obtained, supervisor_name, marker_name, examiner_name, exam_venue, remarks } = req.body;

      // Auto-calculate grade from percentage
      const grade = this.calculateGrade(Number(marks_obtained), Number(total_marks));

      const result = await (db as any)
        .insertInto("entrance_exams")
        .values({
          school_id: context.schoolId,
          application_id,
          session_id: session_id || null,
          exam_definition_id: exam_definition_id || null,
          exam_date,
          total_marks,
          marks_obtained,
          grade,
          supervisor_name,
          marker_name,
          examiner_name,
          exam_venue,
          remarks,
          created_by: context.userId,
        })
        .returningAll()
        .executeTakeFirst();

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in createExam:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateExam(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { session_id, exam_definition_id, exam_date, total_marks, marks_obtained, supervisor_name, marker_name, examiner_name, exam_venue, remarks, moderation_notes } = req.body;

      // Auto-calculate grade from percentage
      const grade = this.calculateGrade(Number(marks_obtained), Number(total_marks));

      const result = await (db as any)
        .updateTable("entrance_exams")
        .set({
          session_id: session_id || null,
          exam_definition_id: exam_definition_id || null,
          exam_date,
          total_marks,
          marks_obtained,
          grade,
          supervisor_name,
          marker_name,
          examiner_name,
          exam_venue,
          remarks,
          moderation_notes,
          updated_by: context.userId,
          updated_at: new Date(),
        })
        .where("id", "=", Number(req.params.id))
        .where("school_id", "=", context.schoolId)
        .returningAll()
        .executeTakeFirst();

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in updateExam:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteExam(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .updateTable("entrance_exams")
        .set({
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by: context.userId,
        })
        .where("id", "=", Number(req.params.id))
        .where("school_id", "=", context.schoolId)
        .returningAll()
        .executeTakeFirst();

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in deleteExam:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const examsController = new ExamsController();

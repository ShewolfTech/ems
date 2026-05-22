import { Request, Response } from "express";
import { db } from "../../../config/infra/database.js";
import { sql } from "kysely";
import bcrypt from "bcrypt";
import { generateSchoolId, generateUsername } from "../../../utils/generateId.js";

export class EnrollmentsController {
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  async getAll(req: Request, res: Response) {
    try {
      console.log('[ENROLLMENTS] getAll called');
      const context = this.getContext(req);
      console.log('[ENROLLMENTS] Context:', context);
      
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await (db as any)
        .selectFrom("enrollments")
        .innerJoin("applications", "enrollments.application_id", "applications.id")
        .innerJoin("applicants", "applications.applicant_id", "applicants.id")
        .leftJoin("application_decisions", "applications.id", "application_decisions.application_id")
        .select([
          "enrollments.id",
          "enrollments.application_id",
          "enrollments.student_id",
          "enrollments.enrollment_date",
          "enrollments.academic_year",
          "enrollments.grade_id",
          "enrollments.stream_id",
          "enrollments.enrollment_status",
          "enrollments.fees_category",
          "enrollments.documents_submitted",
          "enrollments.fees_paid",
          "enrollments.fees_amount",
          "enrollments.completed_at",
          "enrollments.created_at",
          "applications.application_no",
          "applications.applying_for_grade",
          "applicants.first_name",
          "applicants.last_name",
          "applicants.email",
          "applicants.phone",
          "applicants.date_of_birth",
          "applicants.gender",
          "applicants.nationality",
          "application_decisions.decision_type",
          "application_decisions.applicant_response",
          "application_decisions.offer_details"
        ])
        .where("enrollments.school_id", "=", context.schoolId)
        .where("enrollments.is_deleted", "=", false)
        .orderBy("enrollments.created_at", "desc")
        .execute();

      console.log('[ENROLLMENTS] Query result count:', result.length);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getAll:', error);
      console.error('ERROR stack:', error.stack);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await db
        .selectFrom("enrollments" as any)
        .selectAll()
        .where("id", "=", Number(req.params.id))
        .where("school_id", "=", context.schoolId)
        .executeTakeFirst();

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getById:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { application_id, grade_id, stream_id, academic_year, fees_category } = req.body;

      const enrollment = await db
        .insertInto("enrollments" as any)
        .values({
          school_id: context.schoolId,
          application_id,
          enrollment_date: new Date(),
          academic_year,
          grade_id,
          stream_id,
          fees_category,
          enrollment_status: 'pending_confirmation',
          created_by: context.userId,
        })
        .returningAll()
        .executeTakeFirst();

      console.log('[ENROLLMENTS] Created:', enrollment);

      res.status(201).json({ success: true, data: enrollment });
    } catch (error: any) {
      console.error('ERROR in create:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async confirmEnrollment(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const enrollmentId = Number(req.params.id);
      const { documents_submitted } = req.body;

      // Use a transaction for atomicity
      const result = await db.transaction().execute(async (trx) => {
        // 1. Get enrollment with applicant info
        const enrollment: any = await (trx as any)
          .selectFrom("enrollments")
          .innerJoin("applications", "enrollments.application_id", "applications.id")
          .innerJoin("applicants", "applications.applicant_id", "applicants.id")
          .select([
            "enrollments.id",
            "enrollments.application_id",
            "enrollments.student_id",
            "enrollments.enrollment_status",
            "enrollments.fees_category",
            "enrollments.grade_id",
            "enrollments.stream_id",
            "applicants.first_name",
            "applicants.last_name",
            "applicants.email",
            "applicants.phone",
            "applicants.date_of_birth",
            "applicants.gender",
            "applicants.nationality",
          ])
          .where("enrollments.id", "=", enrollmentId)
          .where("enrollments.school_id", "=", context.schoolId)
          .executeTakeFirst();

        if (!enrollment) {
          throw new Error("Enrollment not found");
        }

        // 2. Idempotency: if enrollment already confirmed, return existing student
        if (enrollment.student_id) {
          const existingStudent: any = await (trx as any)
            .selectFrom("students")
            .selectAll()
            .where("id", "=", enrollment.student_id)
            .executeTakeFirst();

          if (existingStudent) {
            return {
              enrollment,
              student: existingStudent,
              user: { id: existingStudent.user_id },
              already_confirmed: true,
            };
          }
        }

        // 3. Generate shared BIGINT ID (used as user_id, student_id, admission_no)
        const sharedId = await generateSchoolId(context.schoolId);

        const defaultPassword = enrollment.date_of_birth
          ? new Date(enrollment.date_of_birth).toISOString().slice(0, 10).replace(/-/g, '')
          : 'Student@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // 4. Get student role
        const studentRole: any = await (trx as any)
          .selectFrom("roles")
          .select("id")
          .where("name", "ilike", "student")
          .executeTakeFirst();

        // 5. Handle email collision
        let studentEmail = enrollment.email || null;
        if (studentEmail) {
          const existingEmail = await (trx as any)
            .selectFrom("users")
            .select("id")
            .where("email", "=", studentEmail)
            .executeTakeFirst();
          if (existingEmail) {
            studentEmail = `user${sharedId}@student.local`;
          }
        }

        // 6. Create user with explicit ID
        const user: any = await (trx as any)
          .insertInto("users")
          .values({
            id: sharedId,
            school_id: context.schoolId,
            username: generateUsername(sharedId),
            email: studentEmail,
            phone: enrollment.phone,
            password: hashedPassword,
            first_name: enrollment.first_name,
            last_name: enrollment.last_name,
            date_of_birth: enrollment.date_of_birth,
            nationality: enrollment.nationality,
            role_id: studentRole?.id || null,
            is_active: true,
            created_by: context.userId,
          })
          .returningAll()
          .executeTakeFirst();

        if (!user) throw new Error("Failed to create user account");

        // Advance the users_id_seq so future auto-increment inserts don't collide
        await sql`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))`.execute(trx);

        // 7. Create student (same ID for user_id, admission_no, and student id)
        const student: any = await (trx as any)
          .insertInto("students")
          .values({
            id: sharedId,
            school_id: context.schoolId,
            user_id: sharedId,
            admission_no: String(sharedId),
            first_name: enrollment.first_name,
            last_name: enrollment.last_name,
            date_of_birth: enrollment.date_of_birth,
            gender: enrollment.gender,
            email: studentEmail,
            phone: enrollment.phone || null,
            nationality: enrollment.nationality,
            application_date: new Date(),
            admission_date: new Date(),
            enrollment_status: 'active',
            is_active: true,
            created_by: context.userId,
          })
          .returningAll()
          .executeTakeFirst();

        if (!student) throw new Error("Failed to create student record");

        // 8. Update enrollment
        const updatedEnrollment: any = await (trx as any)
          .updateTable("enrollments")
          .set({
            student_id: student.id,
            enrollment_status: 'completed',
            documents_submitted: documents_submitted ? JSON.stringify(documents_submitted) : null,
            completed_at: new Date(),
            completed_by: context.userId,
          })
          .where("id", "=", enrollmentId)
          .where("school_id", "=", context.schoolId)
          .returningAll()
          .executeTakeFirst();

        // 9. Update application
        await (trx as any)
          .updateTable("applications")
          .set({
            enrolled_student_id: student.id,
          })
          .where("id", "=", enrollment.application_id)
          .execute();

        // 10. Get stream name from streams table if stream_id exists
        let streamName = null;
        if (enrollment.stream_id) {
          const streamInfo: any = await (trx as any)
            .selectFrom("streams")
            .select("name")
            .where("id", "=", enrollment.stream_id)
            .executeTakeFirst();
          streamName = streamInfo?.name || null;
        }

        // 11. Update student's current_grade_id and current_stream
        if (enrollment.grade_id) {
          await (trx as any)
            .updateTable("students")
            .set({
              current_grade_id: enrollment.grade_id,
              current_stream: streamName,
            })
            .where("id", "=", student.id)
            .execute();
        }

        // 12. Enroll student in class (class_students table)
        // Find class matching the enrollment's grade and stream
        let classId = null;
        if (enrollment.grade_id) {
          // Find class by grade_level_id and stream
          const classRecord: any = await (trx as any)
            .selectFrom("classes")
            .select("id")
            .where("grade_level_id", "=", enrollment.grade_id)
            .where("school_id", "=", context.schoolId)
            .where("is_deleted", "=", false)
            .where((eb: any) => {
              if (streamName) {
                return eb("stream", "=", streamName);
              }
              return eb("id", "is not", null); // Just get any class in this grade
            })
            .executeTakeFirst();
          
          if (classRecord) {
            classId = classRecord.id;
            // Enroll student in class
            await (trx as any)
              .insertInto("class_students")
              .values({
                school_id: context.schoolId,
                class_id: classId,
                student_id: student.id,
                enrollment_date: new Date(),
                is_active: true,
                is_deleted: false,
              })
              .execute();
          }
        }

        return {
          enrollment: updatedEnrollment,
          student,
          class_id: classId,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            default_password: defaultPassword,
          }
        };
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in confirmEnrollment:', error.message);
      const message = error.message || "Failed to confirm enrollment";
      res.status(400).json({ success: false, message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await db
        .updateTable("enrollments" as any)
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
      console.error('ERROR in update:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await db
        .updateTable("enrollments" as any)
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
      console.error('ERROR in delete:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const allEnrollments = await db
        .selectFrom("enrollments" as any)
        .select("enrollment_status")
        .where("school_id", "=", context.schoolId)
        .where("is_deleted", "=", false)
        .execute();

      const total = allEnrollments.length;
      const pending_confirmation = allEnrollments.filter((e: any) => e.enrollment_status === 'pending_confirmation').length;
      const completed = allEnrollments.filter((e: any) => e.enrollment_status === 'completed').length;

      res.json({ success: true, data: { total, pending_confirmation, completed } });
    } catch (error: any) {
      console.error('ERROR in getStatistics:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const enrollmentsController = new EnrollmentsController();

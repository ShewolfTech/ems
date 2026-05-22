// ⚠️ Auto-generated Multi-Tenant Service for ExamResults
import { db } from "../../../config/infra/database.js";
import { ExamResultsSchema } from "./validator.js";
import { ExamResultsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class ExamResultsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("exam_results" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    
    // Filter by exam_id
    if (params?.exam_id) {
      query = query.where("exam_id" as any, "=", Number(params.exam_id));
    }
    
    // Filter by student_ids (comma-separated)
    if (params?.student_ids) {
      const studentIds = params.student_ids.split(",").map((id: string) => Number(id.trim()));
      query = query.where("student_id" as any, "in", studentIds);
    }
    
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("exam_results" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: ExamResultsType) {
    const validated = ExamResultsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("exam_results" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<ExamResultsType>) {
    return await db.updateTable("exam_results" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("exam_results" as any)
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const examresultsService = new ExamResultsService();


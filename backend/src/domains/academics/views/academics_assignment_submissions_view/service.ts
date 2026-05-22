// ⚠️ Auto-generated Multi-Tenant Service for AcademicsAssignmentSubmissionsView
import { db } from "../../../../config/infra/database.js";
import { AcademicsAssignmentSubmissionsViewType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AcademicsAssignmentSubmissionsViewService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("academics_assignment_submissions_view" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("academics_assignment_submissions_view" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    return await query.executeTakeFirst();
  }
}
export const academicsassignmentsubmissionsviewService = new AcademicsAssignmentSubmissionsViewService();


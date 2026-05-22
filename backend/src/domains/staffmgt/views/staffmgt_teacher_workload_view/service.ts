// ⚠️ Auto-generated Multi-Tenant Service for StaffmgtTeacherWorkloadView
import { db } from "../../../../config/infra/database.js";
import { StaffmgtTeacherWorkloadViewType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class StaffmgtTeacherWorkloadViewService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("staffmgt_teacher_workload_view" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("staffmgt_teacher_workload_view" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    return await query.executeTakeFirst();
  }
}
export const staffmgtteacherworkloadviewService = new StaffmgtTeacherWorkloadViewService();

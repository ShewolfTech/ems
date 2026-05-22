// ⚠️ Auto-generated Multi-Tenant Service for AcademicsStudentsgradesView
import { db } from "../../../../config/infra/database.js";
import { AcademicsStudentsgradesViewType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AcademicsStudentsgradesViewService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("academics_studentsgrades_view" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("academics_studentsgrades_view" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    return await query.executeTakeFirst();
  }
}
export const academicsstudentsgradesviewService = new AcademicsStudentsgradesViewService();


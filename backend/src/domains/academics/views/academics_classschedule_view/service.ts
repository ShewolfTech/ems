// ⚠️ Auto-generated Multi-Tenant Service for AcademicsClassscheduleView
import { db } from "../../../../config/infra/database.js";
import { AcademicsClassscheduleViewType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class AcademicsClassscheduleViewService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("academics_classschedule_view" as any)
      .selectAll()
      .where("school_id" as any, "=", context.schoolId as any);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("academics_classschedule_view" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("school_id" as any, "=", context.schoolId as any);
    return await query.executeTakeFirst();
  }
}
export const academicsclassscheduleviewService = new AcademicsClassscheduleViewService();


// ⚠️ Auto-generated Multi-Tenant Service for SystemRolerouteAccessView
import { db } from "../../../../config/infra/database.js";
import { SystemRolerouteAccessViewType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class SystemRolerouteAccessViewService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("system_roleroute_access_view" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("system_roleroute_access_view" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    return await query.executeTakeFirst();
  }
}
export const systemrolerouteaccessviewService = new SystemRolerouteAccessViewService();

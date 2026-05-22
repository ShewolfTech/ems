// ⚠️ Auto-generated Multi-Tenant Service for Workflows
import { db } from "../../../config/infra/database.js";
import { WorkflowsSchema } from "./validator.js";
import { WorkflowsType } from "./types.js";


export interface UserContext {
  schoolId: number;
  userId?: number;
}

export class WorkflowsService {
  async findAll(context: UserContext, params?: any) {
    let query = db
      .selectFrom("workflows" as any)
      .selectAll()
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.execute();
  }

  async findById(context: UserContext, id: number | string) {
    let query = db
      .selectFrom("workflows" as any)
      .selectAll()
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any);
    query = query.where("is_deleted" as any, "=", false);
    return await query.executeTakeFirst();
  }

  async create(context: UserContext, data: WorkflowsType) {
    const validated = WorkflowsSchema.parse({
       ...data,
       schoolId: context.schoolId // 🛡️ Force correct schoolId on creation
    });
    return await db.insertInto("workflows" as any)
      .values(validated as any)
      .returningAll()
      .executeTakeFirst();
  }

  async update(context: UserContext, id: number | string, data: Partial<WorkflowsType>) {
    return await db.updateTable("workflows" as any)
      .set(data as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(context: UserContext, id: number | string) {
    return await db.deleteFrom("workflows" as any)
      .where("id" as any, "=", id as any)
      .where("schoolId" as any, "=", context.schoolId as any)
      .returningAll()
      .executeTakeFirst();
  }
}
export const workflowsService = new WorkflowsService();

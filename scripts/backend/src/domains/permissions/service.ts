import { db } from "../../config/infra/database.js";
import { PermissionsSchema, Permission } from "./validator.js";
import { SidebarMenu } from "./types.js";
import {
  PermissionsNotFoundError,
  PermissionsConflictError
} from "./errors.js";

export class PermissionsService {
  async findAll(): Promise<Permission[]> {
    const rows = await db.selectFrom("permissions").selectAll().execute();
    return rows.map(r => PermissionsSchema.parse(r));
  }

  async findById(id: string): Promise<Permission> {
    const row = await db.selectFrom("permissions").selectAll().where("id", "=", id).executeTakeFirst();
    if (!row) throw new PermissionsNotFoundError(id);
    return PermissionsSchema.parse(row);
  }

  async create(data: Permission): Promise<Permission> {
    const validated = PermissionsSchema.parse(data);
    try {
      const inserted = await db.insertInto("permissions").values(validated as any).returningAll().executeTakeFirst();
      return PermissionsSchema.parse(inserted);
    } catch (err: any) {
      throw new PermissionsConflictError(err.message);
    }
  }

  async update(id: string, data: Partial<Permission>): Promise<Permission> {
    const validated = PermissionsSchema.partial().parse(data);
    const updated = await db.updateTable("permissions").set(validated as any).where("id", "=", id).returningAll().executeTakeFirst();
    if (!updated) throw new PermissionsNotFoundError(id);
    return PermissionsSchema.parse(updated);
  }

  async delete(id: string): Promise<void> {
    const deleted = await db.updateTable("permissions").set({ isActive: false }).where("id", "=", id).executeTakeFirst();
    if (!deleted) throw new PermissionsNotFoundError(id);
  }

  async getSidebar(): Promise<SidebarMenu> {
    const routes = await this.findAll();
    return routes.reduce((acc: SidebarMenu, route: Permission) => {
      if (!route.is_menu_item) return acc;
      const module = route.module || "General";
      if (!acc[module]) acc[module] = [];
      acc[module].push(route);
      return acc;
    }, {});
  }
}

export const permissionsService = new PermissionsService();
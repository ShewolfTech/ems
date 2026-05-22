import { promises as fs } from "fs";
import path from "path";

const DOMAIN_PATH = path.resolve("backend/src/domains/permissions");

async function run() {
  await fs.mkdir(DOMAIN_PATH, { recursive: true });

  const files = [
    {
      name: "validator.ts",
      content: `import { z } from "zod";

export const PermissionsSchema = z.object({
  id: z.string().uuid().optional(), // adjust if numeric IDs
  display_name: z.string().min(1).max(100),
  icon: z.string().max(50).optional().nullable(),
  is_menu_item: z.boolean().default(false),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  module: z.string().max(50).optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type Permission = z.infer<typeof PermissionsSchema>;`
    },
    {
      name: "types.ts",
      content: `import type { Permission } from "./validator.js";

export type { Permission };

export interface SidebarMenu {
  [moduleName: string]: Permission[];
}

export type UpdatePermissionInput = Partial<Permission>;`
    },
    {
      name: "errors.ts",
      content: `export class PermissionsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "PermissionsError";
  }
}

export class PermissionsNotFoundError extends PermissionsError {
  constructor(id?: string) {
    super("Permission record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class PermissionsValidationError extends PermissionsError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class PermissionsUnauthorizedError extends PermissionsError {
  constructor() {
    super("Unauthorized to perform this action on Permissions", 401);
  }
}

export class PermissionsForbiddenError extends PermissionsError {
  constructor() {
    super("Forbidden: insufficient rights for Permissions", 403);
  }
}

export class PermissionsConflictError extends PermissionsError {
  constructor(message: string = "Permissions conflict") {
    super(message, 409);
  }
}`
    },
    {
      name: "service.ts",
      content: `import { db } from "../../config/infra/database.js";
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

export const permissionsService = new PermissionsService();`
    },
    {
      name: "controller.ts",
      content: `import { Request, Response, NextFunction } from "express";
import { permissionsService } from "./service.js";

export class PermissionsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.findAll();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.findById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await permissionsService.delete(req.params.id);
      res.json({ success: true, message: "Permission deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  async getSidebar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.getSidebar();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export const permissionsController = new PermissionsController();`
    },
    {
      name: "routes.ts",
      content: `import { Router } from "express";
import { permissionsController } from "./controller.js";

const router = Router();

router.get("/", permissionsController.getAll.bind(permissionsController));
router.get("/sidebar", permissionsController.getSidebar.bind(permissionsController));
router.get("/:id", permissionsController.getById.bind(permissionsController));
router.post("/", permissionsController.create.bind(permissionsController));
router.put("/:id", permissionsController.update.bind(permissionsController));
router.delete("/:id", permissionsController.delete.bind(permissionsController));

export default router;`
    },
    {
      name: "index.ts",
      content: `export * from "./service.js";
export * from "./controller.js";
export * from "./routes.js";
export * from "./validator.js";
export * from "./types.js";
export * from "./errors.js";`
    }
  ];

  console.log(`\n📂 Finalizing Permissions Domain at: ${DOMAIN_PATH}`);
  console.log("--------------------------------------------------");

  for (const file of files) {
    await fs.writeFile(path.join(DOMAIN_PATH, file.name), file.content);
    console.log(`  ✅ Written: ${file.name}`);
  }

  console.log("--------------------------------------------------");
  console.log("🚀 Permissions Domain is fully CRUD‑enabled, validated, and middleware‑friendly.");
}

run().catch(console.error);

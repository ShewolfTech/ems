import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });
const domainsBase = path.resolve(__dirname, "../backend/src/domains");

const snakeToPascal = (str: string) =>
  str.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

async function run() {
  const dbPath = pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href;
  const { pool } = await import(dbPath);

  const result = await pool.query(`
    SELECT module, resource, route_type, 
           COALESCE(BOOL_OR(is_global) FILTER (WHERE is_global IS TRUE), false) as is_global
    FROM route_permissions 
    WHERE module IS NOT NULL AND resource IS NOT NULL
    GROUP BY module, resource, route_type
  `);

  console.log(`🚀 Regenerating Multi-Tenant Controllers for ${result.rows.length} domains...`);

  for (const { module, resource, route_type, is_global } of result.rows) {
    if (["auth", "permissions"].includes(resource)) continue;

    const interfaceName = snakeToPascal(resource);
    const serviceInstance = `${resource.replace(/[^a-zA-Z0-9]/g, "")}Service`;
    const controllerInstance = `${resource.replace(/[^a-zA-Z0-9]/g, "")}Controller`;

    const domainPath = route_type === "view" 
      ? path.join(domainsBase, module, "views", resource)
      : route_type === "report"
      ? path.join(domainsBase, "reporting", resource)
      : path.join(domainsBase, module, resource);

    try { await fs.access(domainPath); } catch { continue; }

    // Determine if this is a global resource
    const isGlobal = is_global === true || is_global === 1 || is_global === 'true' || is_global === '1';

    // Controller logic differs for global vs tenant-specific resources
    let controllerContent = `import { Request, Response } from "express";
import { ${serviceInstance} } from "./service.js";

export class ${interfaceName}Controller {
`;

    if (isGlobal) {
      // Global resources - no auth context needed
      controllerContent += `
  // Global resource - no school context required
  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const data = await ${serviceInstance}.findAll({}, req.query);
      const enriched = (data || []).slice(0, 1).map((p: any) => ({
        display_name: p.name || "${interfaceName}",
        icon: "globe", 
        is_menu_item: true,
        display_order: 1,
      }));
      res.json({ success: true, permissions_meta: enriched });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSidebar(req: Request, res: Response) {
    try {
      res.json({ success: true, data: { show_in_sidebar: true, label: "${interfaceName}" } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const result = await ${serviceInstance}.findAll({}, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await ${serviceInstance}.findById({}, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
`;
    } else {
      // Tenant-specific resources - require school context
      controllerContent += `
  // 🛡️ Helper to extract context from authMiddleware
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "Unauthorized: No school context" });

      const data = await ${serviceInstance}.findAll(context, req.query);
      const enriched = (data || []).slice(0, 1).map((p: any) => ({
        display_name: p.studentName || p.assessmentTitle || p.name || "${interfaceName}",
        icon: "layout-grid", 
        is_menu_item: true,
        display_order: 1,
      }));
      res.json({ success: true, permissions_meta: enriched });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSidebar(req: Request, res: Response) {
    try {
      res.json({ success: true, data: { show_in_sidebar: true, label: "${interfaceName}" } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
`;
    }

    if (route_type === "crud" || route_type === "view") {
      if (!isGlobal) {
        controllerContent += `
  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await ${serviceInstance}.findAll(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await ${serviceInstance}.findById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
`;
      }
      if (route_type === "crud" && !isGlobal) {
        controllerContent += `
  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await ${serviceInstance}.create(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await ${serviceInstance}.update(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await ${serviceInstance}.delete(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
`;
      }
    } else if (route_type === "report") {
      if (!isGlobal) {
        controllerContent += `
  async generate(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await ${serviceInstance}.generate(context, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
`;
      }
    }

    // Custom endpoints for specific resources
    if (resource === "leaves") {
      controllerContent += `
  async getApprovers(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "Unauthorized: No school context" });

      const data = await ${serviceInstance}.getApprovers(context);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
`;
    }

    controllerContent += `}
export const ${controllerInstance} = new ${interfaceName}Controller();\n`;
    await fs.writeFile(path.join(domainPath, "controller.ts"), controllerContent);

    // Generate routes.ts
    const routesContent = `/**
 * ⚠️ Auto-generated routes for ${interfaceName}
 * Professional EMS 2026 - Backend Layer
 */
import { Router } from "express";
import { ${controllerInstance} } from "./controller.js";

const router = Router();

// Metadata Endpoints (Priority)
router.get("/permissions-meta", ${controllerInstance}.getPermissionsMeta.bind(${controllerInstance}));
router.get("/sidebar", ${controllerInstance}.getSidebar.bind(${controllerInstance}));

// Standard CRUD Endpoints
router.get("/", ${controllerInstance}.getAll.bind(${controllerInstance}));
router.get("/:id", ${controllerInstance}.getById.bind(${controllerInstance}));
${route_type === "crud" && !isGlobal ? `router.post("/", ${controllerInstance}.create.bind(${controllerInstance}));
router.put("/:id", ${controllerInstance}.update.bind(${controllerInstance}));
router.delete("/:id", ${controllerInstance}.delete.bind(${controllerInstance}));
` : ""}export default router;
`;
    await fs.writeFile(path.join(domainPath, "routes.ts"), routesContent);

    // Generate index.ts
    const indexContent = `import router from "./routes.js";
export default router;
`;
    await fs.writeFile(path.join(domainPath, "index.ts"), indexContent);

    // Generate types.ts (basic template)
    const typesContent = `// Auto-generated types for ${interfaceName}

/**
 * Represents the full ${interfaceName} record
 */
export type ${interfaceName}Type = {
  id?: number;
${isGlobal ? "" : "  school_id?: number;\n"}  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new ${interfaceName}
 */
export type Create${interfaceName}Input = Partial<${interfaceName}Type>;

/**
 * Represents the data required to update an existing ${interfaceName}
 */
export type Update${interfaceName}Input = Partial<${interfaceName}Type>;
`;
    await fs.writeFile(path.join(domainPath, "types.ts"), typesContent);

    // Generate errors.ts (basic template)
    const errorsContent = `/**
 * Custom Errors for ${interfaceName}
 * Auto-generated domain error classes
 */
export class ${interfaceName}Error extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "${interfaceName}Error";
  }
}

export class ${interfaceName}NotFoundError extends ${interfaceName}Error {
  constructor(id?: string | number) {
    super("${interfaceName} record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ${interfaceName}ValidationError extends ${interfaceName}Error {
  constructor(message?: string) {
    super(message || "${interfaceName} validation failed", 400);
  }
}

export class ${interfaceName}UnauthorizedError extends ${interfaceName}Error {
  constructor() {
    super("Unauthorized to perform this action on ${interfaceName}", 403);
  }
}

export class ${interfaceName}ConflictError extends ${interfaceName}Error {
  constructor(message: string = "${interfaceName} conflict") {
    super(message, 409);
  }
}

export class ${interfaceName}ForbiddenError extends ${interfaceName}Error {
  constructor() {
    super("Forbidden: insufficient rights for ${interfaceName}", 403);
  }
}
`;
    await fs.writeFile(path.join(domainPath, "errors.ts"), errorsContent);

    // Generate validator.ts (basic template - only for non-global CRUD)
    if (route_type === "crud" && !isGlobal) {
      const validatorContent = `import { z } from "zod";

/**
 * Auto-generated Validator for ${interfaceName}
 */
export const ${interfaceName}Schema = z.object({
  id: z.number().optional(),
  school_id: z.number(),
  name: z.string().min(1),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
}).passthrough();

export type ${interfaceName}Type = z.infer<typeof ${interfaceName}Schema>;
`;
      await fs.writeFile(path.join(domainPath, "validator.ts"), validatorContent);
    }
  }
  console.log("✅ All controllers regenerated with Multi-Tenant context logic.");
  await pool.end();
}
run().catch(console.error);

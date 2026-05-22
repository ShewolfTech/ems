import * as fs from "fs";
import * as path from "path";

const SUBDOMAIN_PATH = "backend/src/domains/userspermissionsmgt/users";

const files = {
  "types.ts": `
import type { Users } from "@ems/shared/db/kysely.generated.js";

export type UsersType = Users;
export type CreateUsersInput = Omit<Users, 'id' | 'created_at' | 'updated_at'> & { password?: string };
export type UpdateUsersInput = Partial<Omit<Users, 'id' | 'auth_uid'>>;
  `,

  "validator.ts": `
import { z } from "zod";

export const UsersSchema = z.object({
  school_id: z.coerce.number().int().positive("School ID is required"),
  username: z.string().min(3).trim().toLowerCase(),
  email: z.string().email().toLowerCase().trim(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().nullable().optional(),
  role_id: z.coerce.number().int().nullable().optional(),
  date_of_birth: z.coerce.date().nullable().optional(),
  nationality: z.string().default('Ugandan').optional(),
  password: z.string().min(6).optional(), 
});

export const UpdateProfileSchema = z.object({
  phone: z.string().nullable().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  date_of_birth: z.coerce.date().nullable().optional(),
  nationality: z.string().optional(),
});

export type UsersInput = z.infer<typeof UsersSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
  `,

  "service.ts": `
import bcrypt from "bcrypt";
import { db } from "../../../config/infra/database.js";
import { UsersSchema, UsersInput, UpdateProfileSchema, UpdateProfileInput } from "./validator.js";
import { supabaseClient as supabaseAdmin } from "../../../config/infra/supabaseClient.js";

export class UsersService {
  async create(data: UsersInput) {
    const validated = UsersSchema.parse(data);
    let authUid: string;

    // 1. Sync with Supabase Identity
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingIdentity = listData?.users.find(u => u.email === validated.email);

    const rawPassword = validated.password || "WelcomeToEMS2026!";

    if (existingIdentity) {
      authUid = existingIdentity.id;
    } else {
      const { data: newAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: validated.email,
        password: rawPassword,
        email_confirm: true,
        user_metadata: { displayName: \`\${validated.first_name} \${validated.last_name}\` }
      });

      if (authError) throw new Error(\`Auth Sync Failed: \${authError.message}\`);
      authUid = newAuth.user.id;
    }

    // 2. Hash password for local Postgres Auth compatibility
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 3. Insert into local DB
    return await db.insertInto("users" as any)
      .values({
        school_id: validated.school_id,
        auth_uid: authUid,
        username: validated.username,
        email: validated.email,
        password: hashedPassword, // ✅ Fixed: Using updated column name
        first_name: validated.first_name,
        last_name: validated.last_name,
        phone: validated.phone,
        role_id: validated.role_id,
        date_of_birth: validated.date_of_birth,
        nationality: validated.nationality,
        is_active: true,
        is_deleted: false
      } as any)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

async findAll(schoolId: number) {
  if (!schoolId) return []; // 🛑 Guard

  return await db.selectFrom("users" as any)
    .selectAll()
    .where("school_id", "=", Number(schoolId))
    .where("is_deleted", "=", false)
    .execute();
}

async findById(id: number, schoolId: number) {
  if (!schoolId) throw new Error("School context required");

  return await db.selectFrom("users" as any)
    .selectAll()
    .where("id", "=", Number(id))
    .where("school_id", "=", Number(schoolId))
    .where("is_deleted", "=", false)
    .executeTakeFirst();
}

async updateProfile(userId: number, schoolId: number, data: UpdateProfileInput) {
  if (!schoolId) throw new Error("School context required");

  const validated = UpdateProfileSchema.parse(data);

  await db.updateTable("users" as any)
    .set({ ...validated, updated_at: new Date() })
    .where("id", "=", userId)
    .where("school_id", "=", schoolId)
    .where("is_deleted", "=", false)
    .execute();

  return { success: true };
}

export const usersService = new UsersService();
  `,

  "controller.ts": `
import { Request, Response } from "express";
import { usersService } from "./service.js";

export class UsersController {
  async getAll(req: Request, res: Response) {
    try {
      // 1. Extract from req.user (attached by authMiddleware)
      // Standardizing to camelCase 'schoolId' to match your middleware
      const schoolId = (req as any).user?.schoolId; 

      if (!schoolId) {
        return res.status(403).json({ 
          success: false, 
          message: "Unauthorized: School context missing from session." 
        });
      }

      // 2. Call the service with the explicit ID
      // This forces the SQL: WHERE school_id = Number(schoolId)
      const result = await usersService.findAll(Number(schoolId));
      
      // Wrap in { success: true, data: [...] } for the frontend hook
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const schoolId = (req as any).user?.schoolId;
      if (!schoolId) return res.status(403).json({ success: false, message: "School context missing" });

      const result = await usersService.create({ 
        ...req.body, 
        school_id: Number(schoolId) 
      });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const schoolId = (req as any).user?.schoolId;

      if (!schoolId || !userId) {
        return res.status(403).json({ success: false, message: "User or School context missing" });
      }

      const result = await usersService.updateProfile(
        Number(userId), 
        Number(schoolId), 
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const usersController = new UsersController();
 `,

  "routes.ts": `
import { Router } from "express";
import { usersController } from "./controller.js";
import { authMiddleware } from "../../../middleware/security/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, usersController.getAll.bind(usersController));
router.post("/", authMiddleware, usersController.create.bind(usersController));
router.put("/profile", authMiddleware, usersController.updateProfile.bind(usersController));

export default router;
  `,

  "index.ts": `
import router from "./routes.js";
export default router;
  `,
};

async function buildSubdomain() {
  console.log("🛠️  Updating Users Subdomain with password-sync logic...");

  if (!fs.existsSync(SUBDOMAIN_PATH)) {
    fs.mkdirSync(SUBDOMAIN_PATH, { recursive: true });
  }

  Object.entries(files).forEach(([fileName, content]) => {
    const filePath = path.join(SUBDOMAIN_PATH, fileName);
    fs.writeFileSync(filePath, content.trim() + "\n");
    console.log("✅ Created/Updated: " + fileName);
  });

  console.log("✨ Done. Backend Users logic is now fully compatible with Auth.");
}

buildSubdomain();
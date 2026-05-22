import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const BACKEND_VALIDATOR = path.join(projectRoot, "backend/src/domains/auth/validator.ts");
const FRONTEND_VALIDATOR = path.join(projectRoot, "frontend/src/domains/auth/validator.ts");

const validatorContent = `
import { z } from "zod";

export const LoginSchema = z.object({
  identifier: z.string().min(3, "Username or Email is too short"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  schoolId: z.number().int(), 
});

export const RegisterSchema = z.object({
  username: z.string().min(3, "Username is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  schoolId: z.number(),
  firstName: z.string().min(2, "First name is required"), 
  lastName: z.string().min(2, "Last name is required"),   
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export const AuthSchema = LoginSchema;
`;

async function run() {
  try {
    await fs.mkdir(path.dirname(BACKEND_VALIDATOR), { recursive: true });
    await fs.mkdir(path.dirname(FRONTEND_VALIDATOR), { recursive: true });
    await fs.writeFile(BACKEND_VALIDATOR, validatorContent.trim());
    await fs.writeFile(FRONTEND_VALIDATOR, validatorContent.trim());
    console.log("✅ Validators updated: firstName/lastName added to 'RegisterInput'.");
  } catch (error) {
    console.error("❌ Failed to update validators:", error);
  }
}
run();
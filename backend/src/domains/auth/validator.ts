import { z } from "zod";

const username = z.string()
  .min(3, "Username is too short")
  .transform((val: string) => val.trim().toLowerCase());

const password = z.string()
  .min(6, "Password must be at least 6 characters");

const schoolId = z.number().int().positive("Invalid School ID");

export const LoginSchema = z.object({
  identifier: z.string().min(3, "Username or Email is too short").trim(),
  password,
  schoolId,
});

export const RegisterSchema = z.object({
  username,
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password,
  schoolId,
  firstName: z.string().min(2, "First name is required").trim(),
  lastName: z.string().min(2, "Last name is required").trim(),
  roleId: z.number().int().optional().default(2),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export const AuthSchema = LoginSchema;
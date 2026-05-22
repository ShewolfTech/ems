import { SignJWT } from "jose";
import { randomUUID } from "crypto";
import { supabaseClient as supabase, supabaseAdmin } from "../../config/infra/supabaseClient.js";
import { db } from "../../config/infra/database.js";
import { env } from "../../config/infra/env.js";
import { InvalidCredentialsError } from "./errors.js";
import { LoginInput, RegisterInput } from "./validator.js";
import { enrichUserMetadata } from "../auth/enrichUserMetadata.js";
import { AuthConfig } from "./config.js";

export interface SchoolMeta {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

export interface UserProfile {
  id: number;
  auth_uid: string | null;
  email: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  school_id: number | null;
  role_id: number | null;
}

export class AuthService {
  /**
   * Get user profile from public.users by authUid (from Supabase Auth)
   */
  async getUserProfileByAuthUid(authUid: string): Promise<UserProfile | undefined> {
    const result = await db
      .selectFrom("users" as any)
      .select([
        "id",
        "auth_uid",
        "email",
        "username",
        "first_name",
        "last_name",
        "school_id",
        "role_id",
      ] as any)
      .where("auth_uid", "=", authUid)
      .where("is_deleted", "=", false)
      .executeTakeFirst();
    return result as UserProfile | undefined;
  }

  /**
   * Get user profile by schoolId + email/username (for finding user before auth)
   */
  async getUserProfileByIdentifier(identifier: string, schoolId: number): Promise<UserProfile | undefined> {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    // Convert schoolId to string for comparison (database stores as string)
    const schoolIdStr = String(schoolId);
    const result = await db
      .selectFrom("users" as any)
      .select([
        "id",
        "auth_uid",
        "email",
        "username",
        "first_name",
        "last_name",
        "school_id",
        "role_id",
      ] as any)
      .where(isEmail ? "email" : "username", "=", identifier)
      .where("school_id", "=", schoolIdStr as any)
      .where("is_deleted", "=", false as any)
      .executeTakeFirst();
    return result as UserProfile | undefined;
  }

  async login(input: LoginInput): Promise<{ success: boolean; data: any }> {
    console.log('[AUTH] Login attempt:', { identifier: input.identifier, schoolId: input.schoolId });
    
    // First, get the user profile to find their authUid
    const userProfile = await this.getUserProfileByIdentifier(
      input.identifier,
      input.schoolId
    );

    console.log('[AUTH] User profile found:', userProfile);
    
    if (!userProfile) {
      console.log('[AUTH] No user found for identifier:', input.identifier, 'schoolId:', input.schoolId);
      throw new InvalidCredentialsError();
    }
    if (!userProfile.auth_uid) {
      console.log('[AUTH] User has no auth_uid:', userProfile);
      throw new Error("User not linked to Supabase Auth. Please contact admin.");
    }

    // Use Supabase Auth to validate credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userProfile.email || input.identifier,
      password: input.password,
    });

    if (authError) {
      console.error("Supabase Auth error:", authError);
      throw new InvalidCredentialsError();
    }

    // Get metadata from public.users
    const metadata = await enrichUserMetadata(
      userProfile.email || input.identifier,
      input.schoolId,
      userProfile.id
    );

    // Validate school_id exists
    if (!userProfile.school_id) {
      console.error('[AUTH] User has no school_id in profile:', userProfile);
      throw new Error("User profile is not associated with a school. Please contact admin.");
    }

    // Generate custom JWT with user data (for use with our middleware)
    const sessionId = randomUUID();
    const secret = new TextEncoder().encode(AuthConfig.jwtSecret);

    console.log('[AUTH] Generating token with schoolId:', userProfile.school_id);

    const token = await new SignJWT({
      sub: String(userProfile.id),
      userId: userProfile.id,
      email: userProfile.email,
      auth_uid: userProfile.auth_uid,
      schoolId: userProfile.school_id,
      role_id: userProfile.role_id,
      sessionId: sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    const displayName = userProfile.first_name
      ? `${userProfile.first_name} ${userProfile.last_name ?? ""}`.trim()
      : (userProfile.username ?? userProfile.email);

    const school = metadata.school as SchoolMeta | null;

    // WRAPPING IN SUCCESS & DATA TO MATCH FRONTEND EXPECTATIONS
    return {
      success: true,
      data: {
        token,
        user: {
          id: userProfile.id,
          authUid: userProfile.auth_uid,
          email: userProfile.email,
          username: userProfile.username,
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          schoolId: userProfile.school_id,
          roleId: userProfile.role_id,
          displayName,
          schoolName: school?.name ?? "",
          schoolCode: school?.code ?? "",
          schoolAddress: school?.address ?? "",
          schoolPhone: school?.phone ?? "",
          schoolEmail: school?.email ?? "",
          schoolLogo: school?.logo ?? "",
          permissions: metadata.permissions,
          permissions_meta: metadata.permissions_meta,
        },
      },
    };
  }

  async register(input: RegisterInput) {
    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { username: input.username, school_id: input.schoolId },
      });

    if (authError) throw new Error(authError.message);

    // Insert profile into public.users (linked by auth_uid)
    await db
      .insertInto("users" as any)
      .values({
        auth_uid: authData.user.id,
        email: input.email,
        username: input.username,
        first_name: input.firstName,
        last_name: input.lastName,
        school_id: input.schoolId,
        role_id: input.roleId || 2,
        is_active: true,
        password: "" // Empty - Supabase Auth handles password
      } as any)
      .execute();

    return this.login({
      identifier: input.email, // Use email for login after registration
      password: input.password,
      schoolId: input.schoolId,
    });
  }

  async getMe(userId: number, email: string, schoolId: number, authUid?: string) {
    let user: any;
    
    // If we have authUid, look up by that first
    if (authUid) {
      user = await db
        .selectFrom("users" as any)
        .select([
          "id",
          "auth_uid",
          "school_id",
          "username",
          "email",
          "first_name",
          "last_name",
          "role_id",
        ] as any)
        .where("auth_uid", "=", authUid)
        .where("is_deleted", "=", false)
        .executeTakeFirst();
    }
    
    // Fallback to userId if authUid lookup failed
    if (!user) {
      user = await db
        .selectFrom("users" as any)
        .select([
          "id",
          "auth_uid",
          "school_id",
          "username",
          "email",
          "first_name",
          "last_name",
          "role_id",
        ] as any)
        .where("id", "=", userId)
        .where("is_deleted", "=", false)
        .executeTakeFirst();
    }

    if (!user) throw new Error("User not found");

    const metadata = await enrichUserMetadata(email, schoolId, userId);

    const displayName = user.first_name
      ? `${user.first_name} ${user.last_name ?? ""}`.trim()
      : (user.username ?? user.email);

    return {
      success: true,
      data: {
        ...user,
        displayName,
        schoolName: metadata.school?.name ?? "",
        schoolLogo: metadata.school?.logo ?? "",
        permissions: metadata.permissions,
        permissions_meta: metadata.permissions_meta,
      },
    };
  }
  
  async requestPasswordReset(email: string) {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/login`,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async updatePassword(userId: string, newPassword: string) {
    // Get user's auth_uid from public.users
    const userProfile = await db
      .selectFrom("users" as any)
      .select(["auth_uid"] as any)
      .where("id", "=", Number(userId))
      .executeTakeFirst() as { auth_uid: string } | undefined;

    if (!userProfile?.auth_uid) {
      throw new Error("User not linked to Supabase Auth");
    }

    // Update password in Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userProfile.auth_uid,
      { password: newPassword }
    );

    if (error) throw new Error(error.message);

    return { success: true };
  }
}

export const authService = new AuthService();
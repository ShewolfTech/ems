import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const BACKEND_SERVICE = path.join(projectRoot, "backend/src/domains/auth/service.ts");

const serviceContent = `
import { db } from "../../config/infra/database.js";
import { enrichUserMetadata } from "./enrichUserMetadata.js";
import { LoginInput, RegisterInput } from "./validator.js";
import { AuthSession } from "./types.js";
import { InvalidCredentialsError } from "./errors.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthConfig } from "./config.js";

export class AuthService {
  async login(input: LoginInput): Promise<AuthSession> {
    const user = await db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", input.identifier)
      .where("schoolId", "=", String(input.schoolId)) 
      .executeTakeFirst();

    if (!user || !user.passwordHash) throw new InvalidCredentialsError();

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new InvalidCredentialsError();

    const userEmail = user.email || "";
    const { permissions } = await enrichUserMetadata(userEmail, Number(user.schoolId), user.id);

    const token = jwt.sign(
      { userId: user.id, schoolId: user.schoolId, permissions: permissions },
      AuthConfig.jwtSecret as string,
      { expiresIn: AuthConfig.jwtExpiry as any }
    );

    return {
      token,
      userId: String(user.id),
      sessionId: crypto.randomUUID(),
    };
  }

  async register(input: RegisterInput) {
    const hashedPassword = await bcrypt.hash(input.password, AuthConfig.saltRounds);
    
    return await db.transaction().execute(async (trx) => {
      return await trx
        .insertInto("users")
        .values({
          email: input.email,
          passwordHash: hashedPassword,
          schoolId: String(input.schoolId),
          firstName: input.firstName, 
          lastName: input.lastName,   
          username: input.username || input.email,
        })
        .returning(["id", "email"])
        .executeTakeFirstOrThrow();
    });
  }
}

export const authService = new AuthService();
`;

async function run() {
  try {
    await fs.writeFile(BACKEND_SERVICE, serviceContent.trim());
    console.log("✅ Service updated: Now mapping 'firstName' and 'lastName' to DB.");
  } catch (error) {
    console.error("❌ Failed to update service:", error);
  }
}
run();
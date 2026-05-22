// 📁 scripts/syncDb.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import dotenv from "dotenv";
import chokidar from "chokidar";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const projectRoot = path.resolve(__dirname, "..");
const backendDbPath = path.join(projectRoot, "backend", "src", "db");
const sharedDbPath = path.join(projectRoot, "shared", "src", "db");

function writeFileSafe(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✨ Updated: ${filePath}`);
}

function generateKyselyTypes() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ Skipping Kysely generation: DATABASE_URL not found in backend/.env");
    return;
  }
  try {
    console.log("📡 Introspecting database and generating Kysely types...");
    fs.mkdirSync(sharedDbPath, { recursive: true });
    execSync(
      `pnpm --dir backend exec kysely-codegen --out-file ${path.join(
        sharedDbPath,
        "kysely.generated.ts"
      )} --camel-case`,
      { stdio: "inherit" }
    );
    console.log(`✨ Updated: ${path.join(sharedDbPath, "kysely.generated.ts")}`);
  } catch (err) {
    console.error(
      "❌ Kysely generation failed. Ensure 'pg', 'kysely', and 'kysely-codegen' are installed in backend."
    );
  }
}

async function main() {
  console.log("🚀 Starting Database Layer Sync...");

  // --- 0. Generate kysely.generated.ts directly into shared ---
  generateKyselyTypes();

  // --- 1. pool.ts ---
  const poolContent = `
// Auto-generated database pool
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("🟢 [Database] New client connected to pool");
});

pool.on("error", (err) => {
  console.error("🔴 [Database] Unexpected error on idle client", err);
});
`;
  writeFileSafe(path.join(backendDbPath, "pool.ts"), poolContent);

  // --- 2. queries.ts ---
  const queriesContent = `
// Auto-generated query helpers
import { pool } from "./pool.js";

/**
 * Executes a database query with professional error handling and logging.
 */
export async function runQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(sql, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(\`⚠️ Slow query detected (\${duration}ms): \`, sql);
    }

    return result.rows as T[];
  } catch (error) {
    console.error("❌ [Database Query Error]:", {
      sql,
      params,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}
`;
  writeFileSafe(path.join(backendDbPath, "queries.ts"), queriesContent);

  // --- 3. index.ts ---
  const indexContent = `
// Professional DB Layer Entry Point
export * from "./pool.js";
export * from "./queries.js";
// Note: kysely.generated.ts now lives in shared/src/db
`;
  writeFileSafe(path.join(backendDbPath, "index.ts"), indexContent);

  console.log("\n✅ Database layer updated to professional standards.");
}

// --- Watch Mode ---
if (process.argv.includes("--watch")) {
  console.log("👀 Watching migrations for changes...");
  const migrationsPath = path.join(projectRoot, "migrations");

  chokidar.watch(migrationsPath, { ignoreInitial: true }).on(
    "all",
    (event: string, filePath: string) => {
      console.log(`🔄 Detected ${event} in ${filePath}. Regenerating database layer...`);
      main().catch(console.error);
    }
  );
} else {
  main().catch(console.error);
}

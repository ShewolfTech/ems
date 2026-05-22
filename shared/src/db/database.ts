// shared/src/db/database.ts
import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

const { Pool } = pg;

// --- ESM equivalent of __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Connection Pool ---
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

/**
 * Creates the Kysely instance dynamically
 */
async function createKyselyInstance() {
  const tsPath = path.join(__dirname, "kysely.generated.ts");

  if (!fs.existsSync(tsPath)) {
    throw new Error("Missing kysely.generated.ts file. Run generateKyselyTypes.ts first.");
  }

  const generatedModule = await import(pathToFileURL(tsPath).href);

  return new Kysely<typeof generatedModule.DB>({
    dialect: new PostgresDialect({ pool }),
  });
}

import type { ColumnType } from "kysely";

/**
 * Helper type to unwrap Kysely's ColumnType
 * so generated insert/update types can use raw values.
 */
export type KyselyTable<T> = {
  [K in keyof T]: T[K] extends ColumnType<infer S, any, any> ? S : T[K];
};

// Export the promise so your scripts can await it
export const dbPromise = createKyselyInstance();

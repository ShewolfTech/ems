
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

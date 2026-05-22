import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load the backend .env
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

// Verify variables are loaded before initializing
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env");
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration(file: string) {
  const sql = fs.readFileSync(path.join(__dirname, '../migrations', file), 'utf8');
  const fullSql = `SET statement_timeout = 600000;\n${sql}`;
  console.log(`🔄 Running migration ${file}...`);
  
  const { error } = await supabase.rpc('execute_sql', { sql: fullSql });
  if (error) {
    console.error(`\n❌ Migration FAILED: ${file}`);
    console.error(`\n--- Error Details ---`);
    console.error(`Message: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Details: ${error.details || 'N/A'}`);
    console.error(`Hint: ${error.hint || 'N/A'}`);
    
    // Try to extract the failing statement from SQL
    const sqlLines = sql.split('\n');
    console.error(`\n--- Context (last lines before failure) ---`);
    const contextLines = sqlLines.slice(-20);
    contextLines.forEach((line, i) => {
      console.error(`${sqlLines.length - contextLines.length + i + 1}: ${line}`);
    });
    
    throw error;
  }
  console.log(`✅ Migration ${file} applied successfully`);
}

async function main() {
  // Read all .sql files from migrations folder
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // ensures 0001, 0002, 0003 order

  for (const file of files) {
    await runMigration(file);
  }
}

main().catch(console.error);


/* 

-- Danger: this will remove EVERYTHING in the public schema
DROP SCHEMA public CASCADE;
-- Recreate the schema
CREATE SCHEMA public;
-- Reset search path
SET search_path TO public;


-- Dangerous helper: only for service role migrations
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;


REVOKE ALL ON FUNCTION public.execute_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT CREATE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
*/


import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

// Verify required variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration(file: string) {
  const filePath = path.join(__dirname, '../migrations', file);
  const sql = fs.readFileSync(filePath, 'utf8');

  // Split by semicolon into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`🚀 Running migration: ${file}`);

  for (const stmt of statements) {
    const fullSql = `SET statement_timeout = 600000;\n${stmt}`;
    const { error } = await supabase.rpc('execute_sql', { sql: fullSql });
    if (error) {
      throw new Error(`❌ Failed on statement:\n${stmt}\nError: ${error.message}`);
    }
    console.log(`✅ Statement applied: ${stmt.substring(0, 60)}...`);
  }

  console.log(`🎉 Migration ${file} applied successfully`);
}

async function main() {
  await runMigration('99999_alterations_in_the_app.sql');
}

main().catch(err => {
  console.error('❌ Migration process failed:', err);
  process.exit(1);
});

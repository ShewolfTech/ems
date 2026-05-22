import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const { Pool } = pg;

async function checkUsersWithoutAuth() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query(`
      SELECT id, email, username, auth_uid, school_id
      FROM users
      WHERE auth_uid IS NULL AND is_deleted = false
    `);

    console.log(`Found ${result.rows.length} users without auth_uid:`);
    result.rows.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Username: ${u.username}, School: ${u.school_id}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUsersWithoutAuth();
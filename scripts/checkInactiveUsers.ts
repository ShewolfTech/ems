import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const databaseUrl = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString: databaseUrl });

async function checkInactiveUsers() {
  const result = await pool.query(
    `SELECT id, email, username, school_id, auth_uid, is_active, is_deleted 
     FROM public.users 
     WHERE is_active = false OR is_deleted = true 
     ORDER BY is_deleted DESC, is_active ASC`
  );
  
  console.log(`Found ${result.rows.length} inactive/deleted users:\n`);
  result.rows.forEach(u => {
    console.log(`ID: ${u.id}, Email: ${u.email}, Username: ${u.username}, School: ${u.school_id}, Active: ${u.is_active}, Deleted: ${u.is_deleted}, AuthUID: ${String(u.auth_uid)}`);
  });
  
  await pool.end();
}

checkInactiveUsers().catch(console.error);

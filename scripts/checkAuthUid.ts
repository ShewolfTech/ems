import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const databaseUrl = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString: databaseUrl });

async function checkUsers() {
  // Count all users
  const totalResult = await pool.query('SELECT COUNT(*) FROM public.users');
  const total = totalResult.rows[0].count;
  
  // Count with auth_uid set
  const withAuthResult = await pool.query('SELECT COUNT(*) FROM public.users WHERE auth_uid IS NOT NULL');
  const withAuth = withAuthResult.rows[0].count;
  
  console.log(`Total users: ${total}`);
  console.log(`With auth_uid: ${withAuth}`);
  console.log(`Without auth_uid: ${total - withAuth}\n`);
  
  // Show the first few users without auth_uid
  const nullResult = await pool.query(
    `SELECT id, email, username, school_id, auth_uid, is_active, is_deleted 
     FROM public.users 
     WHERE auth_uid IS NULL 
     LIMIT 10`
  );
  
  console.log(`Users with NULL auth_uid (first 10):`);
  nullResult.rows.forEach(u => {
    console.log(`ID: ${u.id}, Email: ${u.email}, Username: ${u.username}, School: ${u.school_id}, Active: ${u.is_active}, Deleted: ${u.is_deleted}`);
  });
  
  // Check for any weird empty string values
  try {
    const emptyResult = await pool.query(
      `SELECT id, email, username FROM public.users WHERE auth_uid::text = ''`
    );
    if (emptyResult.rows.length > 0) {
      console.log(`\nUsers with empty-string auth_uid:`);
      emptyResult.rows.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}`));
    } else {
      console.log(`\nNo users with empty-string auth_uid`);
    }
  } catch (e) {
    console.log(`\nCould not query empty-string auth_uid (likely none): ${e}`);
  }
  
  await pool.end();
}

checkUsers().catch(console.error);

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });

async function checkUser() {
  // Check specific user
  const result = await pool.query(`
    SELECT id, email, username, school_id, auth_uid 
    FROM users 
    WHERE email = 'david.okello@school.edu.ug'
  `);
  
  console.log('User details:');
  console.log(result.rows);
  
  await pool.end();
}

checkUser();

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const databaseUrl = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString: databaseUrl });

async function checkSchool() {
  const schoolId = 10001;
  const result = await pool.query(
    'SELECT id, name, code FROM public.schools WHERE id = $1',
    [schoolId]
  );
  console.log('School lookup:', result.rows);
  await pool.end();
}
checkSchool().catch(console.error);

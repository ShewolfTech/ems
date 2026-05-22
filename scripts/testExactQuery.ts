import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const databaseUrl = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString: databaseUrl });

async function testExactQuery() {
  const userId = 1;
  const schoolId = 10001;
  
  // Check user_permissions active count
  const upCount = await pool.query(`
    SELECT COUNT(*) 
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = $1 
      AND up.school_id = $2 
      AND up.is_allowed = true 
      AND up.is_active = true
      AND p.is_deleted = false 
      AND p.is_active = true
  `, [userId, schoolId]);
  console.log('Active user_permissions count:', upCount.rows[0].count);
  
  // Check if any user_permissions have is_active = false or p.is_active = false
  const inactiveUP = await pool.query(`
    SELECT up.id, up.is_active, p.is_active as perm_active
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = $1 AND up.school_id = $2
    LIMIT 5
  `, [userId, schoolId]);
  console.log('Sample user_permissions:', inactiveUP.rows);
  
  // Check role_permissions
  const rpCount = await pool.query(`
    SELECT COUNT(*)
    FROM public.role_permissions rp2
    JOIN public.permissions p ON p.permission_key = rp2.permission_key
    WHERE rp2.role_id = 6 
      AND rp2.school_id = $1
      AND rp2.is_active = true
      AND p.is_deleted = false
      AND p.is_active = true
  `, [schoolId]);
  console.log('Active role_permissions count:', rpCount.rows[0].count);
  
  await pool.end();
}

testExactQuery().catch(console.error);

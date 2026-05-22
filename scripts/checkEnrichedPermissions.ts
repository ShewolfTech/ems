import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const databaseUrl = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString: databaseUrl });

async function checkEnrichedPermissions() {
  const email = 'teacher1@nakwero.edu.ug';
  const schoolId = 10001; // The school they log into
  
  // Get user
  const userResult = await pool.query(
    'SELECT id, school_id, role_id FROM public.users WHERE email = $1 AND is_deleted = false',
    [email]
  );
  if (userResult.rows.length === 0) {
    console.log('User not found');
    return;
  }
  const user = userResult.rows[0];
  const userId = user.id;
  
  console.log('User:', user);
  
  // Exact query from enrichUserMetadata (user_permissions branch)
  const userPerms = await pool.query(`
    SELECT
        p.module,
        p.resource,
        p.action,
        p.permission_key AS "fullCode",
        rp.route,
        rp.display_name AS "displayName",
        rp.icon,
        rp.is_menu_item,
        rp.display_order,
        rp.group_name,
        p.module AS "moduleName"
    FROM public.user_permissions up
    INNER JOIN public.permissions p ON p.id = up.permission_id
    LEFT JOIN public.route_permissions rp ON rp.permission_key = p.permission_key
    WHERE up.user_id = $1
      AND up.school_id = $2
      AND up.is_allowed = true
      AND up.is_active = true
      AND p.is_deleted = false
      AND p.is_active = true
    ORDER BY p.module, rp.display_order ASC
  `, [userId, schoolId]);
  
  console.log(`\nUser permissions (filtered): ${userPerms.rows.length} rows`);
  userPerms.rows.slice(0, 5).forEach(p => {
    console.log(`  - ${p.fullCode} | route: ${p.route} | menu: ${p.is_menu_item}`);
  });
  
  // If none, check raw counts
  if (userPerms.rows.length === 0) {
    const rawCount = await pool.query(
      'SELECT COUNT(*) FROM public.user_permissions WHERE user_id = $1 AND school_id = $2 AND is_allowed = true AND is_active = true',
      [userId, schoolId]
    );
    console.log(`Raw active user_permissions count: ${rawCount.rows[0].count}`);
    
    const permCheck = await pool.query(`
      SELECT COUNT(*) 
      FROM public.user_permissions up
      JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = $1 AND up.school_id = $2
        AND up.is_allowed = true AND up.is_active = true
        AND p.is_deleted = false AND p.is_active = true
    `, [userId, schoolId]);
    console.log(`After permission filter: ${permCheck.rows[0].count}`);
  }
  
  // Role permissions query (with fixed join)
  const rolePerms = await pool.query(`
    SELECT
        p.module,
        p.resource,
        p.action,
        p.permission_key AS "fullCode",
        rp.route,
        rp.display_name AS "displayName",
        rp.icon,
        rp.is_menu_item,
        rp.display_order,
        rp.group_name,
        p.module AS "moduleName"
    FROM public.role_permissions rp2
    INNER JOIN public.permissions p ON p.permission_key = rp2.permission_key
    LEFT JOIN public.route_permissions rp ON rp.permission_key = p.permission_key
    WHERE rp2.role_id = $1
      AND rp2.school_id = $2
      AND rp2.is_active = true
      AND p.is_deleted = false
      AND p.is_active = true
    ORDER BY p.module, rp.display_order ASC
  `, [user.role_id, schoolId]);
  
  console.log(`\nRole permissions: ${rolePerms.rows.length} rows`);
  rolePerms.rows.slice(0, 5).forEach(p => {
    console.log(`  - ${p.fullCode} | route: ${p.route} | menu: ${p.is_menu_item}`);
  });
  
  await pool.end();
}

checkEnrichedPermissions().catch(console.error);

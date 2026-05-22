import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const databaseUrl = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString: databaseUrl });

async function checkPermissions() {
  const email = 'teacher1@nakwero.edu.ug';
  
  // Look up user
  const userResult = await pool.query(
    'SELECT id, school_id, role_id FROM public.users WHERE email = $1 AND is_deleted = false',
    [email]
  );
  
  if (userResult.rows.length === 0) {
    console.log('User not found');
    return;
  }
  
  const user = userResult.rows[0];
  console.log('User:', user);
  
  // Check user_permissions
  const userPerms = await pool.query(`
    SELECT up.*, p.permission_key, rp.route, rp.display_name, rp.is_menu_item
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    LEFT JOIN public.route_permissions rp ON rp.permission_key = p.permission_key
    WHERE up.user_id = $1 AND up.school_id = $2 AND up.is_allowed = true
    ORDER BY p.module, rp.display_order
  `, [user.id, user.school_id]);
  
  console.log(`\nUser permissions: ${userPerms.rows.length} rows`);
  userPerms.rows.forEach(p => {
    console.log(`  - ${p.permission_key} | route: ${p.route} | menu: ${p.is_menu_item}`);
  });
  
  // Check role_permissions
  const rolePerms = await pool.query(`
    SELECT rp2.*, p.permission_key, rp.route, rp.display_name, rp.is_menu_item
    FROM public.role_permissions rp2
    JOIN public.permissions p ON p.id = rp2.permission_id
    LEFT JOIN public.route_permissions rp ON rp.permission_key = p.permission_key
    WHERE rp2.role_id = $1 AND rp2.school_id = $2 AND rp2.is_allowed = true
    ORDER BY p.module, rp.display_order
  `, [user.role_id, user.school_id]);
  
  console.log(`\nRole permissions (role ${user.role_id}): ${rolePerms.rows.length} rows`);
  rolePerms.rows.forEach(p => {
    console.log(`  - ${p.permission_key} | route: ${p.route} | menu: ${p.is_menu_item}`);
  });
  
  await pool.end();
}

checkPermissions().catch(console.error);

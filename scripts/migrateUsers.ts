// 📁 scripts/migrateUsers.ts
import pg from "pg";
import bcrypt from "bcryptjs"; // portable bcrypt implementation

const { Pool } = pg;

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  });

  try {
    // 1. Generate bcrypt hash for default password
    const defaultPassword = "changeme123"; // temporary password
    const saltRounds = 10;
    const hash = await bcrypt.hash(defaultPassword, saltRounds);

    console.log("🔑 Using bcrypt hash:", hash);

    // 2. Insert into auth.users
    await pool.query(`
      INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, created_at, updated_at)
      SELECT
        gen_random_uuid(),
        u.email,
        $1::text,
        jsonb_build_object('username', u.username),
        NOW(),
        NOW()
      FROM public.users u
      WHERE u.email IS NOT NULL
      ON CONFLICT (email) DO NOTHING;
    `, [hash]);

    console.log("✅ Inserted public.users into auth.users");

    // 3. Update public.users.auth_uid
    await pool.query(`
      UPDATE public.users p
      SET auth_uid = a.id
      FROM auth.users a
      WHERE p.email = a.email;
    `);

    console.log("✅ Linked public.users.auth_uid to auth.users.id");
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message || err);
  } finally {
    await pool.end();
  }
}

main();

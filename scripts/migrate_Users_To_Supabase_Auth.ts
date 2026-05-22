/**
 * Migration Script: Migrate users from local password auth to Supabase Auth
 * 
 * This script:
 * 1. Finds all users in public.users (with or without authUid)
 * 2. Creates entries in Supabase Auth with password "Password123" for users without authUid
 * 3. Updates public.users with the new authUid
 * 
 * Usage: npx ts-node-esm scripts/migrate_Users_To_Supabase_Auth.ts
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

// Admin client for creating users
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Direct PostgreSQL client
const pool = new pg.Pool({ connectionString: databaseUrl });

const DEFAULT_PASSWORD = 'Password123';

interface UserRecord {
  id: number;
  email: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  school_id: number | null;
  role_id: number | null;
  auth_uid: string | null;
}

async function migrateUsers() {
  console.log('🔄 Starting user migration to Supabase Auth...\n');
  console.log(`📝 Default password for all users will be: ${DEFAULT_PASSWORD}\n`);

  try {
    // Get all users who don't have authUid
    const result = await pool.query<UserRecord>(
      'SELECT id, email, username, first_name, last_name, school_id, role_id, auth_uid FROM public.users WHERE auth_uid IS NULL'
    );

    const usersToMigrate = result.rows;
    console.log(`📊 Found ${usersToMigrate.length} users to migrate\n`);

    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration!');
      
      // Let's also verify existing links
      const allUsers = await pool.query('SELECT id, email, auth_uid FROM public.users');
      const withAuth = allUsers.rows.filter((u: any) => u.auth_uid).length;
      console.log(`📊 Total users: ${allUsers.rows.length}, with auth_uid: ${withAuth}`);
      await pool.end();
      return;
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const user of usersToMigrate) {
      try {
        // Skip users without email
        if (!user.email) {
          console.log(`⚠️  Skipping user ${user.id} (${user.username}): no email`);
          failCount++;
          continue;
        }

        console.log(`🔄 Migrating: ${user.email} (ID: ${user.id})...`);

        // Create user in Supabase Auth with default password
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            school_id: user.school_id
          }
        });

        if (authError) {
          // Check if user already exists in Supabase Auth
          if (authError.message.includes('already been registered')) {
            console.log(`⚠️  User ${user.email} already exists in Supabase Auth`);
            
            // Try to find the existing user
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = existingUsers?.users.find(u => u.email === user.email);
            
            if (existingUser) {
              // Update the record with existing authUid
              await pool.query(
                'UPDATE public.users SET auth_uid = $1 WHERE id = $2',
                [existingUser.id, user.id]
              );
              console.log(`✅ Linked existing Supabase user: ${existingUser.id}`);
              successCount++;
              continue;
            }
          }
          
          console.log(`❌ Error creating user ${user.email}: ${authError.message}`);
          errors.push(`${user.email}: ${authError.message}`);
          failCount++;
          continue;
        }

        // Update the user record with the new authUid
        await pool.query(
          'UPDATE public.users SET auth_uid = $1 WHERE id = $2',
          [authData.user.id, user.id]
        );

        console.log(`✅ Successfully migrated: ${user.email} -> ${authData.user.id}`);
        successCount++;

      } catch (err: any) {
        console.log(`❌ Error processing user ${user.id}: ${err.message}`);
        errors.push(`${user.email || user.id}: ${err.message}`);
        failCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(e => console.log(`   - ${e}`));
    }

    // Final status
    const finalUsers = await pool.query('SELECT id, email, auth_uid FROM public.users');
    const withAuth = finalUsers.rows.filter((u: any) => u.auth_uid).length;
    console.log(`\n📊 Final: ${withAuth}/${finalUsers.rows.length} users have auth_uid`);

  } catch (err: any) {
    console.error('💥 Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

// Run the migration
migrateUsers().then(() => {
  console.log('\n✨ Migration complete!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});

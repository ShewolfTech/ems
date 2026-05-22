import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env");
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  }
);

/**
 * Phase 0: Sync/Reset
 * Since you manually deleted auth.users, we need to nullify the auth_uid 
 * in the public.users table so the script knows they need new accounts.
 */
async function resetPublicAuthLinks() {
  console.log('--- Phase 0: Syncing Public Table with Auth State ---');
  
  // Get all current valid auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('❌ Error listing auth users:', authError.message);
    return;
  }

  const validAuthIds = authUsers.users.map(u => u.id);
  console.log(`Found ${validAuthIds.length} valid accounts in Supabase Auth.`);

  // Find users in public.users that have an auth_uid NOT in the valid list
  const { data: linkedUsers, error: fetchError } = await supabase
    .from('users')
    .select('id, auth_uid')
    .not('auth_uid', 'is', null);

  if (fetchError) {
    console.error('❌ Error fetching public users:', fetchError.message);
    return;
  }

  const invalidLinks = linkedUsers.filter(u => !validAuthIds.includes(u.auth_uid!));

  if (invalidLinks.length > 0) {
    console.log(`🧹 Found ${invalidLinks.length} stale links in public.users. Resetting them...`);
    const { error: updateError } = await supabase
      .from('users')
      .update({ auth_uid: null })
      .in('id', invalidLinks.map(u => u.id));

    if (updateError) {
      console.error('❌ Failed to reset stale links:', updateError.message);
    } else {
      console.log('✅ Stale links cleared.');
    }
  } else {
    console.log('✅ No stale links found.');
  }
}

/**
 * Phase 1: Create missing Auth accounts
 * Scans public.users for any record missing an auth_uid and creates an account.
 */
async function createAuthUsers() {
  console.log('--- Phase 1: Generating New Auth Accounts ---');
  
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, username, auth_uid, is_deleted')
    .is('auth_uid', null); 

  if (error) {
    console.error('❌ Error fetching users table:', error.message);
    return;
  }

  console.log(`📊 Database Status:`);
  console.log(`   - Total users in table: ${totalUsers}`);
  console.log(`   - Users needing auth accounts: ${users?.length || 0}`);

  if (!users || users.length === 0) {
    console.log('✅ All users already have auth_uids linked.');
    return;
  }

  for (const user of users) {
    if (!user.email) {
      console.warn(`⚠️ Skipping ${user.username} (ID: ${user.id}): No email provided.`);
      continue;
    }

    console.log(`Creating auth for: ${user.email} (Username: ${user.username})...`);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'TempPass123!',
      email_confirm: true,
      user_metadata: {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      },
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
         console.log(`ℹ️ Email ${user.email} already exists in Auth. Linking...`);
         const { data: existingUsers } = await supabase.auth.admin.listUsers();
         const existingUser = existingUsers.users.find(u => u.email === user.email);
         
         if (existingUser) {
            await supabase.from('users').update({ auth_uid: existingUser.id }).eq('id', user.id);
            console.log(`✨ Linked existing Auth ID for ${user.email}`);
            continue;
         }
      }
      console.error(`❌ Auth creation failed for ${user.email}:`, authError.message);
      continue;
    }

    if (authData.user) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ auth_uid: authData.user.id })
        .eq('id', user.id);

      if (updateError) {
        console.error(`❌ Link failed for ${user.email}:`, updateError.message);
      } else {
        console.log(`✨ Success: Linked ${user.email} to UID ${authData.user.id}`);
      }
    }
  }
}

async function main() {
  await resetPublicAuthLinks();
  await createAuthUsers();
  console.log('--- All operations completed ---');
}

main().catch(console.error);
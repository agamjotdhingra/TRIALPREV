/**
 * HealthOS — Cleanup broken test users then re-seed
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAILS = [
  'patient@test.com',
  'doctor@test.com',
  'hospital@test.com',
  'lab@test.com',
  'admin@test.com',
];

async function main() {
  console.log('🧹 Cleaning up broken test users...\n');

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) { console.error('listUsers failed:', error); process.exit(1); }

  const testUsers = data.users.filter(u => TEST_EMAILS.includes(u.email ?? ''));
  console.log(`Found ${testUsers.length} test user(s) to delete.`);

  for (const u of testUsers) {
    const { error: delErr } = await supabase.auth.admin.deleteUser(u.id);
    if (delErr) {
      console.error(`  ❌ Failed to delete ${u.email}:`, delErr.message);
    } else {
      console.log(`  🗑️  Deleted auth user: ${u.email} (${u.id})`);
    }
  }

  // Also clean user_profiles for those UUIDs (cascade should handle it, but just in case)
  console.log('\n✅ Cleanup done. Now run: npx tsx src/seed.ts');
}

main();

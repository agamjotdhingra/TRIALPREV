/**
 * HealthOS — Test Seed Script
 * Usage: npx tsx src/seed.ts  (from backend/ directory)
 *
 * Creates one test user per role using the Supabase Admin API.
 * All accounts use password: Test@1234
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = 'Test@1234';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
async function createAuthUser(email: string, role: string) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find(u => u.email === email);
  if (found) {
    console.log(`  ⚠️  Auth user already exists: ${email} (id: ${found.id})`);
    return found;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,        // mark email as confirmed — no email needed
    app_metadata: { role },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create auth user ${email}: ${error?.message}`);
  }
  return data.user;
}

async function upsertProfile(userId: string, role: string, entityId: number | null, fullName: string) {
  const { error } = await supabase.from('user_profiles').upsert(
    { id: userId, role, entity_id: entityId, full_name: fullName },
    { onConflict: 'id' }
  );
  if (error) throw new Error(`user_profiles upsert failed: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────
// Seeders per role
// ─────────────────────────────────────────────────────────────
async function seedPatient() {
  console.log('\n👤 Seeding Patient — patient@test.com');
  const user = await createAuthUser('patient@test.com', 'patient');

  // Upsert patient record
  const { data: patient, error } = await supabase
    .from('patients')
    .upsert({
      health_id:      'HID-TEST-001',
      full_name:      'Alice Patient',
      mobile:         '9000000001',
      email:          'patient@test.com',
      date_of_birth:  '1992-05-15',
      gender:         'female',
      blood_group:    'O+',
      height:         165,
      weight:         60,
      bmi:            22.0,
      health_score:   90,
      risk_level:     'healthy',
    }, { onConflict: 'health_id' })
    .select()
    .single();

  if (error || !patient) throw new Error(`patients upsert failed: ${error?.message}`);

  await upsertProfile(user.id, 'patient', patient.id, 'Alice Patient');

  // Set custom claims
  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'patient', entity_id: patient.id },
  });

  console.log(`  ✅ patient@test.com  |  Health ID: ${patient.health_id}  |  entity_id: ${patient.id}`);
}

async function seedDoctor() {
  console.log('\n🩺 Seeding Doctor — doctor@test.com');
  const user = await createAuthUser('doctor@test.com', 'doctor');

  const { data: doctor, error } = await supabase
    .from('doctors')
    .upsert({
      full_name:           'Dr. Bob Smith',
      email:               'doctor@test.com',
      mobile:              '9000000002',
      specialization:      'General Medicine',
      qualification:       'MBBS, MD',
      years_of_experience: 8,
      license_number:      'LIC-TEST-002',
      consultation_fees:   500,
      bio:                 'Test doctor account for development.',
      verification_status: 'approved',
    }, { onConflict: 'email' })
    .select()
    .single();

  if (error || !doctor) throw new Error(`doctors upsert failed: ${error?.message}`);

  await upsertProfile(user.id, 'doctor', doctor.id, 'Dr. Bob Smith');

  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'doctor', entity_id: doctor.id },
  });

  console.log(`  ✅ doctor@test.com  |  entity_id: ${doctor.id}`);
}

async function seedHospitalAdmin() {
  console.log('\n🏥 Seeding Hospital Admin — hospital@test.com');
  const user = await createAuthUser('hospital@test.com', 'hospital_admin');

  const { data: hospital, error } = await supabase
    .from('hospitals')
    .upsert({
      name:                'Test General Hospital',
      registration_number: 'REG-HOSP-003',
      address:             '123 Health St, Medical City',
      mobile:              '9000000003',
      email:               'hospital@test.com',
      total_beds:          100,
    }, { onConflict: 'registration_number' })
    .select()
    .single();

  if (error || !hospital) throw new Error(`hospitals upsert failed: ${error?.message}`);

  await upsertProfile(user.id, 'hospital_admin', hospital.id, 'Carol Hospital Admin');

  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'hospital_admin', entity_id: hospital.id },
  });

  console.log(`  ✅ hospital@test.com  |  entity_id: ${hospital.id}`);
}

async function seedLabAdmin() {
  console.log('\n🔬 Seeding Lab Admin — lab@test.com');
  const user = await createAuthUser('lab@test.com', 'lab_admin');

  const { data: lab, error } = await supabase
    .from('labs')
    .upsert({
      name:                'Test Diagnostics Lab',
      registration_number: 'REG-LAB-004',
      contact_person:      'Dave Lab Admin',
      mobile:              '9000000004',
      email:               'lab@test.com',
      verification_status: 'approved',
    }, { onConflict: 'registration_number' })
    .select()
    .single();

  if (error || !lab) throw new Error(`labs upsert failed: ${error?.message}`);

  await upsertProfile(user.id, 'lab_admin', lab.id, 'Dave Lab Admin');

  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'lab_admin', entity_id: lab.id },
  });

  console.log(`  ✅ lab@test.com  |  entity_id: ${lab.id}`);
}

async function seedPlatformAdmin() {
  console.log('\n🛡️  Seeding Platform Admin — admin@test.com');
  const user = await createAuthUser('admin@test.com', 'platform_admin');

  await upsertProfile(user.id, 'platform_admin', null, 'Eve Platform Admin');

  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'platform_admin', entity_id: null },
  });

  console.log(`  ✅ admin@test.com`);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 HealthOS Test Seed — starting...');
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Password for all accounts: ${PASSWORD}\n`);

  try {
    await seedPatient();
    await seedDoctor();
    await seedHospitalAdmin();
    await seedLabAdmin();
    await seedPlatformAdmin();

    console.log('\n✅ All test accounts created successfully!\n');
    console.log('┌──────────────────┬──────────────────────┬────────────┐');
    console.log('│ Role             │ Email                │ Password   │');
    console.log('├──────────────────┼──────────────────────┼────────────┤');
    console.log('│ patient          │ patient@test.com     │ Test@1234  │');
    console.log('│ doctor           │ doctor@test.com      │ Test@1234  │');
    console.log('│ hospital_admin   │ hospital@test.com    │ Test@1234  │');
    console.log('│ lab_admin        │ lab@test.com         │ Test@1234  │');
    console.log('│ platform_admin   │ admin@test.com       │ Test@1234  │');
    console.log('└──────────────────┴──────────────────────┴────────────┘');
  } catch (err: any) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
}

main();

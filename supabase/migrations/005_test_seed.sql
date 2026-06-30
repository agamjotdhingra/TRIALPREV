-- ============================================================
-- HealthOS — Test Seed Data (005_test_seed.sql)
-- Run this in: Supabase Dashboard > SQL Editor
-- Creates one test user per role with known credentials.
-- ⚠️  FOR DEVELOPMENT / TESTING ONLY — DO NOT RUN IN PRODUCTION
-- ============================================================

-- ── Helper: create a Supabase auth user with a fixed UUID ─────────────────────
-- We INSERT directly into auth.users since the service-role can do this in SQL Editor.

DO $$
DECLARE
  patient_uid   uuid := '00000000-0000-0000-0000-000000000001';
  doctor_uid    uuid := '00000000-0000-0000-0000-000000000002';
  hospital_uid  uuid := '00000000-0000-0000-0000-000000000003';
  lab_uid       uuid := '00000000-0000-0000-0000-000000000004';
  admin_uid     uuid := '00000000-0000-0000-0000-000000000005';

  patient_entity_id  integer;
  doctor_entity_id   integer;
  hospital_entity_id integer;
  lab_entity_id      integer;
BEGIN

  -- ── 1. PATIENT ───────────────────────────────────────────────────────────────
  -- Email: patient@test.com  |  Password: Test@1234
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
  ) VALUES (
    patient_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'patient@test.com',
    crypt('Test@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"],"role":"patient"}'::jsonb,
    '{}'::jsonb,
    false, ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.patients (
    health_id, full_name, mobile, email, date_of_birth, gender, blood_group,
    height, weight, bmi, health_score, risk_level
  ) VALUES (
    'HID-TEST-001', 'Alice Patient', '9000000001', 'patient@test.com',
    '1992-05-15', 'female', 'O+', 165, 60, 22.0, 90, 'healthy'
  )
  ON CONFLICT (health_id) DO NOTHING
  RETURNING id INTO patient_entity_id;

  IF patient_entity_id IS NULL THEN
    SELECT id INTO patient_entity_id FROM public.patients WHERE health_id = 'HID-TEST-001';
  END IF;

  UPDATE auth.users
    SET raw_app_meta_data = jsonb_build_object('provider','email','providers',array['email']::text[],'role','patient','entity_id',patient_entity_id)
  WHERE id = patient_uid;

  INSERT INTO public.user_profiles (id, role, entity_id, full_name)
    VALUES (patient_uid, 'patient', patient_entity_id, 'Alice Patient')
    ON CONFLICT (id) DO NOTHING;


  -- ── 2. DOCTOR ────────────────────────────────────────────────────────────────
  -- Email: doctor@test.com  |  Password: Test@1234
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
  ) VALUES (
    doctor_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'doctor@test.com',
    crypt('Test@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"],"role":"doctor"}'::jsonb,
    '{}'::jsonb,
    false, ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.doctors (
    full_name, email, mobile, specialization, qualification,
    years_of_experience, license_number, consultation_fees, verification_status
  ) VALUES (
    'Dr. Bob Smith', 'doctor@test.com', '9000000002',
    'General Medicine', 'MBBS, MD',
    8, 'LIC-TEST-002', 500, 'approved'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO doctor_entity_id;

  IF doctor_entity_id IS NULL THEN
    SELECT id INTO doctor_entity_id FROM public.doctors WHERE email = 'doctor@test.com';
  END IF;

  UPDATE auth.users
    SET raw_app_meta_data = jsonb_build_object('provider','email','providers',array['email']::text[],'role','doctor','entity_id',doctor_entity_id)
  WHERE id = doctor_uid;

  INSERT INTO public.user_profiles (id, role, entity_id, full_name)
    VALUES (doctor_uid, 'doctor', doctor_entity_id, 'Dr. Bob Smith')
    ON CONFLICT (id) DO NOTHING;


  -- ── 3. HOSPITAL ADMIN ────────────────────────────────────────────────────────
  -- Email: hospital@test.com  |  Password: Test@1234
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
  ) VALUES (
    hospital_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'hospital@test.com',
    crypt('Test@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"],"role":"hospital_admin"}'::jsonb,
    '{}'::jsonb,
    false, ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.hospitals (
    name, registration_number, address, mobile, email, total_beds
  ) VALUES (
    'Test General Hospital', 'REG-HOSP-003',
    '123 Health St, Medical City', '9000000003', 'hospital@test.com', 100
  )
  ON CONFLICT (registration_number) DO NOTHING
  RETURNING id INTO hospital_entity_id;

  IF hospital_entity_id IS NULL THEN
    SELECT id INTO hospital_entity_id FROM public.hospitals WHERE registration_number = 'REG-HOSP-003';
  END IF;

  UPDATE auth.users
    SET raw_app_meta_data = jsonb_build_object('provider','email','providers',array['email']::text[],'role','hospital_admin','entity_id',hospital_entity_id)
  WHERE id = hospital_uid;

  INSERT INTO public.user_profiles (id, role, entity_id, full_name)
    VALUES (hospital_uid, 'hospital_admin', hospital_entity_id, 'Carol Hospital Admin')
    ON CONFLICT (id) DO NOTHING;


  -- ── 4. LAB ADMIN ─────────────────────────────────────────────────────────────
  -- Email: lab@test.com  |  Password: Test@1234
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
  ) VALUES (
    lab_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'lab@test.com',
    crypt('Test@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"],"role":"lab_admin"}'::jsonb,
    '{}'::jsonb,
    false, ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.labs (
    name, registration_number, contact_person, mobile, email, verification_status
  ) VALUES (
    'Test Diagnostics Lab', 'REG-LAB-004',
    'Dave Lab Admin', '9000000004', 'lab@test.com', 'approved'
  )
  ON CONFLICT (registration_number) DO NOTHING
  RETURNING id INTO lab_entity_id;

  IF lab_entity_id IS NULL THEN
    SELECT id INTO lab_entity_id FROM public.labs WHERE registration_number = 'REG-LAB-004';
  END IF;

  UPDATE auth.users
    SET raw_app_meta_data = jsonb_build_object('provider','email','providers',array['email']::text[],'role','lab_admin','entity_id',lab_entity_id)
  WHERE id = lab_uid;

  INSERT INTO public.user_profiles (id, role, entity_id, full_name)
    VALUES (lab_uid, 'lab_admin', lab_entity_id, 'Dave Lab Admin')
    ON CONFLICT (id) DO NOTHING;


  -- ── 5. PLATFORM ADMIN ────────────────────────────────────────────────────────
  -- Email: admin@test.com  |  Password: Test@1234
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
  ) VALUES (
    admin_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@test.com',
    crypt('Test@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"],"role":"platform_admin"}'::jsonb,
    '{}'::jsonb,
    false, ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_profiles (id, role, entity_id, full_name)
    VALUES (admin_uid, 'platform_admin', NULL, 'Eve Platform Admin')
    ON CONFLICT (id) DO NOTHING;

END $$;

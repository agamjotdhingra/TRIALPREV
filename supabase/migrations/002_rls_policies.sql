-- ============================================================
-- HealthOS — Row Level Security Policies
-- NOTE: The Express backend uses the SERVICE ROLE key which
-- bypasses RLS. These policies are a safety net if the
-- Supabase client is ever used directly.
-- ============================================================

-- Enable RLS on all tables
alter table public.user_profiles         enable row level security;
alter table public.pending_applications  enable row level security;
alter table public.patients              enable row level security;
alter table public.doctors               enable row level security;
alter table public.appointments          enable row level security;
alter table public.prescriptions         enable row level security;
alter table public.labs                  enable row level security;
alter table public.reports               enable row level security;
alter table public.documents             enable row level security;
alter table public.hospitals             enable row level security;
alter table public.wards                 enable row level security;
alter table public.beds                  enable row level security;
alter table public.admissions            enable row level security;
alter table public.staff                 enable row level security;
alter table public.notifications         enable row level security;

-- Helper: get role from JWT
create or replace function public.get_my_role()
returns text stable language sql as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    (select role from public.user_profiles where id = auth.uid())
  );
$$;

-- Helper: get entity_id from JWT
create or replace function public.get_my_entity_id()
returns integer stable language sql as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'entity_id')::integer,
    (select entity_id from public.user_profiles where id = auth.uid())
  );
$$;

-- ── user_profiles ────────────────────────────────────────────
create policy "Users see own profile" on user_profiles
  for select using (id = auth.uid());

create policy "Platform admin sees all profiles" on user_profiles
  for all using (get_my_role() = 'platform_admin');

-- ── patients ─────────────────────────────────────────────────
create policy "Patient sees own record" on patients
  for select using (
    get_my_role() = 'patient' and id = get_my_entity_id()
  );

create policy "Patient updates own record" on patients
  for update using (
    get_my_role() = 'patient' and id = get_my_entity_id()
  );

create policy "Doctor sees assigned patients" on patients
  for select using (
    get_my_role() = 'doctor' and
    id in (select patient_id from appointments where doctor_id = get_my_entity_id())
  );

create policy "Platform admin: full patient access" on patients
  for all using (get_my_role() = 'platform_admin');

create policy "Lab/Hospital: read-only patient lookup" on patients
  for select using (get_my_role() in ('lab_admin', 'hospital_admin'));

-- ── appointments ─────────────────────────────────────────────
create policy "Patient sees own appointments" on appointments
  for select using (
    get_my_role() = 'patient' and patient_id = get_my_entity_id()
  );

create policy "Patient books appointments" on appointments
  for insert with check (
    get_my_role() = 'patient' and patient_id = get_my_entity_id()
  );

create policy "Doctor sees own appointments" on appointments
  for select using (
    get_my_role() = 'doctor' and doctor_id = get_my_entity_id()
  );

create policy "Doctor updates own appointment status" on appointments
  for update using (
    get_my_role() = 'doctor' and doctor_id = get_my_entity_id()
  );

create policy "Platform admin: full appointment access" on appointments
  for all using (get_my_role() = 'platform_admin');

-- ── prescriptions ────────────────────────────────────────────
create policy "Patient sees own prescriptions" on prescriptions
  for select using (
    get_my_role() = 'patient' and patient_id = get_my_entity_id()
  );

create policy "Doctor manages own prescriptions" on prescriptions
  for all using (
    get_my_role() = 'doctor' and doctor_id = get_my_entity_id()
  );

create policy "Platform admin: full prescription access" on prescriptions
  for all using (get_my_role() = 'platform_admin');

-- ── reports ──────────────────────────────────────────────────
create policy "Patient sees own reports" on reports
  for select using (
    get_my_role() = 'patient' and patient_id = get_my_entity_id()
  );

create policy "Lab admin manages own lab reports" on reports
  for all using (
    get_my_role() = 'lab_admin' and lab_id = get_my_entity_id()
  );

create policy "Doctor sees assigned patient reports" on reports
  for select using (
    get_my_role() = 'doctor' and
    patient_id in (select patient_id from appointments where doctor_id = get_my_entity_id())
  );

create policy "Platform admin: full report access" on reports
  for all using (get_my_role() = 'platform_admin');

-- ── notifications ─────────────────────────────────────────────
create policy "Users see own notifications" on notifications
  for select using (recipient_id = get_my_entity_id());

create policy "Users update own notifications" on notifications
  for update using (recipient_id = get_my_entity_id());

create policy "Platform admin: all notifications" on notifications
  for all using (get_my_role() = 'platform_admin');

-- ── hospitals / wards / beds / admissions / staff ────────────
create policy "Public: read approved hospitals" on hospitals
  for select using (true);

create policy "Platform admin: manage hospitals" on hospitals
  for all using (get_my_role() = 'platform_admin');

create policy "Hospital admin: manage own hospital" on hospitals
  for all using (
    get_my_role() = 'hospital_admin' and id = get_my_entity_id()
  );

-- Wards
create policy "Hospital admin: own wards" on wards
  for all using (
    get_my_role() in ('hospital_admin', 'platform_admin') and (
      get_my_role() = 'platform_admin' or hospital_id = get_my_entity_id()
    )
  );

-- Beds
create policy "Hospital admin: own beds" on beds
  for all using (
    get_my_role() in ('hospital_admin', 'platform_admin') and (
      get_my_role() = 'platform_admin' or
      ward_id in (select id from wards where hospital_id = get_my_entity_id())
    )
  );

-- Admissions
create policy "Hospital admin: own admissions" on admissions
  for all using (
    get_my_role() in ('hospital_admin', 'platform_admin') and (
      get_my_role() = 'platform_admin' or hospital_id = get_my_entity_id()
    )
  );

-- Staff
create policy "Hospital admin: own staff" on staff
  for all using (
    get_my_role() in ('hospital_admin', 'platform_admin') and (
      get_my_role() = 'platform_admin' or hospital_id = get_my_entity_id()
    )
  );

-- Labs
create policy "Public: read approved labs" on labs
  for select using (verification_status = 'approved');

create policy "Lab admin: own lab" on labs
  for all using (
    get_my_role() = 'lab_admin' and id = get_my_entity_id()
  );

create policy "Platform admin: manage labs" on labs
  for all using (get_my_role() = 'platform_admin');

-- Pending Applications
create policy "Platform admin: manage applications" on pending_applications
  for all using (get_my_role() = 'platform_admin');

-- ============================================================
-- HealthOS — Initial Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable extensions
create extension if not exists "pg_trgm";          -- fuzzy search
create extension if not exists "unaccent";          -- accent-insensitive search

-- ============================================================
-- user_profiles — links auth.users to domain entities
-- ============================================================
create table if not exists public.user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('patient','doctor','hospital_admin','lab_admin','platform_admin')),
  entity_id   integer,        -- FK to patients/doctors/labs/hospitals
  full_name   text not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- pending_applications — doctor/lab/hospital applications
-- ============================================================
create table if not exists public.pending_applications (
  id           serial primary key,
  role         text not null,
  full_name    text not null,
  email        text not null unique,
  mobile       text not null,
  details      text,           -- JSON blob of role-specific fields
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at   timestamptz default now(),
  reviewed_at  timestamptz
);

-- ============================================================
-- patients
-- ============================================================
create table if not exists public.patients (
  id                    serial primary key,
  health_id             text not null unique,
  full_name             text not null,
  mobile                text not null,
  email                 text,
  date_of_birth         date not null,
  age                   integer,
  gender                text not null,
  blood_group           text,
  height                real,
  weight                real,
  bmi                   real,
  health_score          real default 100,
  risk_level            text default 'healthy',
  existing_diseases     text,
  allergies             text,
  current_medications   text,
  family_medical_history text,
  smoking_status        text,
  alcohol_consumption   text,
  lifestyle_info        text,
  previous_conditions   text,
  surgeries             text,
  vaccinations          text,
  chronic_diseases      text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- FTS index on patients
create index if not exists idx_patients_fts
  on patients using gin(to_tsvector('english',
    coalesce(full_name,'') || ' ' ||
    coalesce(health_id,'') || ' ' ||
    coalesce(existing_diseases,'') || ' ' ||
    coalesce(chronic_diseases,'') || ' ' ||
    coalesce(allergies,'')
  ));
create index if not exists idx_patients_name_trgm on patients using gin(full_name gin_trgm_ops);

-- ============================================================
-- doctors
-- ============================================================
create table if not exists public.doctors (
  id                    serial primary key,
  full_name             text not null,
  email                 text not null unique,
  mobile                text not null,
  specialization        text not null,
  qualification         text not null,
  years_of_experience   integer not null default 0,
  license_number        text,
  license_valid_until   date,
  consultation_fees     real,
  bio                   text,
  profile_picture       text,
  verification_status   text not null default 'pending',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ============================================================
-- appointments
-- ============================================================
create table if not exists public.appointments (
  id                serial primary key,
  patient_id        integer not null references patients(id) on delete cascade,
  doctor_id         integer not null references doctors(id) on delete cascade,
  scheduled_date    date not null,
  scheduled_time    text not null,
  consultation_type text default 'in-person',
  status            text not null default 'scheduled',
  reason            text,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists idx_appts_patient on appointments(patient_id);
create index if not exists idx_appts_doctor  on appointments(doctor_id);
create index if not exists idx_appts_date    on appointments(scheduled_date);

-- ============================================================
-- prescriptions
-- ============================================================
create table if not exists public.prescriptions (
  id              serial primary key,
  patient_id      integer not null references patients(id) on delete cascade,
  doctor_id       integer not null references doctors(id),
  diagnosis       text not null,
  medicines       text not null,     -- JSON array string
  instructions    text,
  follow_up_date  date,
  created_at      timestamptz default now()
);
create index if not exists idx_rx_patient on prescriptions(patient_id);
create index if not exists idx_rx_doctor  on prescriptions(doctor_id);

-- ============================================================
-- labs
-- ============================================================
create table if not exists public.labs (
  id                    serial primary key,
  name                  text not null,
  registration_number   text not null unique,
  contact_person        text,
  mobile                text not null,
  email                 text,
  address               text,
  verification_status   text not null default 'pending',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ============================================================
-- reports
-- ============================================================
create table if not exists public.reports (
  id              serial primary key,
  patient_id      integer not null references patients(id) on delete cascade,
  lab_id          integer not null references labs(id),
  category        text not null,
  report_name     text not null,
  file_url        text,
  findings        text,
  is_critical     boolean not null default false,
  critical_note   text,
  created_at      timestamptz default now()
);
create index if not exists idx_reports_patient  on reports(patient_id);
create index if not exists idx_reports_lab      on reports(lab_id);
create index if not exists idx_reports_critical on reports(is_critical);

-- ============================================================
-- documents
-- ============================================================
create table if not exists public.documents (
  id           serial primary key,
  patient_id   integer not null references patients(id) on delete cascade,
  file_name    text not null,
  file_url     text,
  category     text,
  mime_type    text,
  uploaded_by  text default 'patient',
  created_at   timestamptz default now()
);

-- ============================================================
-- hospitals
-- ============================================================
create table if not exists public.hospitals (
  id                    serial primary key,
  name                  text not null,
  registration_number   text unique,
  address               text,
  mobile                text,
  email                 text,
  total_beds            integer default 0,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ============================================================
-- wards
-- ============================================================
create table if not exists public.wards (
  id              serial primary key,
  hospital_id     integer not null references hospitals(id) on delete cascade,
  name            text not null,
  ward_type       text,
  total_beds      integer default 0,
  occupied_beds   integer default 0,
  available_beds  integer generated always as (total_beds - occupied_beds) stored,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_wards_hospital on wards(hospital_id);

-- ============================================================
-- beds
-- ============================================================
create table if not exists public.beds (
  id            serial primary key,
  ward_id       integer not null references wards(id) on delete cascade,
  hospital_id   integer references hospitals(id),
  bed_number    text not null,
  room_number   text,
  status        text not null default 'available',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_beds_ward     on beds(ward_id);
create index if not exists idx_beds_hospital on beds(hospital_id);

-- ============================================================
-- admissions
-- ============================================================
create table if not exists public.admissions (
  id                serial primary key,
  patient_id        integer not null references patients(id),
  hospital_id       integer not null references hospitals(id),
  ward_id           integer references wards(id),
  bed_id            integer references beds(id),
  primary_doctor_id integer references doctors(id),
  admission_date    date not null,
  admission_reason  text not null,
  status            text not null default 'admitted',
  discharge_date    date,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists idx_admissions_patient  on admissions(patient_id);
create index if not exists idx_admissions_hospital on admissions(hospital_id);

-- ============================================================
-- staff
-- ============================================================
create table if not exists public.staff (
  id              serial primary key,
  employee_id     text not null unique,
  full_name       text not null,
  role            text not null,
  qualification   text,
  mobile          text not null,
  email           text,
  hospital_id     integer references hospitals(id),
  ward_id         integer references wards(id),
  assigned_shift  text,
  license_info    text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_staff_hospital on staff(hospital_id);

-- ============================================================
-- notifications
-- ============================================================
create table if not exists public.notifications (
  id              serial primary key,
  recipient_type  text not null,
  recipient_id    integer not null,
  type            text not null,
  title           text not null,
  message         text,
  is_read         boolean not null default false,
  created_at      timestamptz default now()
);
create index if not exists idx_notifs_recipient on notifications(recipient_type, recipient_id);

-- ============================================================
-- Auto-update updated_at helper
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_patients_updated_at') then
    create trigger trg_patients_updated_at before update on patients for each row execute function handle_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_doctors_updated_at') then
    create trigger trg_doctors_updated_at before update on doctors for each row execute function handle_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_hospitals_updated_at') then
    create trigger trg_hospitals_updated_at before update on hospitals for each row execute function handle_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_admissions_updated_at') then
    create trigger trg_admissions_updated_at before update on admissions for each row execute function handle_updated_at();
  end if;
end $$;

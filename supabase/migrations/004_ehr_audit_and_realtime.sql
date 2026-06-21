-- ============================================================
-- HealthOS — Migration 004: EHR Access Audit & Realtime
-- ============================================================

-- Create ehr_audit_logs table
create table if not exists public.ehr_audit_logs (
  id           serial primary key,
  operator_id  uuid references auth.users(id) on delete set null,
  patient_id   integer not null references public.patients(id) on delete cascade,
  action       text not null check (action in ('view', 'update', 'export')),
  ip_address   text,
  user_agent   text,
  accessed_at  timestamptz default now()
);

-- Indexing for quick lookups
create index if not exists idx_audit_patient on public.ehr_audit_logs(patient_id);
create index if not exists idx_audit_operator on public.ehr_audit_logs(operator_id);
create index if not exists idx_audit_accessed on public.ehr_audit_logs(accessed_at);

-- Enable RLS
alter table public.ehr_audit_logs enable row level security;

-- RLS Policies
create policy "Platform admin sees all audit logs" on public.ehr_audit_logs
  for select using (public.get_my_role() = 'platform_admin');

-- Add beds to realtime publication
alter publication supabase_realtime add table public.beds;

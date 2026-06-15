-- ============================================================
-- Supabase Storage Buckets
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Lab reports bucket (PDF, images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reports',
  'reports',
  false,  -- private
  10485760,  -- 10 MB
  array['application/pdf','image/jpeg','image/png','image/webp']
) on conflict (id) do nothing;

-- Patient documents bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) on conflict (id) do nothing;

-- Profile pictures (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,  -- public
  2097152,  -- 2 MB
  array['image/jpeg','image/png','image/webp']
) on conflict (id) do nothing;

-- ── Storage RLS Policies ──────────────────────────────────────

-- Reports: lab_admin uploads, patient/doctor reads own
create policy "Lab admin upload reports" on storage.objects
  for insert with check (
    bucket_id = 'reports' and
    (storage.foldername(name))[1] = (
      select get_my_entity_id()::text
    )
  );

create policy "Authenticated users read reports" on storage.objects
  for select using (bucket_id = 'reports' and auth.role() = 'authenticated');

-- Documents: patient uploads own
create policy "Patient upload documents" on storage.objects
  for insert with check (
    bucket_id = 'documents' and
    (storage.foldername(name))[1] = get_my_entity_id()::text
  );

create policy "Patient reads own documents" on storage.objects
  for select using (
    bucket_id = 'documents' and
    (storage.foldername(name))[1] = get_my_entity_id()::text
  );

-- Avatars: anyone reads, authenticated uploads
create policy "Public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Authenticated upload avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

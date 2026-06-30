-- ============================================================
-- HealthOS — Comprehensive Dummy Data (006_dummy_data.sql)
-- Run this in: Supabase Dashboard > SQL Editor
-- Populates the database with rich mock data for all roles.
-- ============================================================

-- ── 1. CLEANUP PREVIOUS MOCK DATA (Optional but ensures clean slate) ─────────
DELETE FROM public.notifications;
DELETE FROM public.admissions;
DELETE FROM public.beds;
DELETE FROM public.wards;
DELETE FROM public.staff;
DELETE FROM public.documents;
DELETE FROM public.reports;
DELETE FROM public.prescriptions;
DELETE FROM public.appointments;
DELETE FROM public.pending_applications;

-- Keep main test entities but clean others if needed
DELETE FROM public.patients WHERE health_id != 'HID-TEST-001';
DELETE FROM public.doctors WHERE email != 'doctor@test.com';
DELETE FROM public.hospitals WHERE registration_number != 'REG-HOSP-003';
DELETE FROM public.labs WHERE registration_number != 'REG-LAB-004';


-- ── 2. ADD ADDITIONAL PATIENTS ───────────────────────────────────────────────
INSERT INTO public.patients (
  health_id, full_name, mobile, email, date_of_birth, gender, blood_group,
  height, weight, bmi, health_score, risk_level, existing_diseases, allergies,
  current_medications, smoking_status, alcohol_consumption
) VALUES 
(
  'HID-MOCK-002', 'John Doe', '9876543210', 'john.doe@example.com',
  '1985-08-22', 'male', 'A+', 180, 85, 26.2, 78, 'moderate',
  'Hypertension', 'Penicillin', 'Lisinopril 10mg', 'non-smoker', 'occasional'
),
(
  'HID-MOCK-003', 'Sarah Jenkins', '9988776655', 'sarah.j@example.com',
  '1990-11-03', 'female', 'B-', 160, 52, 20.3, 95, 'healthy',
  NULL, 'Peanuts', NULL, 'non-smoker', 'none'
),
(
  'HID-MOCK-004', 'Robert Chen', '9123456789', 'robert.chen@example.com',
  '1962-04-12', 'male', 'O-', 172, 79, 26.7, 60, 'high',
  'Type 2 Diabetes, Coronary Artery Disease', 'Sulfa drugs', 'Metformin 1000mg, Atorvastatin 20mg', 'former', 'none'
)
ON CONFLICT (health_id) DO NOTHING;


-- ── 3. ADD ADDITIONAL DOCTORS ────────────────────────────────────────────────
INSERT INTO public.doctors (
  full_name, email, mobile, specialization, qualification,
  years_of_experience, license_number, consultation_fees, verification_status
) VALUES 
(
  'Dr. Sarah Patel', 'sarah.patel@test.com', '9111222333',
  'Cardiology', 'MBBS, MD, DM (Cardiology)', 15, 'LIC-CARD-789', 800, 'approved'
),
(
  'Dr. Michael Chang', 'michael.chang@test.com', '9222333444',
  'Pediatrics', 'MBBS, DCH, MD', 10, 'LIC-PED-456', 400, 'approved'
)
ON CONFLICT (email) DO NOTHING;


-- ── 4. APPOINTMENTS ──────────────────────────────────────────────────────────
-- Connects Patient Alice (HID-TEST-001) & others with Dr. Bob Smith (doctor@test.com) & Dr. Sarah Patel
DO $$
DECLARE
  p1_id int; p2_id int; p3_id int; p4_id int;
  d1_id int; d2_id int; d3_id int;
BEGIN
  -- Get IDs
  SELECT id INTO p1_id FROM public.patients WHERE health_id = 'HID-TEST-001';
  SELECT id INTO p2_id FROM public.patients WHERE health_id = 'HID-MOCK-002';
  SELECT id INTO p3_id FROM public.patients WHERE health_id = 'HID-MOCK-003';
  SELECT id INTO p4_id FROM public.patients WHERE health_id = 'HID-MOCK-004';

  SELECT id INTO d1_id FROM public.doctors WHERE email = 'doctor@test.com';
  SELECT id INTO d2_id FROM public.doctors WHERE email = 'sarah.patel@test.com';
  SELECT id INTO d3_id FROM public.doctors WHERE email = 'michael.chang@test.com';

  -- Insert appointments
  INSERT INTO public.appointments (patient_id, doctor_id, scheduled_date, scheduled_time, consultation_type, status, reason, notes) VALUES
  (p1_id, d1_id, CURRENT_DATE, '10:00 AM', 'in-person', 'scheduled', 'Routine checkup & prescription refill', 'Patient reports mild fatigue'),
  (p2_id, d1_id, CURRENT_DATE, '11:30 AM', 'video', 'scheduled', 'Hypertension follow-up', 'Check BP readings log'),
  (p3_id, d3_id, CURRENT_DATE + 1, '09:00 AM', 'in-person', 'scheduled', 'Annual wellness exam', 'Standard pediatric follow-up'),
  (p4_id, d2_id, CURRENT_DATE - 2, '02:00 PM', 'in-person', 'completed', 'Chest discomfort evaluation', 'ECG conducted. Refer to lab report.'),
  (p1_id, d2_id, CURRENT_DATE - 5, '04:30 PM', 'in-person', 'completed', 'Heart rate monitoring', 'Slight palpitations, recommended lifestyle edits.'),
  (p2_id, d1_id, CURRENT_DATE + 2, '11:00 AM', 'in-person', 'scheduled', 'Joint pain discussion', 'Check arthritis family history');

END $$;


-- ── 5. PRESCRIPTIONS ─────────────────────────────────────────────────────────
DO $$
DECLARE
  p1_id int; p2_id int; p4_id int;
  d1_id int; d2_id int;
BEGIN
  SELECT id INTO p1_id FROM public.patients WHERE health_id = 'HID-TEST-001';
  SELECT id INTO p2_id FROM public.patients WHERE health_id = 'HID-MOCK-002';
  SELECT id INTO p4_id FROM public.patients WHERE health_id = 'HID-MOCK-004';

  SELECT id INTO d1_id FROM public.doctors WHERE email = 'doctor@test.com';
  SELECT id INTO d2_id FROM public.doctors WHERE email = 'sarah.patel@test.com';

  INSERT INTO public.prescriptions (patient_id, doctor_id, diagnosis, medicines, instructions, follow_up_date) VALUES
  (
    p1_id, d1_id, 'Seasonal Allergies & Mild Fatigue',
    '[{"name": "Cetirizine 10mg", "dosage": "1-0-0", "duration": "10 days"}, {"name": "Multivitamin", "dosage": "0-1-0", "duration": "30 days"}]',
    'Take Cetirizine at bedtime. Stay hydrated.',
    CURRENT_DATE + 15
  ),
  (
    p2_id, d1_id, 'Stage 1 Essential Hypertension',
    '[{"name": "Lisinopril 10mg", "dosage": "1-0-0", "duration": "30 days"}, {"name": "Amlodipine 5mg", "dosage": "0-0-1", "duration": "30 days"}]',
    'Monitor blood pressure daily in the morning and evening.',
    CURRENT_DATE + 30
  ),
  (
    p4_id, d2_id, 'Type 2 Diabetes Mellitus with Mild Hyperlipidemia',
    '[{"name": "Metformin XR 1000mg", "dosage": "0-0-1", "duration": "90 days"}, {"name": "Atorvastatin 20mg", "dosage": "0-0-1", "duration": "90 days"}]',
    'Take Metformin with dinner. Report any muscle pain immediately.',
    CURRENT_DATE + 60
  );
END $$;


-- ── 6. LAB REPORTS & DOCUMENTS ───────────────────────────────────────────────
DO $$
DECLARE
  p1_id int; p2_id int; p4_id int;
  l1_id int;
BEGIN
  SELECT id INTO p1_id FROM public.patients WHERE health_id = 'HID-TEST-001';
  SELECT id INTO p2_id FROM public.patients WHERE health_id = 'HID-MOCK-002';
  SELECT id INTO p4_id FROM public.patients WHERE health_id = 'HID-MOCK-004';

  SELECT id INTO l1_id FROM public.labs WHERE registration_number = 'REG-LAB-004';

  -- Lab Reports
  INSERT INTO public.reports (patient_id, lab_id, category, report_name, findings, is_critical, critical_note, created_at) VALUES
  (
    p1_id, l1_id, 'Hematology', 'Complete Blood Count (CBC)',
    'Hemoglobin: 14.2 g/dL (Normal). WBC: 6.5 x10^3/uL (Normal). Platelets: 250 x10^3/uL (Normal). Everything falls within optimal clinical ranges.',
    false, NULL, CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  (
    p4_id, l1_id, 'Biochemistry', 'Lipid Profile & HbA1c',
    'HbA1c: 8.4% (Elevated - Diabetic Range). Total Cholesterol: 245 mg/dL (High). Triglycerides: 190 mg/dL (High). LDL: 162 mg/dL (High).',
    true, 'Patient shows high glycemic levels and lipid imbalance. Suggest immediate diabetic consult.',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
  ),
  (
    p2_id, l1_id, 'Renal Function', 'Kidney Function Test (KFT)',
    'Serum Creatinine: 0.9 mg/dL (Normal). Blood Urea Nitrogen (BUN): 14 mg/dL (Normal). eGFR: 98 mL/min (Optimal).',
    false, NULL, CURRENT_TIMESTAMP - INTERVAL '5 days'
  );

  -- Documents uploaded
  INSERT INTO public.documents (patient_id, file_name, file_url, category, mime_type, uploaded_by, created_at) VALUES
  (p1_id, 'vaccination_certificate.pdf', 'https://example.com/docs/vac_cert.pdf', 'Vaccination', 'application/pdf', 'patient', CURRENT_TIMESTAMP - INTERVAL '10 days'),
  (p2_id, 'old_chest_xray_report.pdf', 'https://example.com/docs/xray.pdf', 'Imaging', 'application/pdf', 'patient', CURRENT_TIMESTAMP - INTERVAL '30 days');

END $$;


-- ── 7. HOSPITAL WARDS, BEDS & ADMISSIONS ─────────────────────────────────────
DO $$
DECLARE
  h1_id int;
  w1_id int; w2_id int;
  b1_id int; b2_id int; b3_id int; b4_id int;
  p2_id int; p4_id int;
  d1_id int; d2_id int;
BEGIN
  SELECT id INTO h1_id FROM public.hospitals WHERE registration_number = 'REG-HOSP-003';
  SELECT id INTO p2_id FROM public.patients WHERE health_id = 'HID-MOCK-002';
  SELECT id INTO p4_id FROM public.patients WHERE health_id = 'HID-MOCK-004';
  SELECT id INTO d1_id FROM public.doctors WHERE email = 'doctor@test.com';
  SELECT id INTO d2_id FROM public.doctors WHERE email = 'sarah.patel@test.com';

  -- Wards
  INSERT INTO public.wards (hospital_id, name, ward_type, total_beds, occupied_beds) VALUES
  (h1_id, 'Intensive Care Unit (ICU)', 'ICU', 5, 1),
  (h1_id, 'General Medical Ward A', 'General', 15, 1)
  ON CONFLICT DO NOTHING;

  -- Get Ward IDs
  SELECT id INTO w1_id FROM public.wards WHERE hospital_id = h1_id AND name = 'Intensive Care Unit (ICU)';
  SELECT id INTO w2_id FROM public.wards WHERE hospital_id = h1_id AND name = 'General Medical Ward A';

  -- Beds
  INSERT INTO public.beds (ward_id, hospital_id, bed_number, room_number, status) VALUES
  (w1_id, h1_id, 'ICU-101', 'Room 10', 'occupied'),
  (w1_id, h1_id, 'ICU-102', 'Room 10', 'available'),
  (w2_id, h1_id, 'GEN-201', 'Ward A', 'occupied'),
  (w2_id, h1_id, 'GEN-202', 'Ward A', 'available'),
  (w2_id, h1_id, 'GEN-203', 'Ward A', 'available')
  ON CONFLICT DO NOTHING;

  -- Get Bed IDs
  SELECT id INTO b1_id FROM public.beds WHERE ward_id = w1_id AND bed_number = 'ICU-101';
  SELECT id INTO b2_id FROM public.beds WHERE ward_id = w1_id AND bed_number = 'ICU-102';
  SELECT id INTO b3_id FROM public.beds WHERE ward_id = w2_id AND bed_number = 'GEN-201';

  -- Admissions
  INSERT INTO public.admissions (patient_id, hospital_id, ward_id, bed_id, primary_doctor_id, admission_date, admission_reason, status, notes) VALUES
  (
    p4_id, h1_id, w1_id, b1_id, d2_id,
    CURRENT_DATE - 1, 'Acute Coronary Syndrome & diabetic complications', 'admitted',
    'Patient admitted via Emergency. Critically elevated blood sugars and unstable blood pressure. Currently stable under intensive monitoring.'
  ),
  (
    p2_id, h1_id, w2_id, b3_id, d1_id,
    CURRENT_DATE - 4, 'Severe Uncontrolled Hypertension & hypertensive crisis', 'admitted',
    'Admitted for observation and titration of intravenous anti-hypertensive medication. Shows good recovery.'
  );

END $$;


-- ── 8. HOSPITAL STAFF ────────────────────────────────────────────────────────
DO $$
DECLARE
  h1_id int;
  w2_id int;
BEGIN
  SELECT id INTO h1_id FROM public.hospitals WHERE registration_number = 'REG-HOSP-003';
  SELECT id INTO w2_id FROM public.wards WHERE hospital_id = h1_id AND name = 'General Medical Ward A';

  INSERT INTO public.staff (employee_id, full_name, role, qualification, mobile, email, hospital_id, ward_id, assigned_shift, license_info) VALUES
  ('EMP-HOSP-001', 'Nurse Emily Johnson', 'Nurse', 'B.Sc. Nursing', '9898989801', 'emily.j@hospital.com', h1_id, w2_id, 'Night', 'LIC-NURSE-9988'),
  ('EMP-HOSP-002', 'James Miller', 'Medical Assistant', 'Diploma in Clinical Assistance', '9898989802', 'james.m@hospital.com', h1_id, w2_id, 'Day', 'LIC-MA-4433')
  ON CONFLICT (employee_id) DO NOTHING;
END $$;


-- ── 9. PENDING APPLICATIONS ──────────────────────────────────────────────────
INSERT INTO public.pending_applications (role, full_name, email, mobile, details, status, created_at) VALUES
(
  'doctor', 'Dr. Alistair Vance', 'alistair.vance@example.com', '9991112220',
  '{"role": "doctor", "fullName": "Dr. Alistair Vance", "email": "alistair.vance@example.com", "mobile": "9991112220", "specialization": "Neurology", "qualification": "MD, DM (Neurology)", "yearsOfExperience": 12, "licenseNumber": "LIC-NEURO-8899", "consultationFees": 1000, "bio": "Specialist in neuromuscular disorders and stroke recovery."}',
  'pending', CURRENT_TIMESTAMP - INTERVAL '1 hour'
),
(
  'lab_admin', 'Apex Diagnostics Center', 'apex.diagnostics@example.com', '9992223330',
  '{"role": "lab_admin", "fullName": "Apex Diagnostics Center", "email": "apex.diagnostics@example.com", "mobile": "9992223330", "labName": "Apex Diagnostics Hub", "registrationNumber": "REG-LAB-APEX", "address": "Park Avenue Metro Road, Suite 40"}',
  'pending', CURRENT_TIMESTAMP - INTERVAL '3 hours'
),
(
  'hospital_admin', 'St. Jude Healthcare', 'stjude.admin@example.com', '9993334440',
  '{"role": "hospital_admin", "fullName": "St. Jude Healthcare Administration", "email": "stjude.admin@example.com", "mobile": "9993334440", "hospitalName": "St. Jude Multi-Specialty Hospital", "registrationNumber": "REG-HOSP-JUDE", "address": "777 Saint Jude Way", "totalBeds": 250}',
  'pending', CURRENT_TIMESTAMP - INTERVAL '1 day'
)
ON CONFLICT (email) DO NOTHING;


-- ── 10. NOTIFICATIONS ────────────────────────────────────────────────────────
-- Type definitions usually read by the system
DO $$
DECLARE
  p1_id int;
  d1_id int;
  l1_id int;
  h1_id int;
BEGIN
  SELECT id INTO p1_id FROM public.patients WHERE health_id = 'HID-TEST-001';
  SELECT id INTO d1_id FROM public.doctors WHERE email = 'doctor@test.com';
  SELECT id INTO l1_id FROM public.labs WHERE registration_number = 'REG-LAB-004';
  SELECT id INTO h1_id FROM public.hospitals WHERE registration_number = 'REG-HOSP-003';

  -- Patient alerts
  INSERT INTO public.notifications (recipient_type, recipient_id, type, title, message, is_read) VALUES
  ('patient', p1_id, 'appointment', 'Upcoming Appointment', 'Your appointment with Dr. Bob Smith is scheduled for today at 10:00 AM.', false),
  ('patient', p1_id, 'report', 'Lab Report Published', 'Your CBC Lab Report is published by Test Diagnostics Lab.', true),
  
  -- Doctor alerts
  ('doctor', d1_id, 'patient_alert', 'Critical Lab Report Alert', 'Patient Robert Chen has a critical Lab Report (HbA1c level is elevated).', false),
  ('doctor', d1_id, 'appointment', 'New Booking', 'Alice Patient has booked an appointment today at 10:00 AM.', true),

  -- Hospital admin alerts
  ('hospital_admin', h1_id, 'admission', 'New Patient Admission', 'Patient Robert Chen admitted to ICU Bed ICU-101.', false),

  -- Lab admin alerts
  ('lab_admin', l1_id, 'request', 'Doctor Lab Request', 'Dr. Sarah Patel requested a Lipid Profile for Robert Chen.', false);

END $$;

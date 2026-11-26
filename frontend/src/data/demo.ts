/** Curated sample data, lifted from the Prevntiv Figma designs. Used in demo mode and for features without an API yet. */

export const ME = {
  name: 'Priya Sharma',
  healthId: 'PRV-882-901',
  email: 'priya.s@example.in',
  mobile: '98765 43210',
  dob: '1992-05-14',
  age: 31,
  gender: 'Female',
  bloodGroup: 'O+',
  height: 165,
  weight: 62,
  bmi: 22.4,
  score: 85,
  risk: 'Low Risk',
  conditions: ['Hypertension'],
  allergies: ['Penicillin'],
  medications: [{ name: 'Lisinopril', dose: '10mg Daily' }],
  family: ['Heart Disease'],
  smoking: 'Former',
  alcohol: 'Light',
  sleep: 7,
};

export type Appt = { id: string; date: string; time: string; doctor: string; specialty: string; type: 'Video' | 'In-Person' | 'Chat'; status: 'Scheduled' | 'Completed' | 'Cancelled'; reason: string };
export const APPOINTMENTS: Appt[] = [
  { id: 'a1', date: '2026-06-26', time: '10:30 AM', doctor: 'Dr. Sarah Chen', specialty: 'Cardiology', type: 'Video', status: 'Scheduled', reason: 'Routine follow-up' },
  { id: 'a2', date: '2026-06-28', time: '02:15 PM', doctor: 'Dr. Amit Patel', specialty: 'Dermatology', type: 'In-Person', status: 'Scheduled', reason: 'Skin rash consultation' },
  { id: 'a3', date: '2026-06-15', time: '09:00 AM', doctor: 'Dr. Emily Jones', specialty: 'General Practice', type: 'Chat', status: 'Completed', reason: 'Prescription refill' },
  { id: 'a4', date: '2026-06-10', time: '11:45 AM', doctor: 'Dr. Sarah Chen', specialty: 'Cardiology', type: 'In-Person', status: 'Cancelled', reason: 'Rescheduled by patient' },
  { id: 'a5', date: '2026-05-22', time: '04:00 PM', doctor: 'Dr. Rajesh Kumar', specialty: 'Pulmonology', type: 'Video', status: 'Completed', reason: 'Pulmonology follow-up' },
];

export type Rx = { id: string; date: string; doctor: string; specialty: string; diagnosis: string; medicines: { name: string; dose: string; freq: string; duration: string }[]; followUp: string; notes?: string };
export const PRESCRIPTIONS: Rx[] = [
  { id: 'rx1', date: '2026-06-20', doctor: 'Dr. Sarah Chen', specialty: 'Cardiology', diagnosis: 'Hypertension', followUp: '2026-07-15', notes: 'Reduce salt intake, 30 min brisk walk daily.', medicines: [{ name: 'Amlodipine 5mg', dose: '1 tab', freq: 'Once daily (morning)', duration: '30 days' }, { name: 'Telmisartan 40mg', dose: '1 tab', freq: 'Once daily (night)', duration: '30 days' }] },
  { id: 'rx2', date: '2026-06-15', doctor: 'Dr. Emily Jones', specialty: 'General Practice', diagnosis: 'Vitamin D Deficiency', followUp: '2026-08-15', medicines: [{ name: 'Cholecalciferol 60k', dose: '1 sachet', freq: 'Once weekly', duration: '8 weeks' }] },
  { id: 'rx3', date: '2026-04-02', doctor: 'Dr. Rajesh Kumar', specialty: 'Pulmonology', diagnosis: 'Acute Bronchitis & Cough', followUp: '2026-04-16', medicines: [{ name: 'Azithromycin 500mg', dose: '1 tab', freq: 'Once daily', duration: '3 days' }, { name: 'Ambroxol syrup', dose: '10ml', freq: 'Thrice daily', duration: '5 days' }] },
  { id: 'rx4', date: '2026-02-11', doctor: 'Dr. Sarah Chen', specialty: 'Cardiology', diagnosis: 'Dyslipidemia & Lipid Control', followUp: '2026-05-11', medicines: [{ name: 'Rosuvastatin 10mg', dose: '1 tab', freq: 'Once daily (night)', duration: '90 days' }] },
];

export type LabReport = { id: string; date: string; name: string; lab: string; category: string; status: 'Normal' | 'Critical'; patient?: string; patientId?: string; findings?: string };
export const LAB_REPORTS: LabReport[] = [
  { id: 'REP-2026-8901', date: '2026-06-26', name: 'Comprehensive Metabolic Panel', lab: 'Metropolis Diagnostics', category: 'Blood Work', status: 'Critical', patient: 'Rajesh Kumar', patientId: 'PRE-9921-A', findings: 'Potassium 6.1 mmol/L (high). Creatinine 1.9 mg/dL — suggest nephrology review.' },
  { id: 'REP-2026-8902', date: '2026-06-25', name: 'Lipid Profile', lab: 'Apollo Labs', category: 'Cardiology', status: 'Normal', patient: 'Priya Sharma', patientId: 'PRV-882-901', findings: 'LDL 118 mg/dL, HDL 52 mg/dL, Triglycerides 140 mg/dL.' },
  { id: 'REP-2026-8903', date: '2026-06-24', name: 'Thyroid Panel', lab: 'Apollo Labs', category: 'Endocrinology', status: 'Normal', patient: 'Amit Patel', patientId: 'PRV-102-445', findings: 'TSH 2.4 mIU/L — within reference range.' },
  { id: 'REP-2026-8904', date: '2026-06-23', name: 'Complete Blood Count (CBC)', lab: 'Dr. Lal PathLabs', category: 'Hematology', status: 'Critical', patient: 'Sunita Rao', patientId: 'PRV-441-766', findings: 'Hemoglobin 7.8 g/dL — severe anemia. Platelets normal.' },
  { id: 'REP-2026-8905', date: '2026-06-22', name: 'Urinalysis Routine', lab: 'Metropolis Diagnostics', category: 'Pathology', status: 'Normal', patient: 'Vikram Singh', patientId: 'PRV-993-211', findings: 'No abnormalities detected.' },
  { id: 'REP-2026-8906', date: '2026-06-15', name: 'Chest X-Ray', lab: 'Dr. Lal PathLabs', category: 'Imaging', status: 'Normal', patient: 'Priya Sharma', patientId: 'PRV-882-901', findings: 'Clear lung fields. No cardiomegaly.' },
  { id: 'REP-2026-8907', date: '2026-05-28', name: 'HbA1c', lab: 'Apollo Labs', category: 'Blood Work', status: 'Normal', patient: 'Priya Sharma', patientId: 'PRV-882-901', findings: 'HbA1c 5.4% — non-diabetic range.' },
];

export type Doc = { id: string; name: string; size: string; category: string; date: string; sharedWith?: string; finalizedBy?: string };
export const DOCUMENTS: Doc[] = [
  { id: 'd1', name: 'Discharge_Clinical_Summary.pdf', size: '820 KB', category: 'Discharge Summary', date: '2026-06-26', sharedWith: 'Dr. Amit Sharma & 1 other', finalizedBy: 'Dr. Amit Kumar' },
  { id: 'd2', name: 'Blood_Test_Results_Q2.pdf', size: '2.4 MB', category: 'Lab Result', date: '2026-07-12' },
  { id: 'd3', name: 'Insurance_Card_Front.jpeg', size: '1.1 MB', category: 'Insurance', date: '2026-06-05' },
  { id: 'd4', name: 'Discharge_Summary_CityHosp.pdf', size: '542 KB', category: 'Discharge Summary', date: '2026-05-28', sharedWith: 'City Hospital Team' },
  { id: 'd5', name: 'Vaccination_Certificate_COVID.pdf', size: '1.8 MB', category: 'Vaccination Record', date: '2025-01-10' },
  { id: 'd6', name: 'Spine_MRI_Report.pdf', size: '6.2 MB', category: 'Imaging', date: '2025-11-02' },
  { id: 'd7', name: 'ECG_Tracing_Mar.pdf', size: '930 KB', category: 'Lab Result', date: '2026-03-14' },
];

export const DOC_CATEGORIES = ['Lab Result', 'Discharge Summary', 'Prescription', 'Imaging', 'Insurance', 'Vaccination Record', 'Other'];

export type Grant = { id: string; who: string; kind: 'doctor' | 'hospital' | 'lab'; affiliation: string; scope: string; expiry: string; expiringSoon?: boolean; categories: string[] };
export const GRANTS: Grant[] = [
  { id: 'g1', who: 'Dr. Amit Sharma', kind: 'doctor', affiliation: 'Cardiology · Apollo Hospital', scope: 'Everything', expiry: 'Expires 26 July 2026', categories: ['Documents', 'Lab Reports', 'Prescriptions', 'Appointments', 'Clinical Profile'] },
  { id: 'g2', who: 'Metro General Hospital', kind: 'hospital', affiliation: 'In-patient care team', scope: '4 of 12 records', expiry: 'No expiry', categories: ['Documents', 'Lab Reports'] },
  { id: 'g3', who: 'Dr. Kavita Patel', kind: 'doctor', affiliation: 'Endocrinology · City Clinic', scope: '2 of 12 records', expiry: 'Expires in 7 days', expiringSoon: true, categories: ['Lab Reports'] },
];

export const ACCESS_REQUESTS = [
  { id: 'r1', who: 'Dr. Rohan Verma', kind: 'doctor' as const, org: 'Orthopedics, City Spine Center', date: '26 June 2026', wants: ['Lab Reports', 'Prescriptions'], reason: 'Reviewing spine MRI and prior medication history ahead of consultation' },
  { id: 'r2', who: 'Apollo Diagnostics', kind: 'lab' as const, org: 'Jubilee Hills Branch', date: '24 June 2026', wants: ['Lab Reports', 'Prescriptions'], reason: 'Requisition verification for scheduled comprehensive diagnostic workup' },
];

export type LogEntry = { id: string; day: string; text: string; meta: string; kind: 'viewed' | 'downloaded' | 'changes' };
export const ACCESS_LOG: LogEntry[] = [
  { id: 'l1', day: 'Today', text: 'Dr. Amit Sharma viewed Blood_Test_Results_Q2.pdf', meta: 'Today, 10:42 AM · Blood_Test_Results_Q2.pdf', kind: 'viewed' },
  { id: 'l2', day: 'Today', text: 'Dr. Rohan Verma viewed Spine_MRI_Report.pdf', meta: 'Today, 09:15 AM · Spine_MRI_Report.pdf', kind: 'viewed' },
  { id: 'l3', day: 'Yesterday', text: 'Metro General Hospital viewed Discharge_Summary.pdf', meta: 'Yesterday, 3:00 PM · Discharge_Summary.pdf', kind: 'viewed' },
  { id: 'l4', day: 'Yesterday', text: 'Dr. Amit Sharma downloaded Complete_Blood_Count.pdf', meta: 'Yesterday, 11:20 AM · Complete_Blood_Count.pdf', kind: 'downloaded' },
  { id: 'l5', day: '12 June 2026', text: 'You gave access to Metro General Hospital', meta: '12 June 2026, 04:30 PM · Full Medical Profile', kind: 'changes' },
  { id: 'l6', day: '12 June 2026', text: 'You revoked access from Apollo Diagnostics', meta: '12 June 2026, 11:00 AM · Lab Reports & Prescriptions', kind: 'changes' },
];

export const CHAT_THREADS = [
  { id: 't1', name: 'Dr. Aditi Sharma', sub: 'Cardiology • Follow-up', last: 'Are you experiencing any side effects?', time: '10:42 AM', unread: 2 },
  { id: 't2', name: 'Dr. Emily Jones', sub: 'General Practice', last: 'Your lab results look completely normal.', time: 'Yesterday', unread: 0 },
  { id: 't3', name: 'Dr. Neha Kapoor', sub: 'Endocrinology', last: 'Prescription refilled. Should be at the pharmacy.', time: 'Mon', unread: 0 },
];

export type Msg = { id: string; from: 'doctor' | 'patient'; text: string; time: string };
export const CHAT_MESSAGES: Msg[] = [
  { id: 'm1', from: 'doctor', text: "Hello Priya, I've reviewed your latest lipid profile. The LDL levels have come down slightly since last month.", time: '10:32 AM' },
  { id: 'm2', from: 'doctor', text: 'Are you experiencing any side effects with the current dosage of Rosuvastatin?', time: '10:33 AM' },
  { id: 'm3', from: 'patient', text: 'Hi Doctor. No side effects, but I sometimes feel a bit tired in the evenings. Is that related?', time: '10:38 AM' },
  { id: 'm4', from: 'doctor', text: "Fatigue can be a mild side effect, though it's often linked to diet or stress. Let's do a quick video call to discuss your routine.", time: '10:41 AM' },
  { id: 'm5', from: 'patient', text: "Thank you, doctor. I'll get those ready for the call.", time: '10:42 AM' },
];

export const INVOICES = [
  { id: 'INV-24019', date: '2026-06-20', desc: 'Cardiology consultation — Dr. Sarah Chen', amount: 1500, status: 'Paid', method: 'UPI' },
  { id: 'INV-24011', date: '2026-06-15', desc: 'Lipid Profile — Apollo Labs', amount: 850, status: 'Paid', method: 'Card •• 4242' },
  { id: 'INV-24027', date: '2026-06-28', desc: 'Dermatology consultation — Dr. Amit Patel', amount: 1200, status: 'Due', method: '—' },
  { id: 'INV-23987', date: '2026-05-22', desc: 'Pulmonology tele-consult — Dr. Rajesh Kumar', amount: 900, status: 'Paid', method: 'UPI' },
  { id: 'INV-23950', date: '2026-05-10', desc: 'Chest X-Ray — Dr. Lal PathLabs', amount: 650, status: 'Refunded', method: 'Card •• 4242' },
];

/* ─────────────── Clinical (doctor) ─────────────── */

export type QueuePatient = { id: string; name: string; pid: string; age: number; gender: 'M' | 'F'; score: number | null; risk: string; date: string; time: string; type: string; status: string; reason: string; blood: string };
export const QUEUE: QueuePatient[] = [
  { id: 'q1', name: 'Ananya Sharma', pid: 'PID-9824-AX', age: 54, gender: 'F', score: 42, risk: 'Critical', date: '26 June 2026', time: '09:30 AM', type: 'Video', status: 'Active', reason: 'Severe chest pain, shortness of breath', blood: 'B+' },
  { id: 'q2', name: 'Vikram Desai', pid: 'PID-3312-BN', age: 47, gender: 'M', score: 68, risk: 'High', date: '26 June 2026', time: '10:15 AM', type: 'In-Person', status: 'Scheduled', reason: 'Post-op follow up, fever', blood: 'A+' },
  { id: 'q3', name: 'Neha Reddy', pid: 'PID-7741-CQ', age: 36, gender: 'F', score: 75, risk: 'Moderate', date: '26 June 2026', time: '11:00 AM', type: 'Tele', status: 'Scheduled', reason: 'Routine checkup, thyroid review', blood: 'O+' },
  { id: 'q4', name: 'Rajesh Kumar', pid: 'PID-1102-ZP', age: 61, gender: 'M', score: 92, risk: 'Healthy', date: '26 June 2026', time: '08:00 AM', type: 'Video', status: 'Completed', reason: 'Prescription refill', blood: 'O-' },
  { id: 'q5', name: 'Priya Patel', pid: 'PID-4458-ML', age: 29, gender: 'F', score: null, risk: 'N/A', date: '26 June 2026', time: '02:00 PM', type: 'In-Person', status: 'Cancelled', reason: 'Patient requested reschedule', blood: 'AB+' },
];

export const MY_PATIENTS = [
  { id: 'p1', name: 'Priya Sharma', gender: 'F', age: 32, healthId: 'PRV-882-901', blood: 'O+', score: 85, risk: 'Healthy' },
  { id: 'p2', name: 'Amit Kumar', gender: 'M', age: 45, healthId: 'PRV-102-445', blood: 'B-', score: 58, risk: 'Moderate' },
  { id: 'p3', name: 'Rohan Nair', gender: 'M', age: 61, healthId: 'PRV-993-211', blood: 'AB+', score: 32, risk: 'Critical' },
  { id: 'p4', name: 'Sunita Desai', gender: 'F', age: 28, healthId: 'PRV-441-766', blood: 'A+', score: 92, risk: 'Healthy' },
  { id: 'p5', name: 'Meenakshi Iyer', gender: 'F', age: 57, healthId: 'PRE-1042-C', blood: 'B+', score: 49, risk: 'High' },
  { id: 'p6', name: 'Karan Joshi', gender: 'M', age: 39, healthId: 'PRV-552-310', blood: 'O+', score: 81, risk: 'Healthy' },
];

export const DOCTOR = {
  name: 'Dr. Amit Kumar',
  title: 'Senior Cardiologist',
  qualification: 'MBBS, MD - Cardiology',
  specialization: 'Cardiology',
  license: 'MCI-123456',
  fee: 1500,
  years: 15,
  patients: '1,200+',
  consultations: '5,000+',
  mobile: '9876543210',
  email: 'dr.amit.kumar@prevntiv.in',
  bio: 'Dr. Amit Kumar is a highly experienced Senior Cardiologist with over 15 years of dedicated practice. He specializes in interventional cardiology and has successfully performed numerous complex angioplasties. Committed to preventative heart care, he believes in early detection and lifestyle management.',
  experience: [
    { role: 'Senior Cardiologist', institution: 'Apollo Hospital', start: '2010', end: 'Present' },
    { role: 'Consultant', institution: 'Wellness Center', start: '2002', end: '2006' },
  ],
};

/* ─────────────── Hospital ─────────────── */

export const WARDS = [
  { id: 'w1', name: 'General Ward A', type: 'Medical', occupied: 45, capacity: 100 },
  { id: 'w2', name: 'Surgical Wing East', type: 'Surgical', occupied: 42, capacity: 50 },
  { id: 'w3', name: 'ICU Central', type: 'Intensive Care', occupied: 19, capacity: 20 },
  { id: 'w4', name: 'Pediatrics Block', type: 'Pediatric', occupied: 20, capacity: 60 },
  { id: 'w5', name: 'Maternity Ward', type: 'Specialized', occupied: 24, capacity: 40 },
  { id: 'w6', name: 'Emergency Ward', type: 'Acute', occupied: 18, capacity: 25 },
];

export type Bed = { id: string; code: string; room: string; ward: string; status: 'Available' | 'Occupied' | 'Maintenance'; patient?: string };
export const BEDS: Bed[] = [
  { id: 'b1', code: 'G-101', room: 'Room 101', ward: 'General Ward', status: 'Available' },
  { id: 'b2', code: 'G-102', room: 'Room 101', ward: 'General Ward', status: 'Occupied', patient: 'Aarav Sharma' },
  { id: 'b3', code: 'G-103', room: 'Room 102', ward: 'General Ward', status: 'Occupied', patient: 'Karan Joshi' },
  { id: 'b4', code: 'G-104', room: 'Room 102', ward: 'General Ward', status: 'Available' },
  { id: 'b5', code: 'I-201', room: 'ICU Bay A', ward: 'ICU', status: 'Maintenance' },
  { id: 'b6', code: 'I-202', room: 'ICU Bay A', ward: 'ICU', status: 'Occupied', patient: 'Priya Patel' },
  { id: 'b7', code: 'I-203', room: 'ICU Bay B', ward: 'ICU', status: 'Occupied', patient: 'Ramesh Iyer' },
  { id: 'b8', code: 'S-205', room: 'Room 205', ward: 'Surgical', status: 'Occupied', patient: 'Rahul Desai' },
  { id: 'b9', code: 'S-206', room: 'Room 206', ward: 'Surgical', status: 'Available' },
  { id: 'b10', code: 'M-305', room: 'Suite 305', ward: 'Maternity', status: 'Available' },
  { id: 'b11', code: 'M-306', room: 'Suite 306', ward: 'Maternity', status: 'Occupied', patient: 'Pooja Nair' },
  { id: 'b12', code: 'E-001', room: 'Triage 1', ward: 'Emergency', status: 'Available' },
  { id: 'b13', code: 'E-012', room: 'Triage 4', ward: 'Emergency', status: 'Occupied', patient: 'Neha Gupta' },
  { id: 'b14', code: 'E-013', room: 'Triage 4', ward: 'Emergency', status: 'Maintenance' },
  { id: 'b15', code: 'P-110', room: 'Room 410', ward: 'Pediatrics', status: 'Available' },
  { id: 'b16', code: 'P-111', room: 'Room 410', ward: 'Pediatrics', status: 'Occupied', patient: 'Ishaan Rao' },
];

export type Admission = { id: string; date: string; time: string; patient: string; pid: string; reason: string; dept: string; bed: string; physician: string; status: string; scoreIn: number; scoreNow: number };
export const ADMISSIONS: Admission[] = [
  { id: 'ad1', date: '24 Jun 2026', time: '10:30 AM', patient: 'Aarav Sharma', pid: 'PR-9021A', reason: 'Acute Gastroenteritis', dept: 'General Ward', bed: 'Bed G-102', physician: 'Dr. Meera Reddy', status: 'Admitted', scoreIn: 54, scoreNow: 76 },
  { id: 'ad2', date: '25 Jun 2026', time: '02:15 AM', patient: 'Priya Patel', pid: 'PR-4432B', reason: 'Severe Respiratory Distress', dept: 'Intensive Care Unit', bed: 'Bed ICU-4', physician: 'Dr. Vikram Singh', status: 'ICU', scoreIn: 31, scoreNow: 44 },
  { id: 'ad3', date: '26 Jun 2026', time: '08:45 AM', patient: 'Rahul Desai', pid: 'PR-7781C', reason: 'Post-op Monitoring', dept: 'Surgical Ward', bed: 'Bed S-205', physician: 'Dr. Anita Kumar', status: 'Recovery', scoreIn: 62, scoreNow: 70 },
  { id: 'ad4', date: '26 Jun 2026', time: '11:20 AM', patient: 'Neha Gupta', pid: 'PR-1189C', reason: 'Mild Concussion Evaluation', dept: 'Emergency Dept', bed: 'Bed ER-12', physician: 'Dr. Sanjay Verma', status: 'Observation', scoreIn: 71, scoreNow: 74 },
  { id: 'ad5', date: '20 Jun 2026', time: '09:00 AM', patient: 'Karan Joshi', pid: 'PR-8820D', reason: 'Viral Fever', dept: '—', bed: 'Discharged', physician: 'Dr. Meera Reddy', status: 'Discharged', scoreIn: 66, scoreNow: 84 },
];

export const STAFF = [
  { id: 's1', name: 'Dr. Ananya Iyer', qual: 'MBBS, MD (Internal Medicine)', emp: 'EMP-7721', role: 'Doctor', shiftTime: '8:00 AM - 4:00 PM', shift: 'Morning' },
  { id: 's2', name: 'Kavita Sharma', qual: 'B.Sc Nursing', emp: 'EMP-7804', role: 'Nurse', shiftTime: '12:00 AM - 8:00 AM', shift: 'Night' },
  { id: 's3', name: 'Rajeev Menon', qual: 'MHA', emp: 'EMP-6502', role: 'Admin', shiftTime: '9:00 AM - 5:00 PM', shift: 'General' },
  { id: 's4', name: 'Dr. Vikram Singh', qual: 'MBBS, DM (Pulmonology)', emp: 'EMP-7110', role: 'Doctor', shiftTime: '4:00 PM - 12:00 AM', shift: 'Evening' },
  { id: 's5', name: 'Sneha Kulkarni', qual: 'GNM Nursing', emp: 'EMP-7902', role: 'Nurse', shiftTime: '8:00 AM - 4:00 PM', shift: 'Morning' },
  { id: 's6', name: 'Arif Khan', qual: 'B.Pharm', emp: 'EMP-6890', role: 'Pharmacist', shiftTime: '9:00 AM - 5:00 PM', shift: 'General' },
];

/* ─────────────── Platform admin ─────────────── */

export const APPLICATIONS = [
  { id: 'ap1', name: 'Dr. Rajesh Kumar', email: 'rajesh.k@example.com', mobile: '+91 98765 43210', role: 'doctor', title: 'Cardiology', detail: 'MBBS, MD (12 yrs exp)', reg: 'LIC-998877', date: '26 June 2026', time: '10:45 AM' },
  { id: 'ap2', name: 'Priya Sharma', email: 'contact@citydiagnostics.in', mobile: '+91 91234 56789', role: 'lab_admin', title: 'City Diagnostics', detail: '123 Health St, Andheri West, Mumbai', reg: 'REG-554433', date: '25 June 2026', time: '02:15 PM' },
  { id: 'ap3', name: 'Amit Patel', email: 'admin@apollospeciality.com', mobile: '+91 99887 76655', role: 'hospital_admin', title: 'Apollo Speciality Hospital', detail: 'Facility Capacity: 250 Beds', reg: 'REG-112233', date: '24 June 2026', time: '09:30 AM' },
  { id: 'ap4', name: 'Dr. Farah Siddiqui', email: 'farah.s@example.com', mobile: '+91 90000 11223', role: 'doctor', title: 'Physiotherapy', detail: 'BPT, MPT (6 yrs exp)', reg: 'LIC-771200', date: '23 June 2026', time: '05:10 PM' },
];

export const REGISTRY_PATIENTS = [
  { id: 'rp1', name: 'Arjun Sharma', gender: 'Male', age: 45, hid: '#PR-9021A', risk: 'Medium', score: 64 },
  { id: 'rp2', name: 'Priya Kapoor', gender: 'Female', age: 32, hid: '#PR-4432B', risk: 'Low', score: 88 },
  { id: 'rp3', name: 'Rajesh Mehta', gender: 'Male', age: 68, hid: '#PR-1189C', risk: 'High', score: 41 },
  { id: 'rp4', name: 'Sunita Devi', gender: 'Female', age: 71, hid: '#PR-8820D', risk: 'Medium', score: 59 },
  { id: 'rp5', name: 'Meenakshi Iyer', gender: 'Female', age: 57, hid: '#PRE-1042-C', risk: 'Critical', score: 28 },
  { id: 'rp6', name: 'Karan Joshi', gender: 'Male', age: 39, hid: '#PR-5523E', risk: 'Low', score: 81 },
];

export const REGISTRY_DOCTORS = [
  { id: 'rd1', name: 'Dr. Rajesh Kumar', code: 'D-4092', spec: 'Cardiology', license: 'MCI-847291', status: 'Active' },
  { id: 'rd2', name: 'Dr. Sneha Patel', code: 'D-4105', spec: 'Pediatrics', license: 'MCI-993021', status: 'Active' },
  { id: 'rd3', name: 'Dr. Amit Menon', code: 'D-3988', spec: 'Neurology', license: 'MCI-774102', status: 'On Leave' },
  { id: 'rd4', name: 'Dr. Ananya Iyer', code: 'D-4211', spec: 'Internal Medicine', license: 'MCI-660914', status: 'Active' },
];

export const REGISTRY_HOSPITALS = [
  { id: 'rh1', name: 'Apollo Medics', city: 'New Delhi, Delhi', reg: 'REG-2023-8942A', beds: 450, status: 'Active' },
  { id: 'rh2', name: 'Fortis Healthcare', city: 'Mumbai, Maharashtra', reg: 'REG-2021-3319B', beds: 820, status: 'Active' },
  { id: 'rh3', name: 'Max Super Speciality', city: 'Gurugram, Haryana', reg: 'REG-2024-1102C', beds: 250, status: 'Pending Review' },
];

export const REGISTRY_LABS = [
  { id: 'rl1', name: 'Apollo Diagnostics', reg: 'REG-2023-8472', address: '45, Jubilee Hills, Road No. 36, Hyderabad, Telangana 500033', status: 'Active' },
  { id: 'rl2', name: 'Dr. Lal PathLabs', reg: 'REG-2022-1193', address: 'Block E, Connaught Place, New Delhi 110001', status: 'Active' },
  { id: 'rl3', name: 'Metropolis Healthcare', reg: 'REG-2024-5501', address: '254B, Dr Annie Besant Rd, Worli, Mumbai, Maharashtra 400030', status: 'Active' },
];

export const NOTIFICATIONS = [
  { id: 'n1', title: 'Inventory Alert: Low Stock', body: 'Paracetamol 500mg stock is below the minimum threshold (15 units remaining). Please reorder immediately to avoid shortages in the upcoming week.', time: '10 mins ago', read: false },
  { id: 'n2', title: 'New Appointment Scheduled', body: 'Patient Rahul Sharma has scheduled a follow-up consultation with Dr. Kapoor for tomorrow at 10:30 AM.', time: '2 hours ago', read: true },
  { id: 'n3', title: 'Lab Results Available', body: 'Complete Blood Count (CBC) results for patient Priya Patel are now available for review in the patient portal.', time: 'Yesterday', read: false },
  { id: 'n4', title: 'Verification Approved', body: 'Dr. Vikram Singh has been verified and added to the network.', time: '2 days ago', read: true },
];

export const AUDIT = [
  { id: 'au1', time: '26 Jun 2026, 14:20', operator: 'Dr. Ananya Iyer', role: 'Doctor', patient: 'Rajesh Kumar', pid: 'PRE-9921-A', action: 'View' },
  { id: 'au2', time: '26 Jun 2026, 14:15', operator: 'SysAdmin_01', role: 'Admin', patient: 'Meenakshi Iyer', pid: 'PRE-1042-C', action: 'Export' },
  { id: 'au3', time: '26 Jun 2026, 13:50', operator: 'Dr. Vikram Singh', role: 'Doctor', patient: 'Amit Patel', pid: 'PRE-8834-B', action: 'Update' },
];

/* ─────────────── Vitals series ─────────────── */

const hours = ['12 AM', '02 AM', '04 AM', '06 AM', '08 AM', '10 AM', '12 PM', '02 PM', '04 PM', '06 PM', '08 PM', '10 PM'];
export const SERIES = {
  heart: hours.map((h, i) => ({ t: h, v: [58, 52, 48, 55, 72, 78, 74, 76, 88, 128, 75, 70][i] })),
  activity: hours.map((h, i) => ({ t: h, v: [20, 0, 0, 60, 280, 356, 310, 356, 498, 612, 426, 312][i] })),
  temp: hours.map((h, i) => ({ t: h, v: [97.6, 97.4, 97.1, 97.5, 98.2, 98.6, 98.9, 99.1, 100.6, 99.3, 99.8, 98.6][i] })),
  spo2: hours.map((h, i) => ({ t: h, v: [96, 95, 93, 94, 97, 98, 98, 99, 98, 97, 98, 98][i] })),
  score: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({ t: m, v: [72, 74, 78, 77, 82, 85][i] })),
};

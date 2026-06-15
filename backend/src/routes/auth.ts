import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { calculateBmi, computeHealthScore, calcAge, generateHealthId } from '../lib/health-score.js';

const router = Router();

// ── PATIENT SELF-REGISTRATION ────────────────────────────────────────────────
const PatientRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  mobile: z.string().min(10),
  dateOfBirth: z.string(),
  gender: z.string(),
  bloodGroup: z.string(),
  height: z.number().optional(),
  weight: z.number().optional(),
  existingDiseases: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  smokingStatus: z.string().optional(),
  alcoholConsumption: z.string().optional(),
  lifestyleInfo: z.string().optional(),
  previousConditions: z.string().optional(),
  surgeries: z.string().optional(),
  vaccinations: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

router.post('/auth/register/patient', async (req, res): Promise<void> => {
  const parsed = PatientRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password, ...profileData } = parsed.data;

  // 1. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // sends confirmation email
    app_metadata: { role: 'patient' },
  });

  if (authError || !authData.user) {
    res.status(400).json({ error: authError?.message || 'Failed to create account' });
    return;
  }

  try {
    const bmi = calculateBmi(profileData.height, profileData.weight);
    const { score, riskLevel } = computeHealthScore({ ...profileData, bmi });
    const age = calcAge(profileData.dateOfBirth);
    const healthId = generateHealthId();

    // 2. Insert into patients table
    const { data: patient, error: patError } = await supabase
      .from('patients')
      .insert({
        ...profileData,
        health_id: healthId,
        age,
        bmi,
        health_score: score,
        risk_level: riskLevel,
      })
      .select()
      .single();

    if (patError || !patient) throw new Error(patError?.message || 'Failed to create patient record');

    // 3. Insert into user_profiles
    await supabase.from('user_profiles').insert({
      id: authData.user.id,
      role: 'patient',
      entity_id: patient.id,
      full_name: profileData.fullName,
    });

    // 4. Update JWT custom claims
    await supabase.auth.admin.updateUserById(authData.user.id, {
      app_metadata: { role: 'patient', entity_id: patient.id },
    });

    res.status(201).json({
      message: 'Account created. Please check your email to confirm your account.',
      healthId: patient.health_id,
    });
  } catch (err: any) {
    // Rollback: delete the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    res.status(500).json({ error: err.message });
  }
});

// ── DOCTOR / LAB / HOSPITAL ADMIN APPLICATION ────────────────────────────────
const ApplicationSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('doctor'),
    fullName: z.string().min(2),
    email: z.string().email(),
    mobile: z.string().min(10),
    specialization: z.string(),
    qualification: z.string(),
    yearsOfExperience: z.number().int().min(0),
    licenseNumber: z.string().optional(),
    consultationFees: z.number().optional(),
    bio: z.string().optional(),
  }),
  z.object({
    role: z.literal('lab_admin'),
    fullName: z.string().min(2),
    email: z.string().email(),
    mobile: z.string().min(10),
    labName: z.string(),
    registrationNumber: z.string(),
    address: z.string().optional(),
  }),
  z.object({
    role: z.literal('hospital_admin'),
    fullName: z.string().min(2),
    email: z.string().email(),
    mobile: z.string().min(10),
    hospitalName: z.string(),
    registrationNumber: z.string(),
    address: z.string().optional(),
    totalBeds: z.number().int().optional(),
  }),
]);

router.post('/auth/apply', async (req, res): Promise<void> => {
  const parsed = ApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { data, error } = await supabase
    .from('pending_applications')
    .insert({
      role: parsed.data.role,
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      mobile: parsed.data.mobile,
      details: JSON.stringify(parsed.data),
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json({
    message: 'Application submitted successfully. You will be notified by email once reviewed.',
    applicationId: data.id,
  });
});

// ── APPROVE APPLICATION (Platform Admin only) ────────────────────────────────
router.post(
  '/auth/applications/:id/approve',
  authenticate,
  requireRole('platform_admin'),
  async (req: AuthRequest, res): Promise<void> => {
    const appId = parseInt(req.params.id as string, 10);

    const { data: application, error: fetchErr } = await supabase
      .from('pending_applications')
      .select('*')
      .eq('id', appId)
      .single();

    if (fetchErr || !application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.status !== 'pending') {
      res.status(400).json({ error: 'Application already processed' });
      return;
    }

    const details = JSON.parse(application.details || '{}');

    try {
      // 1. Invite user via Supabase (sends email with magic link)
      const { data: authData, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(
        application.email,
        { data: { role: application.role } }
      );
      if (inviteErr || !authData.user) throw new Error(inviteErr?.message || 'Failed to send invite');

      let entityId: number | null = null;

      // 2. Create domain entity record
      if (application.role === 'doctor') {
        const { data: doctor } = await supabase
          .from('doctors')
          .insert({
            full_name: application.full_name,
            email: application.email,
            mobile: application.mobile,
            specialization: details.specialization,
            qualification: details.qualification,
            years_of_experience: details.yearsOfExperience || 0,
            license_number: details.licenseNumber,
            consultation_fees: details.consultationFees,
            bio: details.bio,
            verification_status: 'approved',
          })
          .select()
          .single();
        entityId = doctor?.id ?? null;
      } else if (application.role === 'lab_admin') {
        const { data: lab } = await supabase
          .from('labs')
          .insert({
            name: details.labName,
            registration_number: details.registrationNumber,
            contact_person: application.full_name,
            mobile: application.mobile,
            email: application.email,
            address: details.address,
            verification_status: 'approved',
          })
          .select()
          .single();
        entityId = lab?.id ?? null;
      } else if (application.role === 'hospital_admin') {
        const { data: hospital } = await supabase
          .from('hospitals')
          .insert({
            name: details.hospitalName,
            registration_number: details.registrationNumber,
            mobile: application.mobile,
            email: application.email,
            address: details.address,
            total_beds: details.totalBeds,
          })
          .select()
          .single();
        entityId = hospital?.id ?? null;
      }

      // 3. Create user_profiles entry
      await supabase.from('user_profiles').insert({
        id: authData.user.id,
        role: application.role,
        entity_id: entityId,
        full_name: application.full_name,
      });

      // 4. Set custom claims
      await supabase.auth.admin.updateUserById(authData.user.id, {
        app_metadata: { role: application.role, entity_id: entityId },
      });

      // 5. Mark application as approved
      await supabase
        .from('pending_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', appId);

      res.json({ message: 'Application approved. Invite email sent.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ── REJECT APPLICATION ────────────────────────────────────────────────────────
router.post(
  '/auth/applications/:id/reject',
  authenticate,
  requireRole('platform_admin'),
  async (_req, res): Promise<void> => {
    const appId = parseInt(_req.params.id as string, 10);
    await supabase
      .from('pending_applications')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', appId);
    res.json({ message: 'Application rejected.' });
  }
);

// ── LIST APPLICATIONS ─────────────────────────────────────────────────────────
router.get(
  '/auth/applications',
  authenticate,
  requireRole('platform_admin'),
  async (req, res): Promise<void> => {
    const status = (req.query.status as string) || 'pending';
    const { data, error } = await supabase
      .from('pending_applications')
      .select('id, role, full_name, email, mobile, status, created_at, reviewed_at')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(data);
  }
);

// ── GET CURRENT USER PROFILE ──────────────────────────────────────────────────
router.get('/auth/me', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, role, entity_id, full_name, created_at')
    .eq('id', req.userId!)
    .single();

  if (error) { res.status(404).json({ error: 'Profile not found' }); return; }
  res.json(data);
});

export default router;

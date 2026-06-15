import { Router } from 'express';
import { supabase } from '../lib/supabase-admin.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }
}

const dashboardCache = new MemoryCache();

// GET /api/dashboard/stats — platform_admin full | hospital_admin hospital stats | doctor doctor stats
router.get('/dashboard/stats', authenticate, async (req: AuthRequest, res): Promise<void> => {
  const cacheKey = `${req.role}_${req.entityId || 'platform'}`;
  const cachedData = dashboardCache.get(cacheKey);
  if (cachedData) {
    res.json(cachedData);
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  let responseData: any = {};

  if (req.role === 'platform_admin') {
    const [patients, doctors, labs, hospitals, appointments, reports, pendingVerifications] = await Promise.all([
      supabase.from('patients').select('id, risk_level', { count: 'exact' }),
      supabase.from('doctors').select('id', { count: 'exact' }),
      supabase.from('labs').select('id', { count: 'exact' }),
      supabase.from('hospitals').select('id', { count: 'exact' }),
      supabase.from('appointments').select('id').eq('scheduled_date', today),
      supabase.from('reports').select('id', { count: 'exact' }),
      supabase.from('pending_applications').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]);

    const patientData = patients.data || [];
    responseData = {
      totalPatients: patients.count ?? patientData.length,
      totalDoctors: doctors.count ?? 0,
      totalLabs: labs.count ?? 0,
      totalHospitals: hospitals.count ?? 0,
      criticalPatients: patientData.filter((p: any) => p.risk_level === 'critical').length,
      todayAppointments: appointments.data?.length ?? 0,
      totalReports: reports.count ?? 0,
      pendingVerifications: pendingVerifications.count ?? 0,
    };

  } else if (req.role === 'hospital_admin') {
    const [beds, admissions, staff] = await Promise.all([
      supabase.from('beds').select('id, status, hospital_id').eq('hospital_id', req.entityId!),
      supabase.from('admissions').select('id, status').eq('hospital_id', req.entityId!),
      supabase.from('staff').select('id, role').eq('hospital_id', req.entityId!),
    ]);
    const bedList = beds.data || [];
    const admList = admissions.data || [];
    const staffList = staff.data || [];
    responseData = {
      totalBeds: bedList.length,
      availableBeds: bedList.filter((b: any) => b.status === 'available').length,
      occupiedBeds: bedList.filter((b: any) => b.status === 'occupied').length,
      totalAdmitted: admList.filter((a: any) => a.status !== 'discharged').length,
      icuPatients: admList.filter((a: any) => a.status === 'icu').length,
      doctorsOnDuty: staffList.filter((s: any) => s.role === 'doctor').length,
      nursesOnDuty: staffList.filter((s: any) => s.role === 'nurse').length,
    };

  } else if (req.role === 'doctor') {
    const { data: appts } = await supabase.from('appointments').select('patient_id, status, scheduled_date').eq('doctor_id', req.entityId!);
    const apptList = appts || [];
    const uniquePatients = new Set(apptList.map((a: any) => a.patient_id));
    responseData = {
      totalPatients: uniquePatients.size,
      todayAppointments: apptList.filter((a: any) => a.scheduled_date === today).length,
      pendingAppointments: apptList.filter((a: any) => a.status === 'scheduled' && a.scheduled_date >= today).length,
      completedToday: apptList.filter((a: any) => a.scheduled_date === today && a.status === 'completed').length,
    };

  } else if (req.role === 'lab_admin') {
    const { data: reports } = await supabase.from('reports').select('id, is_critical, created_at').eq('lab_id', req.entityId!);
    const reportList = reports || [];
    responseData = {
      totalReports: reportList.length,
      criticalReports: reportList.filter((r: any) => r.is_critical).length,
      todayReports: reportList.filter((r: any) => r.created_at?.startsWith(today)).length,
    };

  } else if (req.role === 'patient') {
    const [patient, appts, reports] = await Promise.all([
      supabase.from('patients').select('health_score, risk_level, bmi, blood_group').eq('id', req.entityId!).single(),
      supabase.from('appointments').select('id, status, scheduled_date').eq('patient_id', req.entityId!),
      supabase.from('reports').select('id, is_critical').eq('patient_id', req.entityId!),
    ]);
    const apptList = appts.data || [];
    responseData = {
      healthScore: patient.data?.health_score ?? 0,
      riskLevel: patient.data?.risk_level ?? 'healthy',
      bmi: patient.data?.bmi,
      bloodGroup: patient.data?.blood_group,
      upcomingAppointments: apptList.filter((a: any) => a.status === 'scheduled' && a.scheduled_date >= today).length,
      totalReports: reports.data?.length ?? 0,
      criticalReports: reports.data?.filter((r: any) => r.is_critical).length ?? 0,
    };
  } else {
    responseData = {};
  }

  // Cache stats for 30 seconds
  dashboardCache.set(cacheKey, responseData, 30000);
  res.json(responseData);
});

// GET /api/dashboard/risk-distribution — platform_admin only
router.get('/dashboard/risk-distribution', authenticate, requireRole('platform_admin'), async (_req, res): Promise<void> => {
  const { data } = await supabase.from('patients').select('risk_level');
  const dist: Record<string, number> = { healthy: 0, moderate: 0, high: 0, critical: 0 };
  (data || []).forEach((p: any) => {
    const k = p.risk_level || 'healthy';
    if (k in dist) dist[k]++;
  });
  res.json(Object.entries(dist).map(([riskLevel, count]) => ({ riskLevel, count })));
});

// GET /api/dashboard/activity — platform_admin only (recent activity feed)
router.get('/dashboard/activity', authenticate, requireRole('platform_admin'), async (_req, res): Promise<void> => {
  const [patients, doctors, appointments, reports] = await Promise.all([
    supabase.from('patients').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('doctors').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('appointments').select('id, patient_id, scheduled_date, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('reports').select('id, report_name, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const activity = [
    ...(patients.data || []).map((p: any) => ({ id: `p${p.id}`, type: 'patient', description: 'New patient registered', entityName: p.full_name, timestamp: p.created_at })),
    ...(doctors.data || []).map((d: any) => ({ id: `d${d.id}`, type: 'doctor', description: 'Doctor onboarded', entityName: d.full_name, timestamp: d.created_at })),
    ...(appointments.data || []).map((a: any) => ({ id: `a${a.id}`, type: 'appointment', description: 'Appointment booked', entityName: `Patient #${a.patient_id}`, timestamp: a.created_at })),
    ...(reports.data || []).map((r: any) => ({ id: `r${r.id}`, type: 'report', description: 'Lab report uploaded', entityName: r.report_name, timestamp: r.created_at })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  res.json(activity);
});

export default router;

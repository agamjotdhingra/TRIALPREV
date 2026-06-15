import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { get, post, patch, del } from './client';

// ── DASHBOARD ───────────────────────────────────────────────────────────────
export function useGetDashboardStats() {
  return useQuery<any>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => get('/dashboard/stats'),
  });
}

export function useGetRecentActivity() {
  return useQuery<any[]>({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => get('/dashboard/activity'),
  });
}

export function useGetRiskDistribution() {
  return useQuery<any[]>({
    queryKey: ['dashboard', 'risk-distribution'],
    queryFn: () => get('/dashboard/risk-distribution'),
  });
}

// ── PATIENTS ────────────────────────────────────────────────────────────────
export function useListPatients(params: { search?: string; bloodGroup?: string; riskLevel?: string } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['patients', params],
    queryFn: () => get(`/patients?${queryStr}`),
  });
}

export function useGetPatient(id: string | number, options?: { query?: Partial<UseQueryOptions<any>> }) {
  return useQuery<any>({
    queryKey: ['patient', id],
    queryFn: () => get(`/patients/${id}`),
    enabled: !!id,
    ...(options?.query as any),
  });
}

export function useGetPatientMe() {
  return useQuery<any>({
    queryKey: ['patient', 'me'],
    queryFn: () => get('/patients/me'),
  });
}

export function useGetPatientByHealthId(healthId: string) {
  return useQuery<any>({
    queryKey: ['patient', 'by-health-id', healthId],
    queryFn: () => get(`/patients/by-health-id/${healthId}`),
    enabled: !!healthId,
  });
}

export function useGetPatientHealthScore(id: string | number, options?: { query?: Partial<UseQueryOptions<any>> }) {
  return useQuery<any>({
    queryKey: ['health-score', id],
    queryFn: () => get(`/patients/${id}/health-score`),
    enabled: !!id,
    ...(options?.query as any),
  });
}

export function useUpdatePatientMe() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => patch('/patients/me', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

// ── DOCTORS ─────────────────────────────────────────────────────────────────
export function useListDoctors(params: { search?: string; specialization?: string } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['doctors', params],
    queryFn: () => get(`/doctors?${queryStr}`),
  });
}

export function useGetDoctor(id: string | number) {
  return useQuery<any>({
    queryKey: ['doctor', id],
    queryFn: () => get(`/doctors/${id}`),
    enabled: !!id,
  });
}

export function useGetDoctorMe() {
  return useQuery<any>({
    queryKey: ['doctor', 'me'],
    queryFn: () => get('/doctors/me'),
  });
}

export function useUpdateDoctorMe() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => patch('/doctors/me', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'me'] });
    },
  });
}

// ── APPOINTMENTS ────────────────────────────────────────────────────────────
export function useListAppointments(params: { patientId?: string | number; doctorId?: string | number } = {}, options?: { query?: Partial<UseQueryOptions<any[]>> }) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['appointments', params],
    queryFn: () => get(`/appointments?${queryStr}`),
    ...(options?.query as any),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => post('/appointments', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: number | string; status: string } & any>({
    mutationFn: ({ id, ...body }) => patch(`/appointments/${id}/status`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ── PRESCRIPTIONS ───────────────────────────────────────────────────────────
export function useListPrescriptions(params: { patientId?: string | number; doctorId?: string | number } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['prescriptions', params],
    queryFn: () => get(`/prescriptions?${queryStr}`),
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => post('/prescriptions', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
}

// ── LABS & REPORTS ──────────────────────────────────────────────────────────
export function useListLabs() {
  return useQuery<any[]>({
    queryKey: ['labs'],
    queryFn: () => get('/labs'),
  });
}

export function useGetLabMe() {
  return useQuery<any>({
    queryKey: ['lab', 'me'],
    queryFn: () => get('/labs/me'),
  });
}

export function useListReports(params: { patientId?: string | number; category?: string } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['reports', params],
    queryFn: () => get(`/reports?${queryStr}`),
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => post('/reports', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

// ── HOSPITALS, WARDS, BEDS, STAFF & ADMISSIONS ──────────────────────────────
export function useListHospitals() {
  return useQuery<any[]>({
    queryKey: ['hospitals'],
    queryFn: () => get('/hospitals'),
  });
}

export function useGetHospitalMe() {
  return useQuery<any>({
    queryKey: ['hospital', 'me'],
    queryFn: () => get('/hospitals/me'),
  });
}

export function useListWards(params: { hospitalId?: string | number } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['wards', params],
    queryFn: () => get(`/wards?${queryStr}`),
  });
}

export function useCreateWard() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => post('/wards', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wards'] });
    },
  });
}

export function useListBeds(params: { wardId?: string | number } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['beds', params],
    queryFn: () => get(`/beds?${queryStr}`),
  });
}

export function useCreateBed() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => post('/beds', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] });
    },
  });
}

export function useListStaff(params: { hospitalId?: string | number } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['staff', params],
    queryFn: () => get(`/staff?${queryStr}`),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => post('/staff', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useListAdmissions(params: { hospitalId?: string | number } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['admissions', params],
    queryFn: () => get(`/admissions?${queryStr}`),
  });
}

export function useCreateAdmission() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => post('/admissions', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDischargeAdmission() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: number | string; dischargeDate: string; notes?: string }>({
    mutationFn: ({ id, dischargeDate, notes }) => patch(`/admissions/${id}`, { status: 'discharged', discharge_date: dischargeDate, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ── DOCUMENTS ───────────────────────────────────────────────────────────────
export function useListDocuments(params: { patientId?: string | number } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['documents', params],
    queryFn: () => get(`/documents?${queryStr}`),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (body) => post('/documents', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// ── NOTIFICATIONS ───────────────────────────────────────────────────────────
export function useListNotifications(params: {} = {}) {
  return useQuery<any[]>({
    queryKey: ['notifications', params],
    queryFn: () => get('/notifications'),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string | number>({
    mutationFn: (id) => patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ── PENDING APPLICATIONS & VERIFICATIONS ────────────────────────────────────
export function useListPendingApplications(params: { status?: 'pending' | 'approved' | 'rejected' } = {}) {
  const queryStr = new URLSearchParams(params as any).toString();
  return useQuery<any[]>({
    queryKey: ['applications', params],
    queryFn: () => get(`/auth/applications?${queryStr}`),
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string | number>({
    mutationFn: (id) => post(`/auth/applications/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string | number>({
    mutationFn: (id) => post(`/auth/applications/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

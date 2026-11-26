import { Switch, Route, Redirect } from 'wouter';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { ProtectedRoute } from '@/auth/ProtectedRoute';

// Auth pages
import LoginPage from '@/auth/LoginPage';
import RegisterPage from '@/auth/RegisterPage';
import ApplyPage from '@/auth/ApplyPage';
import PhoneVerify from '@/auth/PhoneVerify';
import Welcome from '@/pages/public/Welcome';
import RoleSelect from '@/pages/public/RoleSelect';
import PatientOnboarding from '@/pages/onboarding/PatientOnboarding';
import PatientHealth from '@/pages/patient/Health';
import VitalDetail from '@/pages/patient/VitalDetail';
import BookLab from '@/pages/patient/BookLab';
import UploadDocument from '@/pages/patient/UploadDocument';
import RecentlyDeleted from '@/pages/patient/RecentlyDeleted';
import Billing from '@/pages/patient/Billing';
import { WhoHasAccess, ManageAccess, AccessRequests, GiveAccess, AccessLog, ChooseRecordsPage } from '@/pages/patient/Access';
import Chat from '@/pages/shared/Chat';
import ClinicalSummary from '@/pages/shared/ClinicalSummary';
import Discharge from '@/pages/hospital-admin/Discharge';

// Patient pages
import PatientLayout from '@/layouts/PatientLayout';
import PatientDashboard from '@/pages/patient/Dashboard';
import PatientAppointments from '@/pages/patient/Appointments';
import PatientPrescriptions from '@/pages/patient/Prescriptions';
import PatientReports from '@/pages/patient/Reports';
import PatientDocuments from '@/pages/patient/Documents';
import PatientProfile from '@/pages/patient/Profile';

// Doctor pages
import DoctorLayout from '@/layouts/DoctorLayout';
import DoctorDashboard from '@/pages/doctor/Dashboard';
import DoctorQueue from '@/pages/doctor/Queue';
import DoctorAppointments from '@/pages/doctor/Appointments';
import DoctorPatients from '@/pages/doctor/Patients';
import CreatePrescription from '@/pages/doctor/CreatePrescription';
import DoctorProfile from '@/pages/doctor/Profile';

// Hospital Admin pages
import HospitalAdminLayout from '@/layouts/HospitalAdminLayout';
import HospitalDashboard from '@/pages/hospital-admin/Dashboard';
import HospitalWards from '@/pages/hospital-admin/Wards';
import HospitalBeds from '@/pages/hospital-admin/Beds';
import HospitalAdmissions from '@/pages/hospital-admin/Admissions';
import HospitalStaff from '@/pages/hospital-admin/Staff';

// Lab Admin pages
import LabAdminLayout from '@/layouts/LabAdminLayout';
import LabDashboard from '@/pages/lab-admin/Dashboard';
import LabSearchPatient from '@/pages/lab-admin/SearchPatient';
import LabUploadReport from '@/pages/lab-admin/UploadReport';
import LabReports from '@/pages/lab-admin/Reports';

// Platform Admin pages
import PlatformAdminLayout from '@/layouts/PlatformAdminLayout';
import AdminDashboard from '@/pages/platform-admin/Dashboard';
import AdminPatients from '@/pages/platform-admin/Patients';
import AdminDoctors from '@/pages/platform-admin/Doctors';
import AdminLabs from '@/pages/platform-admin/Labs';
import AdminHospitals from '@/pages/platform-admin/Hospitals';
import AdminVerifications from '@/pages/platform-admin/Verifications';
import AdminNotifications from '@/pages/platform-admin/Notifications';

// Shared components
import PatientEHR from '@/pages/shared/PatientEHR';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RoleBasedHome() {
  const { role } = useAuth();
  if (role === 'patient') return <Redirect to="/patient/dashboard" />;
  if (role === 'doctor') return <Redirect to="/doctor/dashboard" />;
  if (role === 'hospital_admin') return <Redirect to="/hospital/dashboard" />;
  if (role === 'lab_admin') return <Redirect to="/lab/dashboard" />;
  if (role === 'platform_admin') return <Redirect to="/admin/dashboard" />;
  return <Redirect to="/auth/login" />;
}

function AppRoutes() {
  return (
    <Switch>
      {/* Public auth routes */}
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route path="/auth/apply" component={ApplyPage} />
      <Route path="/auth/signup/:kind" component={ApplyPage} />
      <Route path="/auth/phone" component={PhoneVerify} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/role" component={RoleSelect} />
      <Route path="/onboarding/:step?" component={PatientOnboarding} />

      {/* Root — redirect based on role */}
      <Route path="/">
        <ProtectedRoute><RoleBasedHome /></ProtectedRoute>
      </Route>

      {/* ── PATIENT ──────────────────────────────── */}
      <Route path="/patient/*">
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientLayout>
            <Switch>
              <Route path="/patient/dashboard" component={PatientDashboard} />
              <Route path="/patient/health" component={PatientHealth} />
              <Route path="/patient/vitals/:metric" component={VitalDetail} />
              <Route path="/patient/appointments/book-lab" component={BookLab} />
              <Route path="/patient/appointments" component={PatientAppointments} />
              <Route path="/patient/documents/upload" component={UploadDocument} />
              <Route path="/patient/documents/deleted" component={RecentlyDeleted} />
              <Route path="/patient/access/requests" component={AccessRequests} />
              <Route path="/patient/access/grant" component={GiveAccess} />
              <Route path="/patient/access/log" component={AccessLog} />
              <Route path="/patient/access/:id/choose/:category" component={ChooseRecordsPage} />
              <Route path="/patient/access/:id" component={ManageAccess} />
              <Route path="/patient/access" component={WhoHasAccess} />
              <Route path="/patient/chat">{() => <Chat role="patient" />}</Route>
              <Route path="/patient/billing" component={Billing} />
              <Route path="/patient/summary/:id" component={ClinicalSummary} />
              <Route path="/patient/records" component={PatientEHR} />
              <Route path="/patient/prescriptions" component={PatientPrescriptions} />
              <Route path="/patient/reports" component={PatientReports} />
              <Route path="/patient/documents" component={PatientDocuments} />
              <Route path="/patient/profile" component={PatientProfile} />
              <Route><Redirect to="/patient/dashboard" /></Route>
            </Switch>
          </PatientLayout>
        </ProtectedRoute>
      </Route>

      {/* ── DOCTOR ───────────────────────────────── */}
      <Route path="/doctor/*">
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorLayout>
            <Switch>
              <Route path="/doctor/dashboard" component={DoctorDashboard} />
              <Route path="/doctor/queue" component={DoctorQueue} />
              <Route path="/doctor/appointments" component={DoctorAppointments} />
              <Route path="/doctor/summary/:id" component={ClinicalSummary} />
              <Route path="/doctor/chat">{() => <Chat role="doctor" />}</Route>
              <Route path="/doctor/patients/:id" component={PatientEHR} />
              <Route path="/doctor/patients" component={DoctorPatients} />
              <Route path="/doctor/prescriptions/new" component={CreatePrescription} />
              <Route path="/doctor/profile" component={DoctorProfile} />
              <Route><Redirect to="/doctor/dashboard" /></Route>
            </Switch>
          </DoctorLayout>
        </ProtectedRoute>
      </Route>

      {/* ── HOSPITAL ADMIN ────────────────────────── */}
      <Route path="/hospital/*">
        <ProtectedRoute allowedRoles={['hospital_admin']}>
          <HospitalAdminLayout>
            <Switch>
              <Route path="/hospital/dashboard" component={HospitalDashboard} />
              <Route path="/hospital/wards" component={HospitalWards} />
              <Route path="/hospital/beds" component={HospitalBeds} />
              <Route path="/hospital/admissions/:id/discharge" component={Discharge} />
              <Route path="/hospital/admissions" component={HospitalAdmissions} />
              <Route path="/hospital/summary/:id" component={ClinicalSummary} />
              <Route path="/hospital/patients/:id" component={PatientEHR} />
              <Route path="/hospital/staff" component={HospitalStaff} />
              <Route><Redirect to="/hospital/dashboard" /></Route>
            </Switch>
          </HospitalAdminLayout>
        </ProtectedRoute>
      </Route>

      {/* ── LAB ADMIN ─────────────────────────────── */}
      <Route path="/lab/*">
        <ProtectedRoute allowedRoles={['lab_admin']}>
          <LabAdminLayout>
            <Switch>
              <Route path="/lab/dashboard" component={LabDashboard} />
              <Route path="/lab/search" component={LabSearchPatient} />
              <Route path="/lab/upload" component={LabUploadReport} />
              <Route path="/lab/reports" component={LabReports} />
              <Route><Redirect to="/lab/dashboard" /></Route>
            </Switch>
          </LabAdminLayout>
        </ProtectedRoute>
      </Route>

      {/* ── PLATFORM ADMIN ───────────────────────── */}
      <Route path="/admin/*">
        <ProtectedRoute allowedRoles={['platform_admin']}>
          <PlatformAdminLayout>
            <Switch>
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/summary/:id" component={ClinicalSummary} />
              <Route path="/admin/patients/:id" component={PatientEHR} />
              <Route path="/admin/patients">{() => <div className="legacy"><AdminPatients /></div>}</Route>
              <Route path="/admin/doctors">{() => <div className="legacy"><AdminDoctors /></div>}</Route>
              <Route path="/admin/labs">{() => <div className="legacy"><AdminLabs /></div>}</Route>
              <Route path="/admin/hospitals">{() => <div className="legacy"><AdminHospitals /></div>}</Route>
              <Route path="/admin/verifications" component={AdminVerifications} />
              <Route path="/admin/notifications">{() => <div className="legacy"><AdminNotifications /></div>}</Route>
              <Route><Redirect to="/admin/dashboard" /></Route>
            </Switch>
          </PlatformAdminLayout>
        </ProtectedRoute>
      </Route>

      {/* Unauthorized */}
      <Route path="/unauthorized">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
            <p className="text-muted-foreground">You don't have permission to view this page.</p>
          </div>
        </div>
      </Route>

      {/* 404 */}
      <Route>
        <Redirect to="/welcome" />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton toastOptions={{ style: { fontFamily: 'Inter, sans-serif', borderRadius: 14 } }} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

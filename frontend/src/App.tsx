import { Route, Switch, Link } from 'wouter';
import Gateway from './pages/Gateway';
import PatientDashboard from './pages/patient/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';

const PlaceholderLayout = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-50 p-6 font-['Plus_Jakarta_Sans',sans-serif]">
    <div className="mx-auto max-w-7xl">
      <nav className="mb-8 flex gap-4 flex-wrap bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Link href="/">
          <span className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-[#015C3D] transition-colors">Gateway</span>
        </Link>
        <Link href="/patient">
          <span className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-[#015C3D] transition-colors">Patient Portal</span>
        </Link>
        <Link href="/doctor">
          <span className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-[#015C3D] transition-colors">Doctor Workspace</span>
        </Link>
        <Link href="/admin">
          <span className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-[#015C3D] transition-colors">Hospital/Lab Admin</span>
        </Link>
        <Link href="/super-admin">
          <span className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-[#015C3D] transition-colors">Super-Admin</span>
        </Link>
      </nav>
      
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">{title}</h1>
        <div className="text-[#334155] mb-8 text-lg leading-relaxed">
          {children}
        </div>
        <button className="px-8 py-3 rounded-md font-bold tracking-wide text-white bg-gradient-to-r from-[#015C3D] to-[#029C6B] hover:opacity-90 transition-opacity shadow-md">
          PRIMARY ACTION
        </button>
      </div>
    </div>
  </div>
);

const HospitalAdmin = () => (
  <PlaceholderLayout title="Hospital / Lab Admin">
    <p>Monitor live ward occupancy, track pending laboratory diagnostics, and oversee operational throughput and staff publishing statuses.</p>
  </PlaceholderLayout>
);

const SuperAdmin = () => (
  <PlaceholderLayout title="Platform Super-Admin">
    <p>Manage global system integrity, review credential verification pipelines, and monitor live system activity logs in the terminal simulator.</p>
  </PlaceholderLayout>
);

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Gateway} />
      <Route path="/patient" component={PatientDashboard} />
      <Route path="/doctor" component={DoctorDashboard} />
      <Route path="/admin" component={HospitalAdmin} />
      <Route path="/super-admin" component={SuperAdmin} />
      <Route>
        <PlaceholderLayout title="404 - Endpoint Not Found">
          <p>The requested module could not be located in the HealthOS system.</p>
        </PlaceholderLayout>
      </Route>
    </Switch>
  );
}

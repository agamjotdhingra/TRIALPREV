import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Activity, Users, Stethoscope, Clock, FileText, FlaskConical, Building2, LayoutGrid, HeartPulse, UserCircle, Bell } from "lucide-react";

import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients/index";
import PatientEHR from "@/pages/patients/[id]";
import NewPatient from "@/pages/patients/new";
import Doctors from "@/pages/doctors/index";
import DoctorProfile from "@/pages/doctors/[id]";
import DoctorQueue from "@/pages/doctors/queue";
import Appointments from "@/pages/appointments/index";
import Prescriptions from "@/pages/prescriptions/index";
import Labs from "@/pages/labs/index";
import Reports from "@/pages/reports/index";
import Hospitals from "@/pages/hospitals/index";
import HospitalCommandCenter from "@/pages/hospitals/[id]";
import Wards from "@/pages/wards/index";
import Admissions from "@/pages/admissions/index";
import Staff from "@/pages/staff/index";
import Notifications from "@/pages/notifications/index";

const queryClient = new QueryClient();

function Sidebar() {
  const [location] = useLocation();

  const navGroups = [
    {
      title: "Patient Care",
      items: [
        { href: "/patients", icon: Users, label: "Patient Registry" },
        { href: "/appointments", icon: Clock, label: "Appointments" },
        { href: "/prescriptions", icon: FileText, label: "Prescriptions" },
      ]
    },
    {
      title: "Clinical",
      items: [
        { href: "/doctors", icon: Stethoscope, label: "Doctor Registry" },
        { href: "/labs", icon: FlaskConical, label: "Lab Network" },
        { href: "/reports", icon: Activity, label: "Lab Reports" },
      ]
    },
    {
      title: "Hospital Ops",
      items: [
        { href: "/hospitals", icon: Building2, label: "Hospitals" },
        { href: "/wards", icon: LayoutGrid, label: "Wards" },
        { href: "/admissions", icon: HeartPulse, label: "Admissions" },
      ]
    },
    {
      title: "Administration",
      items: [
        { href: "/staff", icon: UserCircle, label: "Staff Registry" },
        { href: "/notifications", icon: Bell, label: "Notifications" },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col flex-shrink-0">
      <div className="h-14 flex items-center px-4 font-semibold text-lg border-b border-sidebar-border gap-2">
        <Activity className="w-5 h-5 text-sidebar-primary" />
        HealthOS
      </div>
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        <div className="px-3">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === "/" ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"}`}>
            <LayoutGrid className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
        {navGroups.map((group) => (
          <div key={group.title} className="px-3">
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-6 bg-card flex-shrink-0">
          <div className="font-semibold text-sm">HealthOS Platform</div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      
      <Route path="/patients" component={Patients} />
      <Route path="/patients/new" component={NewPatient} />
      <Route path="/patients/:id" component={PatientEHR} />
      
      <Route path="/doctors" component={Doctors} />
      <Route path="/doctors/:id" component={DoctorProfile} />
      <Route path="/doctors/:id/queue" component={DoctorQueue} />
      
      <Route path="/appointments" component={Appointments} />
      <Route path="/prescriptions" component={Prescriptions} />
      <Route path="/labs" component={Labs} />
      <Route path="/reports" component={Reports} />
      
      <Route path="/hospitals" component={Hospitals} />
      <Route path="/hospitals/:id" component={HospitalCommandCenter} />
      <Route path="/wards" component={Wards} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/staff" component={Staff} />
      <Route path="/notifications" component={Notifications} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppShell>
            <Router />
          </AppShell>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
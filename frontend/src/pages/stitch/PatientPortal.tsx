import { useState } from "react";
import { Link } from "wouter";
import { 
  HeartPulse, 
  User, 
  Calendar, 
  Activity, 
  FileText, 
  Pill, 
  ArrowRight,
  TrendingUp,
  Clock,
  Menu,
  X
} from "lucide-react";

export default function PatientPortal() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = {
    healthScore: 85,
    riskLevel: "Low Risk",
    vitals: {
      bp: "120/80",
      heartRate: "72 bpm",
      temp: "98.6 °F",
      weight: "165 lbs"
    },
    upcomingAppointments: 1,
    illnesses: "Essential Hypertension (I10)",
    allergies: "Penicillin (Moderate)",
    medications: "Lisinopril 10mg Daily"
  };

  const quickActions = [
    { label: "Book Appointment", desc: "Schedule a visit with your physician", icon: Calendar },
    { label: "My Health Record", desc: "View detailed longitudinal EHR", icon: Activity },
    { label: "Lab Reports", desc: "Check diagnostic observations", icon: FileText },
    { label: "My Prescriptions", desc: "Access medication prescriptions", icon: Pill }
  ];

  return (
    <div className="bg-slate-50 text-[#0F172A] font-sans min-h-screen flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <nav className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 shrink-0 py-8 px-6 justify-between h-screen sticky top-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <span className="p-2 rounded-lg bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white flex items-center justify-center">
              <HeartPulse className="h-6 w-6" />
            </span>
            <span className="font-extrabold uppercase tracking-tight text-xl bg-gradient-to-r from-[#015C3D] to-[#029C6B] bg-clip-text text-transparent">
              PREVNTIVE
            </span>
          </div>

          <div className="flex flex-col items-center border-b border-slate-100 pb-6 mb-8 text-center">
            <div className="h-20 w-20 rounded-full border-2 border-slate-200 shadow-md overflow-hidden mb-4 bg-slate-100 flex items-center justify-center text-[#029C6B]">
              <User className="h-10 w-10" />
            </div>
            <h2 className="font-bold text-slate-900">Sarah Jenkins</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">Health ID: HID-9021-X</p>
          </div>

          <div className="flex flex-col gap-2">
            <a className="flex items-center gap-4 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white rounded-md px-4 py-3 shadow-md font-semibold text-sm" href="#">
              <Activity className="h-5 w-5" />
              Health Dashboard
            </a>
            <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
              <Calendar className="h-5 w-5" />
              Appointments
            </a>
            <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
              <Pill className="h-5 w-5" />
              Prescriptions
            </a>
            <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
              <FileText className="h-5 w-5" />
              Lab Reports
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 border-t border-slate-100">
          <Link href="/">
            <a className="flex items-center justify-center gap-2 border border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-md hover:bg-slate-50 transition-colors">
              Return to Gateway
            </a>
          </Link>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden flex justify-between items-center w-full px-6 bg-white border-b border-slate-200 h-16 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-6 w-6 text-[#029C6B]" />
          <span className="font-extrabold uppercase tracking-tight text-lg bg-gradient-to-r from-[#015C3D] to-[#029C6B] bg-clip-text text-transparent">
            PREVNTIVE
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-md"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 flex flex-col p-6 justify-between animate-fade-in border-t border-slate-100">
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 text-left">
              <div className="h-12 w-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-[#029C6B]">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Sarah Jenkins</h2>
                <p className="text-xs text-slate-500 font-mono">ID: HID-9021-X</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a className="flex items-center gap-4 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white rounded-md px-4 py-3 shadow-md font-semibold text-sm" href="#">
                <Activity className="h-5 w-5" />
                Health Dashboard
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <Calendar className="h-5 w-5" />
                Appointments
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <Pill className="h-5 w-5" />
                Prescriptions
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <FileText className="h-5 w-5" />
                Lab Reports
              </a>
            </div>
          </div>
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <Link href="/">
              <a className="flex items-center justify-center gap-2 border border-slate-200 text-slate-600 font-bold text-xs py-3.5 rounded-md w-full">
                Return to Gateway
              </a>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hello, Sarah Jenkins</h1>
            <p className="text-slate-500 mt-1 font-semibold text-sm">Welcome back to your unified healthcare portal.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-[#015C3D] px-4 py-2 border border-emerald-250 font-bold text-xs rounded-md">
            <span className="h-2 w-2 rounded-full bg-[#029C6B] animate-pulse"></span>
            Health Profile Current
          </div>
        </div>

        {/* Top Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <div className="border border-slate-200 bg-white p-6 shadow-md rounded-xl flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-450 text-xs font-bold uppercase tracking-wider mb-4">My Health Score</h3>
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-8 border-emerald-500/10">
              <div className="text-3xl font-black text-[#029C6B]">{stats.healthScore}</div>
            </div>
            <span className="mt-4 px-3 py-1 bg-emerald-100 text-[#015C3D] font-bold text-xs rounded-full">
              {stats.riskLevel}
            </span>
          </div>

          {/* Vitals Summary Card */}
          <div className="border border-slate-200 bg-white p-6 shadow-md rounded-xl">
            <h3 className="text-slate-450 text-xs font-bold uppercase tracking-wider mb-4">Current Vitals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">BP</span>
                <p className="font-extrabold text-slate-900 text-lg mt-0.5">{stats.vitals.bp}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Heart Rate</span>
                <p className="font-extrabold text-slate-900 text-lg mt-0.5">{stats.vitals.heartRate}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Temp</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{stats.vitals.temp}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Weight</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{stats.vitals.weight}</p>
              </div>
            </div>
          </div>

          {/* Schedule / Actions Card */}
          <div className="border border-slate-200 bg-white p-6 shadow-md rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-slate-450 text-xs font-bold uppercase tracking-wider mb-4">Upcoming Schedule</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#029C6B] flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{stats.upcomingAppointments}</p>
                  <p className="text-xs text-slate-500 font-semibold">Scheduled outpatient visits</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs py-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-md shadow-md">
              Book New Visit
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Detailed Logs & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medical Summary */}
          <div className="lg:col-span-2 border border-slate-200 bg-white p-6 shadow-md rounded-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#029C6B]" />
              Longitudinal Health Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Existing Conditions</span>
                <p className="text-slate-800 font-bold text-sm mt-1">{stats.illnesses}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 border-l-4 border-l-red-500">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Allergies</span>
                <p className="text-slate-800 font-bold text-sm mt-1 text-red-650">{stats.allergies}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Medications</span>
              <p className="text-slate-800 font-bold text-sm mt-1">{stats.medications}</p>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="border border-slate-200 bg-white p-6 shadow-md rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Tools</h3>
            <div className="flex flex-col gap-3">
              {quickActions.map((action, idx) => (
                <a key={idx} href="#" className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-250 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#029C6B] flex items-center justify-center shrink-0 group-hover:bg-gradient-to-r group-hover:from-[#015C3D] group-hover:to-[#029C6B] group-hover:text-white transition-all shadow-sm">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm leading-none group-hover:text-[#015C3D] transition">{action.label}</p>
                    <p className="text-slate-500 text-xs mt-1.5 truncate font-semibold">{action.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Link } from 'wouter';
import { User, Stethoscope, Building2, FlaskConical, ShieldAlert, Siren, Activity, ArrowRight } from 'lucide-react';

export default function Gateway() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-white border-b border-slate-200 z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-gradient-to-br from-[#015C3D] to-[#029C6B] text-white p-2 rounded-lg shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-[#015C3D] to-[#029C6B] bg-clip-text text-transparent">
              PREVNTIVE
            </span>
          </div>
          <button className="bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm px-5 py-2.5 uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity rounded-md shadow-md">
            <Siren className="h-5 w-5" />
            <span className="hidden sm:inline">Emergency SOS</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center">
        <div className="text-center mb-16 sm:mb-20 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] mb-6 tracking-tight">Prevntive Gateway</h1>
          <p className="text-lg sm:text-xl text-[#334155] leading-relaxed">
            Select your designated authorization role to access the centralized medical management network and unified patient records system.
          </p>
        </div>

        {/* Bento Grid Layout for Roles */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 w-full">
          {/* Patient Card */}
          <div className="col-span-1 md:col-span-2 border border-[#D4C4A8] bg-white p-8 sm:p-10 shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 rounded-xl">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-full border border-[#D4C4A8] flex items-center justify-center bg-white mb-6 group-hover:bg-gradient-to-br group-hover:from-[#015C3D] group-hover:to-[#029C6B] transition-colors duration-300 shadow-sm">
                <User className="h-7 w-7 text-[#015C3D] group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Patient Portal</h2>
              <p className="text-[#334155] leading-relaxed">
                Access your comprehensive medical history, view verified test results, and manage your upcoming appointments securely.
              </p>
            </div>
            <Link href="/patient">
              <button className="w-full bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-lg shadow-md uppercase tracking-wider cursor-pointer">
                Login to Portal
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="col-span-1 md:col-span-2 border border-[#D4C4A8] bg-white p-8 sm:p-10 shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 rounded-xl">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-full border border-[#D4C4A8] flex items-center justify-center bg-white mb-6 group-hover:bg-gradient-to-br group-hover:from-[#015C3D] group-hover:to-[#029C6B] transition-colors duration-300 shadow-sm">
                <Stethoscope className="h-7 w-7 text-[#015C3D] group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Clinical Dashboard</h2>
              <p className="text-[#334155] leading-relaxed">
                Review patient charts, issue electronic prescriptions, and manage daily clinical workflows with high-precision tools.
              </p>
            </div>
            <Link href="/doctor">
              <button className="w-full bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-lg shadow-md uppercase tracking-wider cursor-pointer">
                Login to Clinic
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Hospital Admin Card */}
          <div className="col-span-1 md:col-span-2 border border-[#D4C4A8] bg-white p-8 sm:p-10 shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 rounded-xl">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-full border border-[#D4C4A8] flex items-center justify-center bg-white mb-6 group-hover:bg-gradient-to-br group-hover:from-[#015C3D] group-hover:to-[#029C6B] transition-colors duration-300 shadow-sm">
                <Building2 className="h-7 w-7 text-[#015C3D] group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Hospital Admin</h2>
              <p className="text-[#334155] leading-relaxed">
                Oversee facility operations, manage staff credentialing, and monitor operational analytics across all departments.
              </p>
            </div>
            <Link href="/admin">
              <button className="w-full bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-lg shadow-md uppercase tracking-wider cursor-pointer">
                Manage Facility
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Lab Admin Card */}
          <div className="col-span-1 md:col-span-3 border border-[#D4C4A8] bg-white p-8 sm:p-10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center group hover:-translate-y-1 transition-all duration-300 gap-6 rounded-xl">
            <div className="flex-1 flex flex-col md:flex-row items-start gap-6">
              <div className="w-14 h-14 shrink-0 rounded-full border border-[#D4C4A8] flex items-center justify-center bg-white group-hover:bg-gradient-to-br group-hover:from-[#015C3D] group-hover:to-[#029C6B] transition-colors duration-300 shadow-sm">
                <FlaskConical className="h-7 w-7 text-[#015C3D] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Laboratory Network</h2>
                <p className="text-[#334155] leading-relaxed max-w-sm">
                  Process diagnostic requisitions, input verified pathology results, and manage clinical testing supplies.
                </p>
              </div>
            </div>
            <Link href="/admin">
              <button className="w-full md:w-auto shrink-0 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm px-8 py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-lg shadow-md uppercase tracking-wider cursor-pointer">
                Manage Lab
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Platform Admin Card */}
          <div className="col-span-1 md:col-span-3 border border-[#D4C4A8] bg-white p-8 sm:p-10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center group hover:-translate-y-1 transition-all duration-300 gap-6 rounded-xl">
            <div className="flex-1 flex flex-col md:flex-row items-start gap-6">
              <div className="w-14 h-14 shrink-0 rounded-full border border-[#D4C4A8] flex items-center justify-center bg-white group-hover:bg-gradient-to-br group-hover:from-[#015C3D] group-hover:to-[#029C6B] transition-colors duration-300 shadow-sm">
                <ShieldAlert className="h-7 w-7 text-[#015C3D] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Platform Infrastructure</h2>
                <p className="text-[#334155] leading-relaxed max-w-sm">
                  Configure global system parameters, audit access logs, and maintain compliance standards across the network.
                </p>
              </div>
            </div>
            <Link href="/super-admin">
              <button className="w-full md:w-auto shrink-0 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm px-8 py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-lg shadow-md uppercase tracking-wider cursor-pointer">
                System Settings
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
            © 2026 PREVNTIVE SYSTEMS. ALL RIGHTS RESERVED.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a className="text-xs font-bold text-slate-500 hover:text-[#0F172A] transition-colors uppercase tracking-wider" href="#">Privacy Policy</a>
            <a className="text-xs font-bold text-slate-500 hover:text-[#0F172A] transition-colors uppercase tracking-wider" href="#">Terms of Service</a>
            <a className="text-xs font-bold text-slate-500 hover:text-[#0F172A] transition-colors uppercase tracking-wider" href="#">Compliance & HIPAA</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

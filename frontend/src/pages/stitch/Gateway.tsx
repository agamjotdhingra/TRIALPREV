import { Link } from "wouter";
import { 
  Stethoscope, 
  User, 
  Building2, 
  FlaskConical, 
  ShieldAlert, 
  ArrowRight,
  HeartPulse
} from "lucide-react";

export default function Gateway() {
  return (
    <div className="bg-slate-50 text-[#0F172A] font-sans min-h-screen flex flex-col justify-between">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-white border-b border-slate-100 z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white flex items-center justify-center">
              <HeartPulse className="h-6 w-6" />
            </span>
            <span className="font-extrabold uppercase tracking-tight text-xl bg-gradient-to-r from-[#015C3D] to-[#029C6B] bg-clip-text text-transparent">
              PREVNTIVE
            </span>
          </div>
          <button className="bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs px-5 py-3 uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity rounded-md shadow-md">
            <ShieldAlert className="h-4 w-4" />
            EMERGENCY SOS
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-16 flex flex-col items-center justify-center">
        <div className="text-center mb-16 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Prevntive Gateway
          </h1>
          <p className="text-lg text-slate-650 leading-relaxed max-w-2xl mx-auto">
            Select your designated authorization role to access the centralized medical management network and unified patient records system.
          </p>
        </div>

        {/* Bento Grid Layout for Roles */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 w-full">
          {/* Patient Card */}
          <div className="col-span-1 md:col-span-2 border border-slate-200 bg-white p-10 shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 rounded-xl">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center bg-white mb-6 group-hover:bg-gradient-to-r group-hover:from-[#015C3D] group-hover:to-[#029C6B] group-hover:text-white transition-colors duration-300 shadow-sm text-[#029C6B]">
                <User className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Patient Portal</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Access your comprehensive medical history, view verified test results, and manage your upcoming appointments securely.
              </p>
            </div>
            <Link href="/patient">
              <a className="w-full bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-md shadow-md">
                LOGIN TO PORTAL
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="col-span-1 md:col-span-2 border border-slate-200 bg-white p-10 shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 rounded-xl">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center bg-white mb-6 group-hover:bg-gradient-to-r group-hover:from-[#015C3D] group-hover:to-[#029C6B] group-hover:text-white transition-colors duration-300 shadow-sm text-[#029C6B]">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Clinical Dashboard</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Review patient charts, issue electronic prescriptions, and manage daily clinical workflows with high-precision tools.
              </p>
            </div>
            <Link href="/doctor">
              <a className="w-full bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-md shadow-md">
                LOGIN TO CLINIC
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>

          {/* Hospital Admin Card */}
          <div className="col-span-1 md:col-span-2 border border-slate-200 bg-white p-10 shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 rounded-xl">
            <div className="mb-8">
              <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center bg-white mb-6 group-hover:bg-gradient-to-r group-hover:from-[#015C3D] group-hover:to-[#029C6B] group-hover:text-white transition-colors duration-300 shadow-sm text-[#029C6B]">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Hospital Admin</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Oversee facility operations, manage staff credentialing, and monitor operational analytics across all departments.
              </p>
            </div>
            <Link href="/admin">
              <a className="w-full bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-md shadow-md">
                MANAGE FACILITY
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>

          {/* Lab Admin Card */}
          <div className="col-span-1 md:col-span-3 border border-slate-200 bg-white p-10 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center group hover:-translate-y-1 transition-all duration-300 gap-8 rounded-xl">
            <div className="flex-1 flex flex-col sm:flex-row items-start gap-6">
              <div className="w-14 h-14 shrink-0 rounded-full border border-slate-200 flex items-center justify-center bg-white group-hover:bg-gradient-to-r group-hover:from-[#015C3D] group-hover:to-[#029C6B] group-hover:text-white transition-colors duration-300 shadow-sm text-[#029C6B]">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Laboratory Network</h2>
                <p className="text-slate-600 text-sm max-w-md leading-relaxed">
                  Process diagnostic requisitions, input verified pathology results, and manage inventory of clinical testing supplies.
                </p>
              </div>
            </div>
            <Link href="/admin">
              <a className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs px-6 py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-md shadow-md">
                MANAGE LAB
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>

          {/* Platform Admin Card */}
          <div className="col-span-1 md:col-span-3 border border-slate-200 bg-white p-10 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center group hover:-translate-y-1 transition-all duration-300 gap-8 rounded-xl">
            <div className="flex-1 flex flex-col sm:flex-row items-start gap-6">
              <div className="w-14 h-14 shrink-0 rounded-full border border-slate-200 flex items-center justify-center bg-white group-hover:bg-gradient-to-r group-hover:from-[#015C3D] group-hover:to-[#029C6B] group-hover:text-white transition-colors duration-300 shadow-sm text-[#029C6B]">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Platform Infrastructure</h2>
                <p className="text-slate-600 text-sm max-w-md leading-relaxed">
                  Configure global system parameters, audit access logs, and maintain compliance standards across the Prevntive network.
                </p>
              </div>
            </div>
            <Link href="/super-admin">
              <a className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs px-6 py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-md shadow-md">
                SYSTEM SETTINGS
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 bg-white py-8 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            © 2026 PREVNTIVE SYSTEMS. ALL RIGHTS RESERVED.
          </p>
          <nav className="flex items-center gap-6">
            <a className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase hover:underline" href="#">Privacy Policy</a>
            <a className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase hover:underline" href="#">Terms of Service</a>
            <a className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase hover:underline" href="#">Compliance & HIPAA</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'wouter';
import { Activity, Calendar, FileText, CreditCard, ChevronRight, Clock, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PatientDashboard() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#015C3D]" />
            <span className="text-xl font-bold text-[#0F172A] tracking-tight">Patient Portal</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <span className="text-sm font-semibold text-slate-500 hover:text-[#0F172A] transition-colors cursor-pointer">Back to Gateway</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-1">Good morning, Alex.</h1>
            <p className="text-[#334155]">Your overall health metrics look stable today.</p>
          </div>
          <button className="bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm px-6 py-3 hover:opacity-90 transition-opacity flex items-center gap-2 rounded-lg shadow-md uppercase tracking-wider shrink-0">
            <Plus className="h-4 w-4" />
            Book Appointment
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Appointments & Scheduling */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#015C3D]" />
                  <h2 className="text-lg font-bold text-[#0F172A]">Appointments</h2>
                </div>
                <button className="text-sm font-bold text-[#015C3D] hover:underline">View All</button>
              </div>
              
              {/* Upcoming Appointment */}
              <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-[#0F172A]">Dr. Sarah Jenkins</h3>
                    <p className="text-sm text-[#334155]">Cardiology Follow-up</p>
                  </div>
                  <span className="bg-emerald-100 text-[#015C3D] text-xs font-bold px-2.5 py-1 rounded-md uppercase">Confirmed</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-4">
                  <Clock className="h-4 w-4" />
                  <span>Oct 24, 2026 • 10:30 AM</span>
                </div>
              </div>

              {/* Scheduling CTA */}
              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-sm text-[#334155] mb-3">Due for your annual physical?</p>
                <button className="w-full border-2 border-slate-200 text-[#0F172A] font-bold text-sm py-2.5 hover:border-[#015C3D] hover:text-[#015C3D] transition-colors rounded-lg">
                  Schedule Now
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Medical Records Summary */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#015C3D]" />
                  <h2 className="text-lg font-bold text-[#0F172A]">Medical Records</h2>
                </div>
                <button className="text-sm font-bold text-[#015C3D] hover:underline">Full History</button>
              </div>

              {/* Lab Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0F172A]">Comprehensive Metabolic Panel</h4>
                      <p className="text-xs text-slate-500">Oct 10, 2026 • Normal</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#015C3D] transition-colors" />
                </div>

                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0F172A]">Lipid Panel</h4>
                      <p className="text-xs text-slate-500">Sep 15, 2026 • Review Needed</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#015C3D] transition-colors" />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Active Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-[#0F172A]">Hypertension</span>
                  <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-[#0F172A]">Mild Asthma</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Billing & Payments */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-[#015C3D]" />
                <h2 className="text-lg font-bold text-[#0F172A]">Billing Status</h2>
              </div>

              {/* Outstanding Balance */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 mb-6 text-center">
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Current Balance</p>
                <h3 className="text-3xl font-extrabold text-[#0F172A] mb-4">$124.50</h3>
                <button className="w-full bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm py-2.5 hover:opacity-90 transition-opacity rounded-lg shadow-sm">
                  Pay Now
                </button>
              </div>

              {/* Recent Invoices */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Transactions</h3>
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A]">Cardiology Consult</p>
                    <p className="text-xs text-slate-500">Oct 10, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-[#0F172A]">$124.50</p>
                    <p className="text-xs text-amber-600 font-semibold">Unpaid</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A]">Lab Diagnostics</p>
                    <p className="text-xs text-slate-500">Sep 15, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-[#0F172A]">$45.00</p>
                    <p className="text-xs text-emerald-600 font-semibold">Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

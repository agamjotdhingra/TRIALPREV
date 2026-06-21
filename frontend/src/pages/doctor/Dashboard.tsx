import { Link } from 'wouter';
import { 
  Stethoscope, Users, Search, Clock, CheckCircle2, ChevronRight, 
  FileText, Activity, AlertCircle, Pill, Plus, Send
} from 'lucide-react';

export default function DoctorDashboard() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-6 h-16 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-[#015C3D]" />
            <span className="text-xl font-bold text-[#0F172A] tracking-tight">Clinical Dashboard</span>
          </div>
          <nav className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Dr. Sarah Jenkins
            </div>
            <Link href="/">
              <span className="text-sm font-semibold text-slate-500 hover:text-[#0F172A] transition-colors cursor-pointer">Back to Gateway</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* 3-Column Console Layout */}
      <main className="flex-1 p-6 w-full max-w-[2560px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] min-h-[800px]">
          
          {/* Column 1: Patient Queue (3 cols on desktop) */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#015C3D]" />
                  Consultation Queue
                </h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">8 Today</span>
              </div>
              
              <div className="relative mb-4">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search patient..." 
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#015C3D] focus:border-transparent transition-all"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {/* Active Patient Card */}
                <div className="border border-[#015C3D] bg-emerald-50/30 rounded-lg p-3 cursor-pointer shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#015C3D] to-[#029C6B]"></div>
                  <div className="flex justify-between items-start mb-1 ml-1">
                    <h3 className="font-bold text-[#0F172A] text-sm">Marcus Johnson</h3>
                    <span className="text-xs font-bold text-[#015C3D] bg-emerald-100 px-1.5 py-0.5 rounded">In Progress</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-1 mb-2">Age: 45 • ID: #84920</p>
                  <p className="text-xs font-semibold text-[#334155] ml-1">Reason: Hypertension Follow-up</p>
                </div>

                {/* Scheduled Patient Card */}
                <div className="border border-slate-200 bg-white rounded-lg p-3 cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[#0F172A] text-sm">Elena Rodriguez</h3>
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Clock className="h-3 w-3" /> 10:30 AM
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Age: 32 • ID: #11023</p>
                  <p className="text-xs text-[#334155]">Reason: Chronic Migraines</p>
                </div>

                {/* Completed Patient Card */}
                <div className="border border-slate-100 bg-slate-50 opacity-70 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-slate-600 text-sm">David Chen</h3>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Age: 58 • ID: #99321</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: EHR Viewer (6 cols on desktop) */}
          <div className="lg:col-span-6 flex flex-col gap-4 h-full">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col h-full overflow-hidden">
              <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Marcus Johnson</h1>
                  <p className="text-sm text-slate-500">Male • 45 Yrs • DOB: 12-Apr-1981 • Blood: O+</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wide">Hypertension</span>
                  <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wide">Penicillin Allergy</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {/* Clinical Notes */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Clinical Notes
                  </h3>
                  <textarea 
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#015C3D] resize-none"
                    placeholder="Enter subjective and objective observations here..."
                    defaultValue="Patient reports occasional shortness of breath during exertion. Blood pressure reads 145/90 today. Compliant with current Lisinopril dosage but numbers remain elevated."
                  ></textarea>
                </div>

                {/* Vitals Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 font-semibold mb-1">BP</p>
                    <p className="font-bold text-[#0F172A]">145/90</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Heart Rate</p>
                    <p className="font-bold text-[#0F172A]">82 bpm</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Temp</p>
                    <p className="font-bold text-[#0F172A]">98.6°F</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 font-semibold mb-1">SpO2</p>
                    <p className="font-bold text-[#0F172A]">98%</p>
                  </div>
                </div>

                {/* Historic Lab Reports */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Recent Diagnostics
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-white border-b border-slate-100 group cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">Lipid Panel</p>
                          <p className="text-xs text-slate-500">Oct 05, 2026 • Elevated LDL</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white group cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">Metabolic Panel</p>
                          <p className="text-xs text-slate-500">Oct 05, 2026 • Normal</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Digital Prescription (3 cols on desktop) */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Pill className="h-5 w-5 text-[#015C3D]" />
                  Rx Module
                </h2>
              </div>
              
              <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
                
                {/* Active Meds */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Active</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">Lisinopril</p>
                      <p className="text-xs text-slate-500">10mg • Once Daily</p>
                    </div>
                    <button className="text-xs font-bold text-red-600 hover:underline">Discontinue</button>
                  </div>
                </div>

                <hr className="border-slate-100 my-1" />

                {/* Add New Rx Form */}
                <div className="flex-1 flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">New Prescription</p>
                  
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">Medication Name</label>
                    <input type="text" placeholder="e.g. Amlodipine" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#015C3D]" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">Dosage</label>
                      <input type="text" placeholder="5mg" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#015C3D]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">Frequency</label>
                      <select className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#015C3D]">
                         <option>Daily</option>
                         <option>BID</option>
                         <option>PRN</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">Pharmacy Routing / Notes</label>
                    <textarea rows={3} placeholder="Add instructions..." className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#015C3D] resize-none"></textarea>
                  </div>
                  
                  <button className="w-full border border-dashed border-[#015C3D] text-[#015C3D] font-bold text-sm py-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1 mt-1">
                    <Plus className="h-4 w-4" /> Add to Order
                  </button>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 border-t border-slate-100 bg-white">
                <button className="w-full bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-sm py-3 hover:opacity-90 transition-opacity rounded-lg shadow-md uppercase tracking-wider flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Sign & Send E-Rx
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

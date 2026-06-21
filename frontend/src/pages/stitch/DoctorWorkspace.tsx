import { useState } from "react";
import { Link } from "wouter";
import { 
  HeartPulse, 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  User, 
  FileText, 
  Pill, 
  FlaskConical, 
  Activity, 
  Send,
  Plus,
  LayoutDashboard,
  Menu,
  ChevronRight,
  ClipboardList
} from "lucide-react";

export default function DoctorWorkspace() {
  const [activeTab, setActiveTab] = useState("queue");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [route, setRoute] = useState("Oral");
  const [frequency, setFrequency] = useState("QD (Once a day)");
  const [duration, setDuration] = useState("30");
  const [dispense, setDispense] = useState("30");
  const [instructions, setInstructions] = useState("");
  const [daw, setDaw] = useState(false);
  const [stagedCount, setStagedCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medication) return;
    alert(`Prescription submitted for Sarah Jenkins:\n${medication} ${dosage} - ${route} - ${frequency}`);
    // Clear form
    setMedication("");
    setDosage("");
    setInstructions("");
    setDaw(false);
  };

  return (
    <div className="bg-slate-50 text-[#0F172A] font-sans h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 md:px-8 bg-white border-b border-slate-200 h-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-md"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-extrabold text-lg md:text-xl uppercase tracking-tight bg-gradient-to-r from-[#015C3D] to-[#029C6B] bg-clip-text text-transparent flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-[#029C6B]" />
            ClinicalCore ERP
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              className="pl-11 pr-4 py-2 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 w-80 text-sm shadow-sm transition-all" 
              placeholder="Search patient..." 
              type="text" 
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center text-[#029C6B] shadow-sm font-bold">
            DS
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Side Bar */}
        <nav className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 ease-in-out md:relative md:flex flex-col w-72 bg-white border-r border-slate-200 shrink-0 py-8 z-40 justify-between h-full overflow-y-auto`}>
          <div>
            <div className="px-6 mb-8 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full border-2 border-slate-200 shadow-md bg-slate-100 flex items-center justify-center text-[#029C6B] text-xl font-bold mb-4">
                DR
              </div>
              <h2 className="font-bold text-slate-900">Dr. Smith</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Cardiology Dept</p>
              <button className="mt-6 w-full py-3 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs rounded-md shadow-md hover:opacity-90 transition-opacity">
                New Consultation
              </button>
            </div>

            <div className="flex-grow space-y-1 px-4">
              <a className="flex items-center gap-4 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white rounded-md px-4 py-3 shadow-md font-semibold text-sm" href="#">
                <ClipboardList className="h-5 w-5" />
                Consultation Queue
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <User className="h-5 w-5" />
                EHR Viewer
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <Pill className="h-5 w-5" />
                Prescriptions
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <FlaskConical className="h-5 w-5" />
                Laboratory
              </a>
            </div>
          </div>

          <div className="px-4 pt-6 border-t border-slate-100">
            <Link href="/">
              <a className="flex items-center justify-center gap-2 border border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-md w-full hover:bg-slate-50 transition-colors">
                Return to Gateway
              </a>
            </Link>
          </div>
        </nav>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden fixed inset-0 bg-black/20 z-30"
          ></div>
        )}

        {/* 3 Column Desktop Workspace */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white">
          {/* Column 1: Consultation Queue */}
          <section className="w-full lg:w-[340px] xl:w-[380px] border-r border-slate-200 flex flex-col shrink-0 bg-white">
            <header className="p-6 border-b border-slate-200 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Queue</h2>
              <div className="mt-4 flex gap-3">
                <span className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-md text-slate-600">All (12)</span>
                <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white rounded-md shadow-sm">Waiting (4)</span>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Active patient */}
              <div className="p-5 border border-[#029C6B] border-l-4 border-l-[#029C6B] rounded-lg bg-white shadow-md cursor-pointer hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-slate-900 text-sm">Sarah Jenkins</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white rounded-md">In-Consultation</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>09:30 AM</span>
                  <span>ID: PT-8829</span>
                </div>
              </div>
              {/* Waiting patient */}
              <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm cursor-pointer hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-slate-900 text-sm">Michael Chang</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200">Waiting</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>10:00 AM</span>
                  <span>ID: PT-7102</span>
                </div>
              </div>
              {/* Waiting patient */}
              <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm cursor-pointer hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-slate-900 text-sm">Elena Rodriguez</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200">Waiting</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>10:30 AM</span>
                  <span>ID: PT-3391</span>
                </div>
              </div>
              {/* Completed patient */}
              <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm opacity-60">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-slate-900 text-sm">Robert Fox</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">Completed</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>09:00 AM</span>
                  <span>ID: PT-1104</span>
                </div>
              </div>
            </div>
          </section>

          {/* Column 2: EHR Viewer (Center) */}
          <section className="flex-grow border-r border-slate-200 flex flex-col min-w-0 bg-white">
            <header className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Sarah Jenkins
                  <span className="w-2 h-2 rounded-full bg-[#029C6B]"></span>
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">Female, 42 yrs • DOB: 14 May 1981 • Blood Type: O+</p>
              </div>
              <button className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm font-semibold text-xs">
                <FileText className="h-4 w-4 text-[#029C6B]" />
                Full EHR History
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Vitals */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Current Vitals</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm hover:border-[#029C6B] transition-colors">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">BP</span>
                    <div className="text-lg font-black text-slate-900 mt-1">120/80</div>
                    <span className="text-[10px] text-[#029C6B] font-bold">Normal</span>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm hover:border-[#029C6B] transition-colors">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Heart Rate</span>
                    <div className="text-lg font-black text-slate-900 mt-1">72 bpm</div>
                    <span className="text-[10px] text-[#029C6B] font-bold">Normal</span>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm hover:border-[#029C6B] transition-colors">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Temp</span>
                    <div className="text-lg font-black text-slate-900 mt-1">98.6 °F</div>
                    <span className="text-[10px] text-[#029C6B] font-bold">Normal</span>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm border-l-4 border-l-orange-400">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weight</span>
                    <div className="text-lg font-black text-slate-900 mt-1">165 lbs</div>
                    <span className="text-[10px] text-orange-500 font-bold">+2 lbs</span>
                  </div>
                </div>
              </div>

              {/* Active Diagnoses */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Active Diagnoses</h3>
                <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">Essential Hypertension (I10)</span>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Diagnosed: 12 Aug 2021</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] rounded-md">Chronic</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">Type 2 Diabetes Mellitus (E11.9)</span>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Diagnosed: 05 Nov 2022</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] rounded-md">Managed</span>
                  </div>
                </div>
              </div>

              {/* Consultation Notes */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Consultation Notes</h3>
                <textarea 
                  className="w-full h-32 p-4 border border-slate-200 rounded-lg focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 text-sm resize-none shadow-sm font-sans" 
                  placeholder="Enter clinical observations, chief complaints, and exam findings here..."
                ></textarea>
              </div>
            </div>
          </section>

          {/* Column 3: Digital Prescription Module */}
          <section className="w-full lg:w-[350px] xl:w-[420px] flex flex-col bg-white shrink-0">
            <header className="p-6 border-b border-slate-200 bg-white">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-5 w-5 text-[#029C6B]" />
                Digital Prescription
              </h2>
            </header>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Medication</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input 
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 text-sm shadow-sm" 
                      placeholder="Search drug database..." 
                      type="text"
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Dosage</label>
                    <input 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 text-sm shadow-sm" 
                      placeholder="e.g. 50mg" 
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Route</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 text-sm shadow-sm"
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                    >
                      <option>Oral</option>
                      <option>Intravenous</option>
                      <option>Topical</option>
                      <option>Sublingual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Frequency</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 text-sm shadow-sm"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option>QD (Once a day)</option>
                    <option>BID (Twice a day)</option>
                    <option>TID (Three times a day)</option>
                    <option>QID (Four times a day)</option>
                    <option>PRN (As needed)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Duration (Days)</label>
                    <input 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 text-sm shadow-sm" 
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Dispense Qty</label>
                    <input 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 text-sm shadow-sm" 
                      type="number"
                      value={dispense}
                      onChange={(e) => setDispense(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Instructions</label>
                  <textarea 
                    className="w-full h-20 p-4 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 text-sm resize-none shadow-sm" 
                    placeholder="Take with food..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    className="w-4.5 h-4.5 border border-slate-300 rounded text-[#029C6B] focus:ring-[#029C6B] bg-white cursor-pointer" 
                    id="daw" 
                    type="checkbox"
                    checked={daw}
                    onChange={(e) => setDaw(e.target.checked)}
                  />
                  <label className="text-xs font-bold text-slate-600 cursor-pointer select-none" htmlFor="daw">
                    Dispense as Written (DAW)
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs rounded-md shadow-md hover:opacity-90 transition-opacity flex justify-center items-center gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    Submit Prescription
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!medication) return;
                      setStagedCount(prev => prev + 1);
                      setMedication("");
                    }}
                    className="w-full py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-md shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    Save as Draft
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

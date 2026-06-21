import { useState } from "react";
import { Link } from "wouter";
import { 
  HeartPulse, 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  User, 
  Plus, 
  AlertTriangle,
  FileText,
  Eye,
  Check,
  X,
  Menu,
  Bed,
  ShieldAlert,
  Home,
  FlaskConical,
  Activity,
  LogOut
} from "lucide-react";

export default function AdminDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [beds, setBeds] = useState([
    { number: "101-A", status: "Occupied", patient: "J. Doe", dept: "Cardiology" },
    { number: "101-B", status: "Available", patient: "", dept: "" },
    { number: "102-A", status: "Cleaning", patient: "", dept: "" },
    { number: "102-B", status: "Occupied", patient: "M. Smith", dept: "Neurology" },
    { number: "103-A", status: "Available", patient: "", dept: "" }
  ]);

  const [documents, setDocuments] = useState([
    { id: "HID-9021-X", testName: "Complete Blood Count", status: "Pending Review" },
    { id: "HID-4452-Y", testName: "Lipid Panel", status: "Published" },
    { id: "HID-1189-Z", testName: "Urinalysis", status: "Pending Review" }
  ]);

  const handlePublish = (id: string) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status: "Published" } : doc));
  };

  return (
    <div className="bg-slate-50 text-[#0F172A] font-sans h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 md:px-8 bg-white border-b border-slate-200 h-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-md"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-extrabold text-lg md:text-xl uppercase tracking-tight bg-gradient-to-r from-[#015C3D] to-[#029C6B] bg-clip-text text-transparent flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-[#029C6B]" />
            Prevntive ERP
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              className="pl-11 pr-4 py-2 border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] focus:outline-none bg-white text-slate-800 w-80 text-sm shadow-sm transition-all" 
              placeholder="Search across systems..." 
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
            AD
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Side Bar */}
        <nav className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 ease-in-out md:relative md:flex flex-col w-72 bg-white border-r border-slate-200 shrink-0 py-8 z-40 justify-between h-full overflow-y-auto`}>
          <div>
            <div className="px-6 mb-8 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full border-2 border-slate-200 shadow-md bg-slate-100 flex items-center justify-center text-[#029C6B] text-xl font-bold mb-4">
                AD
              </div>
              <h2 className="font-bold text-slate-900">Admin Panel</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Hospital Operations</p>
            </div>

            <div className="flex-grow space-y-1 px-4">
              <a className="flex items-center gap-4 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white rounded-md px-4 py-3 shadow-md font-semibold text-sm" href="#">
                <Home className="h-5 w-5" />
                Hospital Ops
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <FlaskConical className="h-5 w-5" />
                Laboratory
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <Activity className="h-5 w-5" />
                Pharmacy
              </a>
            </div>
          </div>

          <div className="px-4 pt-6 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/">
              <a className="flex items-center justify-center gap-2 border border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-md w-full hover:bg-slate-50 transition-colors">
                Return to Gateway
              </a>
            </Link>
          </div>
        </nav>

        {/* Backdrop for mobile sidebar */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden fixed inset-0 bg-black/20 z-30"
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8 bg-slate-50">
          {/* Left Column: Hospital Operations */}
          <section className="flex-[3] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Ward Status: North Wing</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Real-time facility bed allocation logs</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm bg-white">
                  Discharge Patient
                </button>
                <button 
                  onClick={() => {
                    const bedNum = prompt("Enter Bed Number (e.g. 103-B):");
                    if (bedNum) {
                      setBeds(prev => [...prev, { number: bedNum, status: "Available", patient: "", dept: "" }]);
                    }
                  }}
                  className="bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-md hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Admit Patient
                </button>
              </div>
            </div>

            {/* Bed Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {beds.map((bed, idx) => (
                <div key={idx} className="border border-slate-200 shadow-md rounded-xl p-5 bg-white hover:border-[#029C6B] transition-all cursor-pointer flex flex-col h-40 justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-extrabold text-slate-900">{bed.number}</span>
                    <span className={`px-2.5 py-1 font-bold text-[10px] rounded-md shadow-sm ${
                      bed.status === "Occupied" ? "bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white" :
                      bed.status === "Cleaning" ? "bg-slate-900 text-white" :
                      "border border-slate-200 text-slate-650 bg-slate-50"
                    }`}>
                      {bed.status}
                    </span>
                  </div>
                  <div>
                    {bed.status === "Occupied" ? (
                      <>
                        <p className="font-bold text-slate-900 text-sm">{bed.patient}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-1">{bed.dept}</p>
                      </>
                    ) : bed.status === "Cleaning" ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse"></span>
                        <span className="text-xs font-semibold">Sanitizing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Bed className="h-4 w-4 text-[#029C6B]" />
                        <span className="text-xs font-semibold">Ready for Admission</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Lab Administration */}
          <section className="flex-[2] flex flex-col gap-6">
            {/* Critical Observations Banner */}
            <div className="border border-slate-200 shadow-md rounded-xl bg-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[#015C3D]">
                <AlertTriangle className="h-8 w-8 text-[#029C6B] shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Critical Lab Observations</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Pending diagnostics require urgent verification.</p>
                </div>
              </div>
              <button className="bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white px-4 py-2.5 font-bold text-xs rounded-md shadow-md hover:opacity-90 shrink-0">
                Review
              </button>
            </div>

            {/* Health ID Search bar */}
            <div className="w-full relative shadow-sm rounded-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-md focus:border-[#029C6B] focus:ring-1 focus:ring-[#029C6B] outline-none text-slate-800 text-sm shadow-sm transition-all" 
                placeholder="Search by Health ID..." 
                type="text" 
              />
            </div>

            {/* Document Publishing */}
            <div className="border border-slate-200 shadow-md rounded-xl bg-white flex flex-col flex-1 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
                <h3 className="font-bold text-slate-900">Document Publishing</h3>
              </div>
              <div className="flex flex-col divide-y divide-slate-100">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-l-4 border-l-transparent hover:border-l-[#029C6B] cursor-pointer bg-white">
                    <div>
                      <p className="text-xs font-bold text-slate-900 mb-1">{doc.id}</p>
                      <p className="text-xs text-slate-500 font-semibold">{doc.testName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {doc.status === "Published" ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-[#015C3D] border border-emerald-200 font-bold text-[10px] rounded-md shadow-sm">
                          Published
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 font-bold text-[10px] rounded-md">
                            Pending Review
                          </span>
                          <button 
                            onClick={() => handlePublish(doc.id)}
                            className="p-1.5 text-[#015C3D] hover:bg-emerald-50 rounded-md transition-colors"
                            title="Publish Report"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

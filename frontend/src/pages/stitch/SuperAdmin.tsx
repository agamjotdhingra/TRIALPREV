import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { 
  HeartPulse, 
  Bell, 
  Settings, 
  HelpCircle, 
  Activity, 
  Building2, 
  User, 
  TrendingUp,
  Cpu,
  Check,
  X,
  Menu,
  Terminal as TerminalIcon,
  ShieldCheck,
  FlaskConical,
  LogOut
} from "lucide-react";

interface LogLine {
  time: string;
  type: "INFO" | "WARN" | "SYNC" | "AUTH";
  message: string;
}

export default function SuperAdmin() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pipeline, setPipeline] = useState([
    { id: "#FAC-8901", name: "Mercy General Hospital", type: "Hospital", detail: "Facility Registration ID" },
    { id: "#NPI-2736", name: "Dr. Sarah Jenkins", type: "Doctor", detail: "Cardiology • NPI: 1098273645" },
    { id: "#VND-4412", name: "Citywide Pharmacy Rx", type: "Pharmacy", detail: "Vendor Integration • API Access" }
  ]);

  const [logs, setLogs] = useState<LogLine[]>([
    { time: "10:42:01", type: "INFO", message: "Node-01 heartbeat accepted." },
    { time: "10:42:05", type: "SYNC", message: "Replicating patient registry to region us-east-2..." },
    { time: "10:42:06", type: "SYNC", message: "Replication successful. 142 records updated." },
    { time: "10:42:14", type: "WARN", message: "API Gateway latency spike detected (>150ms). Autoscaling triggered." },
    { time: "10:42:15", type: "AUTH", message: "Admin token generated for user ID #9921." },
    { time: "10:42:22", type: "INFO", message: "Incoming HL7 message routed to processor queue." }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const logPool = [
      { type: "INFO" as const, message: "Telemetry data flushed successfully." },
      { type: "SYNC" as const, message: "Practitioner credential indices updated." },
      { type: "AUTH" as const, message: "Security handshake completed for Node-Delta." },
      { type: "INFO" as const, message: "Audit logs synchronized to secure cold storage." }
    ];

    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      const randomMsg = logPool[Math.floor(Math.random() * logPool.length)];
      
      setLogs(prev => [...prev, { time: timeStr, ...randomMsg }]);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleAction = (id: string, approve: boolean) => {
    alert(approve ? `Approved entry ${id}` : `Rejected entry ${id}`);
    setPipeline(prev => prev.filter(item => item.id !== id));
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
            Prevntive Command
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center text-[#029C6B] shadow-sm font-bold">
            SA
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
                SA
              </div>
              <h2 className="font-bold text-slate-900">Super Admin</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Platform Operations</p>
            </div>

            <div className="flex-grow space-y-1 px-4">
              <a className="flex items-center gap-4 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white rounded-md px-4 py-3 shadow-md font-semibold text-sm" href="#">
                <Cpu className="h-5 w-5" />
                Analytics & Logs
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <Building2 className="h-5 w-5" />
                Hospital Ops
              </a>
              <a className="flex items-center gap-4 text-slate-600 px-4 py-3 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all font-semibold text-sm" href="#">
                <FlaskConical className="h-5 w-5" />
                Laboratory
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

        {/* Main Console Workspace */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Command Center</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Global platform administration & health visualizer</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-[#015C3D] px-4 py-2 border border-emerald-250 font-bold text-xs rounded-md">
              <span className="h-2 w-2 rounded-full bg-[#029C6B] animate-ping"></span>
              System Optimal
            </div>
          </div>

          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hospitals KPI */}
            <div className="border border-slate-200 bg-white p-6 shadow-md rounded-xl flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Hospitals</span>
                <Building2 className="h-5 w-5 text-[#029C6B]" />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900">1,248</span>
                <p className="text-xs text-[#029C6B] font-bold mt-2 flex items-center gap-1">
                  <span>+12 this week</span>
                </p>
              </div>
            </div>
            {/* Staff KPI */}
            <div className="border border-slate-200 bg-white p-6 shadow-md rounded-xl flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff</span>
                <User className="h-5 w-5 text-[#029C6B]" />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900">8,932</span>
                <p className="text-xs text-[#029C6B] font-bold mt-2">
                  <span>+45 today</span>
                </p>
              </div>
            </div>
            {/* Latency KPI */}
            <div className="border border-slate-200 bg-white p-6 shadow-md rounded-xl flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Latency</span>
                <Activity className="h-5 w-5 text-[#029C6B]" />
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900">24 ms</span>
                <p className="text-xs text-slate-500 font-bold mt-2">
                  <span>Stable across all nodes</span>
                </p>
              </div>
            </div>
          </div>

          {/* Verification and Logs Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel: Verification Pipeline */}
            <div className="border border-slate-200 bg-white shadow-md rounded-xl flex flex-col overflow-hidden h-[500px]">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-950 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#029C6B]" />
                  Verification Pipeline
                </h3>
                <span className="bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {pipeline.length} Pending
                </span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {pipeline.length === 0 ? (
                  <div className="p-12 text-center text-sm text-slate-400 font-semibold">
                    No pending verification requests.
                  </div>
                ) : (
                  pipeline.map((item, idx) => (
                    <div key={idx} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-slate-450 mt-1 font-semibold">{item.detail}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[9px] rounded-md uppercase">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleAction(item.id, false)}
                          className="w-9 h-9 border border-slate-200 hover:border-red-300 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleAction(item.id, true)}
                          className="w-9 h-9 bg-gradient-to-r from-[#015C3D] to-[#029C6B] text-white rounded-md flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel: Terminal Logs */}
            <div className="border border-slate-200 bg-white shadow-md rounded-xl flex flex-col overflow-hidden h-[500px]">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-950 flex items-center gap-2">
                  <TerminalIcon className="h-5 w-5 text-[#029C6B]" />
                  Live System Logs
                </h3>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#029C6B] animate-pulse"></span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Stream Active</span>
                </div>
              </div>
              <div className="flex-1 p-5 bg-white overflow-y-auto font-mono text-xs space-y-2 select-text">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-slate-400 shrink-0 font-semibold">[{log.time}]</span>
                    <span className={`font-bold shrink-0 text-[10px] uppercase ${
                      log.type === "INFO" ? "text-emerald-600" :
                      log.type === "WARN" ? "text-orange-500" :
                      log.type === "SYNC" ? "text-blue-500" :
                      "text-slate-800"
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-800 break-all">{log.message}</span>
                  </div>
                ))}
                <div ref={terminalEndRef}></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

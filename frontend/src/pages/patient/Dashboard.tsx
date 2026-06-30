import { useGetDashboardStats, useGetPatientMe } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Calendar,
  FileText,
  Activity,
  Pill,
  ShieldAlert,
  Clock,
  ArrowRight,
  User,
  HeartPulse,
} from "lucide-react";
import { RiskBadge } from "@/components/SharedHelpers";

export default function PatientDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: patient, isLoading: patientLoading } = useGetPatientMe();

  if (statsLoading || patientLoading) {
    return <div className="p-8 text-center text-slate-400">Loading your health dashboard...</div>;
  }

  const healthScore = stats?.healthScore ?? 0;
  const scoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-450";
    if (s >= 60) return "text-yellow-450";
    if (s >= 40) return "text-orange-400";
    return "text-red-400";
  };
  const ringColor = (s: number) => {
    if (s >= 80) return "border-emerald-500/20";
    if (s >= 60) return "border-yellow-500/20";
    if (s >= 40) return "border-orange-500/20";
    return "border-red-500/20";
  };

  const quickActions = [
    { label: "Book Appointment", href: "/patient/appointments", desc: "Schedule a visit with your physician", icon: Calendar, color: "bg-blue-500/10 text-blue-400" },
    { label: "My Health Record", href: "/patient/records", desc: "View detailed longitudinal EHR", icon: Activity, color: "bg-violet-500/10 text-violet-400" },
    { label: "Lab Reports", href: "/patient/reports", desc: "Check diagnostic observations", icon: FileText, color: "bg-amber-500/10 text-amber-400" },
    { label: "My Prescriptions", href: "/patient/prescriptions", desc: "Access medication prescriptions", icon: Pill, color: "bg-emerald-500/10 text-emerald-400" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Hello, {patient?.full_name}</h1>
        <p className="text-slate-400 mt-2 font-mono text-sm">Health ID: {patient?.health_id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circular Health Score Dial */}
        <Card className="bg-slate-900 border-slate-800 text-white flex flex-col items-center justify-center p-6 text-center">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-slate-400 text-sm font-semibold uppercase tracking-wider">My Health Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-0">
            <div className={`relative flex items-center justify-center w-36 h-36 rounded-full border-[10px] ${ringColor(healthScore)}`}>
              <div className={`text-5xl font-black ${scoreColor(healthScore)}`}>{healthScore}</div>
            </div>
            <div className="space-y-1 mt-2">
              <RiskBadge level={patient?.risk_level} />
              <p className="text-xs text-slate-400 mt-2">Computed dynamically from BMI, lifestyle, and history.</p>
            </div>
          </CardContent>
        </Card>

        {/* Vitals Summary Card */}
        <Card className="bg-slate-900 border-slate-800 text-white p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Vitals & Anthropometrics</CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <p className="text-slate-500 mb-0.5">BMI</p>
              <p className="font-bold text-white text-lg">{patient?.bmi?.toFixed(1) || "—"}</p>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <p className="text-slate-500 mb-0.5">Blood Group</p>
              <p className="font-bold text-white text-lg">{patient?.blood_group || "—"}</p>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <p className="text-slate-500 mb-0.5">Height</p>
              <p className="font-semibold text-white">{patient?.height ? `${patient.height} cm` : "—"}</p>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <p className="text-slate-500 mb-0.5">Weight</p>
              <p className="font-semibold text-white">{patient?.weight ? `${patient.weight} kg` : "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action / Upcoming Appointments Card */}
        <Card className="bg-slate-900 border-slate-800 text-white p-6 flex flex-col justify-between">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.upcomingAppointments || 0}</p>
                <p className="text-xs text-slate-400">Scheduled outpatient visits</p>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/patient/appointments">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none gap-2 font-semibold">
                  Book New Visit <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Profile Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Longitudinal Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-350">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-850">
                <p className="text-slate-500 font-semibold mb-1">Existing Illnesses</p>
                <p className="text-slate-300">{patient?.existing_diseases || "None reported"}</p>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-850">
                <p className="text-slate-500 font-semibold mb-1">Allergies</p>
                <p className="text-slate-300 text-red-400">{patient?.allergies || "None reported"}</p>
              </div>
            </div>
            <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-850">
              <p className="text-slate-500 font-semibold mb-1">Current Medications</p>
              <p className="text-slate-300">{patient?.current_medications || "No active prescriptions"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Shortcuts */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <a className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-850 bg-slate-950/20 hover:bg-slate-800/30 hover:border-slate-700 transition cursor-pointer group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm leading-none group-hover:text-blue-400 transition">{action.label}</p>
                    <p className="text-slate-500 text-xs mt-1 truncate">{action.desc}</p>
                  </div>
                </a>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

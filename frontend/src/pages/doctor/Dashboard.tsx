import { useGetDashboardStats, useListAppointments } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { StatusBadge, TypeIcon } from "@/components/SharedHelpers";
import { useAuth } from "@/auth/AuthContext";
import { Link } from "wouter";

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: appointments, isLoading: apptsLoading } = useListAppointments();

  if (statsLoading || apptsLoading) {
    return <div className="p-8 text-center text-slate-400">Loading dashboard data...</div>;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppts = appointments?.filter((a) => (a.scheduled_date || a.scheduledDate) === todayStr) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, Dr. {profile?.full_name}</h1>
        <p className="text-slate-400 mt-2">Here is your clinical overview and schedule for today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                <div className="text-xs text-slate-400">My Total Patients</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
                <div className="text-xs text-slate-400">Today's Schedule</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.pendingAppointments || 0}</div>
                <div className="text-xs text-slate-400">Pending Visits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{stats?.completedToday || 0}</div>
                <div className="text-xs text-slate-400">Completed Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Queue */}
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Today's Appointments Roster</CardTitle>
          <CardDescription className="text-slate-400">Patients scheduled to visit your clinic today.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {todayAppts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Calendar className="h-10 w-10 text-slate-655" />
              <p className="font-medium">No appointments scheduled for today.</p>
            </div>
          ) : (
            <Table className="text-slate-350">
              <TableHeader className="bg-slate-850 border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Time</TableHead>
                  <TableHead className="text-slate-400">Patient</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppts.map((apt) => (
                  <TableRow key={apt.id} className="border-slate-800 hover:bg-slate-850/40">
                    <TableCell className="font-bold text-white">{apt.scheduled_time || apt.scheduledTime}</TableCell>
                    <TableCell>
                      <Link href={`/doctor/patients/${apt.patient_id}`} className="hover:underline font-semibold text-white">
                        {apt.patientName || `Patient #${apt.patient_id}`}
                      </Link>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{apt.patientHealthId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs capitalize text-slate-450">
                        <TypeIcon type={apt.consultation_type || apt.consultationType} />
                        {apt.consultation_type || apt.consultationType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={apt.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 max-w-[200px] truncate">{apt.reason || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

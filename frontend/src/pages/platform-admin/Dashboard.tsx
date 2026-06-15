import { useGetDashboardStats, useGetRecentActivity, useGetRiskDistribution, useGetAuditLogs } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Stethoscope, FlaskConical, Building2, AlertCircle, Calendar, FileText, CheckCircle2, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function PlatformDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: riskDist, isLoading: riskLoading } = useGetRiskDistribution();
  const { data: auditLogs, isLoading: auditLoading } = useGetAuditLogs();

  if (statsLoading || activityLoading || riskLoading || auditLoading) {
    return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;
  }

  const statCards = stats ? [
    { title: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-blue-500" },
    { title: "Total Doctors", value: stats.totalDoctors, icon: Stethoscope, color: "text-emerald-500" },
    { title: "Total Labs", value: stats.totalLabs, icon: FlaskConical, color: "text-purple-500" },
    { title: "Total Hospitals", value: stats.totalHospitals, icon: Building2, color: "text-indigo-500" },
    { title: "Critical Patients", value: stats.criticalPatients, icon: AlertCircle, color: "text-red-500" },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: "text-orange-500" },
    { title: "Pending Verifications", value: stats.pendingVerifications, icon: CheckCircle2, color: "text-amber-500" },
    { title: "Total Reports", value: stats.totalReports, icon: FileText, color: "text-cyan-500" },
  ] : [];

  const COLORS = {
    healthy: "#10b981", // emerald-500
    moderate: "#f59e0b", // amber-500
    high: "#f97316", // orange-500
    critical: "#ef4444" // red-500
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Admin Dashboard</h1>
        <p className="text-slate-400 mt-2">Platform-wide statistics and clinical oversight.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value?.toLocaleString() ?? 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">Latest events across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity?.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-4 text-sm text-slate-300">
                  <div className="mt-0.5 rounded-full p-1.5 bg-blue-500/10 text-blue-400">
                    <ActivityIcon type={item.type} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none text-white">{item.description}</p>
                    <p className="text-slate-400 text-xs mt-1">{item.entityName} • {new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {!activity?.length && <div className="text-slate-400 text-sm">No recent activity.</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Risk Distribution</CardTitle>
            <CardDescription className="text-slate-400">Patient population health risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {riskDist && riskDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="riskLevel"
                    >
                      {riskDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.riskLevel.toLowerCase() as keyof typeof COLORS] || "#8884d8"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} formatter={(value, name, props) => [`${value} Patients`, props.payload.riskLevel]} />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EHR Access Audit Logs */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-500" />
            EHR Access Audit Trail (HIPAA Audit)
          </CardTitle>
          <CardDescription className="text-slate-400">
            Immutable log of patient health record views, updates, and data exports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-450">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Device/Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {auditLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                      {new Date(log.accessed_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {log.operator?.full_name || 'System / Guest'}
                    </td>
                    <td className="px-4 py-3 capitalize text-xs text-slate-400">
                      {log.operator?.role || 'system'}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {log.patients?.full_name || `ID: ${log.patient_id}`}
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {log.patients?.health_id || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        log.action === 'view' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/20' :
                        log.action === 'update' ? 'bg-amber-950/40 text-amber-450 border border-amber-500/20' :
                        'bg-red-950/40 text-red-400 border border-red-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">
                      {log.ip_address || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate text-slate-450" title={log.user_agent}>
                      {log.user_agent || '—'}
                    </td>
                  </tr>
                ))}
                {!auditLogs?.length && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-450">
                      No EHR access logs recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'patient': return <Users className="h-4 w-4" />;
    case 'doctor': return <Stethoscope className="h-4 w-4" />;
    case 'lab': return <FlaskConical className="h-4 w-4" />;
    case 'hospital': return <Building2 className="h-4 w-4" />;
    case 'appointment': return <Calendar className="h-4 w-4" />;
    case 'report': return <FileText className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
}

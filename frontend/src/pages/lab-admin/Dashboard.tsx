import { useGetDashboardStats, useListReports } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

export default function LabDashboard() {
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: reports, isLoading: reportsLoading } = useListReports();

  if (statsLoading || reportsLoading) {
    return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;
  }

  const total = stats?.totalReports ?? 0;
  const critical = stats?.criticalReports ?? 0;
  const todayCount = stats?.todayReports ?? 0;
  const normal = total - critical;

  const sorted = [...(reports ?? [])].slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Lab Dashboard</h1>
        <p className="text-slate-400 mt-2">Manage diagnostics and report uploads for your laboratory.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-slate-400">Total Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{critical}</div>
                <div className="text-xs text-slate-400">Critical Reports</div>
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
                <div className="text-2xl font-bold">{todayCount}</div>
                <div className="text-xs text-slate-400">Today's Uploads</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{normal}</div>
                <div className="text-xs text-slate-400">Normal Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Recent Report Uploads</CardTitle>
          <CardDescription className="text-slate-400">Latest lab reports submitted by your facility.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 text-slate-400">
              <FileText className="h-10 w-10 text-slate-600" />
              <p className="font-medium">No reports uploaded yet</p>
            </div>
          ) : (
            <Table className="text-slate-300">
              <TableHeader className="bg-slate-800/40 border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Report Name</TableHead>
                  <TableHead className="text-slate-400">Patient</TableHead>
                  <TableHead className="text-slate-400">Category</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.id} className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell className="font-semibold text-white">{r.report_name || r.reportName}</TableCell>
                    <TableCell>{r.patientName || `Patient #${r.patient_id}`}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">{r.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {r.is_critical || r.isCritical ? (
                        <Badge className="bg-red-950/40 text-red-400 border border-red-500/20 gap-1 text-xs rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Critical
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 gap-1 text-xs rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(r.created_at || r.createdAt).toLocaleDateString()}
                    </TableCell>
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

import { useListAppointments } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { RiskBadge } from "@/components/SharedHelpers";
import { Link } from "wouter";

export default function DoctorQueue() {
  const { data: appointments, isLoading } = useListAppointments();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading priority queue...</div>;
  }

  // Filter for today's active appointments
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppts = appointments?.filter(
    (a) => (a.scheduled_date || a.scheduledDate) === todayStr && a.status !== "cancelled"
  ) || [];

  // Sort by priority logic
  const prioritySorted = [...todayAppts].sort((a, b) => {
    // 1. Put active appointments before completed
    const statusA = a.status === "completed" ? 1 : 0;
    const statusB = b.status === "completed" ? 1 : 0;
    if (statusA !== statusB) return statusA - statusB;

    // 2. Sort by risk level
    const riskWeight: Record<string, number> = { critical: 4, high: 3, moderate: 2, healthy: 1 };
    const rA = riskWeight[(a.patientRiskLevel || "healthy").toLowerCase()] || 1;
    const rB = riskWeight[(b.patientRiskLevel || "healthy").toLowerCase()] || 1;
    if (rA !== rB) return rB - rA; // higher weight first

    // 3. Sort by health score (lower score = higher priority)
    const scoreA = a.patientHealthScore ?? 100;
    const scoreB = b.patientHealthScore ?? 100;
    return scoreA - scoreB;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Smart Priority Queue</h1>
        <p className="text-slate-400 mt-2">
          Today's scheduled patients, sorted automatically by clinical risk level and health scores.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Live Patient Roster</CardTitle>
          <CardDescription className="text-slate-400">Review symptoms and start consultations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table className="text-slate-350">
              <TableHeader className="bg-slate-850 border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 w-24">Priority</TableHead>
                  <TableHead className="text-slate-400">Patient</TableHead>
                  <TableHead className="text-slate-400">Health Score</TableHead>
                  <TableHead className="text-slate-400">Risk Level</TableHead>
                  <TableHead className="text-slate-400">Time</TableHead>
                  <TableHead className="text-slate-400">Reason</TableHead>
                  <TableHead className="text-slate-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prioritySorted.map((item, i) => {
                  const isCritical = (item.patientRiskLevel || "").toLowerCase() === "critical";
                  const isCompleted = item.status === "completed";

                  return (
                    <TableRow
                      key={item.id}
                      className={`border-slate-800 hover:bg-slate-850/40 ${
                        isCritical && !isCompleted ? "bg-red-500/5 hover:bg-red-500/10" : ""
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-400 font-semibold">#{i + 1}</span>
                          {isCritical && !isCompleted && <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-white">{item.patientName}</div>
                        <div className="text-xs text-slate-450 font-mono mt-0.5">{item.patientHealthId}</div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm font-bold ${
                            (item.patientHealthScore ?? 0) >= 80
                              ? "text-emerald-400"
                              : (item.patientHealthScore ?? 0) >= 60
                                ? "text-yellow-405"
                                : (item.patientHealthScore ?? 0) >= 40
                                  ? "text-orange-400"
                                  : "text-red-400"
                          }`}
                        >
                          {item.patientHealthScore ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={item.patientRiskLevel} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {item.scheduled_time || item.scheduledTime || "Walk-in"}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-slate-400">
                        {item.reason || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {isCompleted ? (
                          <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-400 font-semibold pr-2">
                            <CheckCircle2 className="h-4 w-4" /> Completed
                          </div>
                        ) : (
                          <Link href={`/doctor/patients/${item.patient_id}`}>
                            <Button id={`start-consult-${item.id}`} size="sm" className="bg-emerald-650 hover:bg-emerald-600 text-white border-none font-semibold">
                              Start Consult
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {prioritySorted.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      Queue is currently empty for today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

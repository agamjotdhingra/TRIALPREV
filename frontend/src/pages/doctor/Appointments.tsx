import { useListAppointments, useUpdateAppointmentStatus } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { StatusBadge, TypeIcon } from "@/components/SharedHelpers";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function DoctorAppointments() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: appointments, isLoading, refetch } = useListAppointments();
  const updateMutation = useUpdateAppointmentStatus();

  async function handleComplete(id: number) {
    try {
      await updateMutation.mutateAsync({ id, status: "completed" });
      toast({ title: "Success", description: "Appointment marked as completed." });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  const filtered = appointments?.filter(
    (a) => statusFilter === "all" || a.status.toLowerCase() === statusFilter.toLowerCase()
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Clinical Schedule</h1>
          <p className="text-slate-400 mt-2">View and manage scheduled consultations.</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "scheduled", "completed", "cancelled"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className={`capitalize ${
              statusFilter === status
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-none"
                : "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {status}
          </Button>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading appointments schedule...</div>
          ) : !filtered || filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Calendar className="h-10 w-10 text-slate-650" />
              <p className="font-medium">No appointments match your filters.</p>
            </div>
          ) : (
            <Table className="text-slate-350">
              <TableHeader className="bg-slate-850 border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Date & Time</TableHead>
                  <TableHead className="text-slate-400">Patient</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Reason</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((apt) => (
                  <TableRow key={apt.id} className="border-slate-800 hover:bg-slate-850/40">
                    <TableCell className="font-semibold text-white">
                      <div className="flex flex-col">
                        <span>{new Date(apt.scheduled_date || apt.scheduledDate).toLocaleDateString()}</span>
                        <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {apt.scheduled_time || apt.scheduledTime}
                        </span>
                      </div>
                    </TableCell>
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
                    <TableCell className="text-right">
                      {apt.status === "scheduled" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            id={`complete-${apt.id}`}
                            size="sm"
                            onClick={() => handleComplete(apt.id)}
                            className="bg-emerald-650 hover:bg-emerald-600 text-white border-none font-semibold"
                          >
                            Complete
                          </Button>
                          <Link href={`/doctor/patients/${apt.patient_id}`}>
                            <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 hover:text-white">
                              View EHR
                            </Button>
                          </Link>
                        </div>
                      )}
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

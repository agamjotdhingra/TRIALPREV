import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetDoctor, useGetDoctorQueue, useListDoctors } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, AlertCircle, Clock, Stethoscope } from "lucide-react";
import { RiskBadge } from "../patients/index";

function QueueTable({ doctorId }: { doctorId: number }) {
  const { data: doctor, isLoading: doctorLoading } = useGetDoctor(doctorId, {
    query: { enabled: !!doctorId, queryKey: ["doctor", doctorId] },
  });
  const { data: queue, isLoading: queueLoading } = useGetDoctorQueue(doctorId, {
    query: { enabled: !!doctorId, queryKey: ["doctor-queue", doctorId] },
  });

  if (doctorLoading || queueLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading queue...</div>;
  }

  if (!doctor) {
    return <div className="p-8 text-center text-destructive">Doctor not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/doctors/${doctorId}`}>
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Priority Queue</h1>
          <p className="text-muted-foreground mt-1">
            {doctor.fullName} — patients ordered by clinical risk and health score.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue?.map((item, i) => (
                  <TableRow
                    key={`${item.appointmentId}-${item.patientId}`}
                    className={item.priority === "critical" ? "bg-red-50 dark:bg-red-950/20" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">#{i + 1}</span>
                        {item.priority === "critical" && <AlertCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.fullName}</div>
                      <div className="text-xs text-muted-foreground">{item.healthId}</div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`text-sm font-bold ${
                          (item.healthScore ?? 0) >= 80
                            ? "text-emerald-600"
                            : (item.healthScore ?? 0) >= 60
                              ? "text-yellow-600"
                              : (item.healthScore ?? 0) >= 40
                                ? "text-orange-600"
                                : "text-red-600"
                        }`}
                      >
                        {item.healthScore ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={item.riskLevel} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {item.scheduledTime || "Walk-in"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{item.reason || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/patients/${item.patientId}`}>
                        <Button size="sm">Start Consult</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {(!queue || queue.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
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

function DoctorSelector({ onSelect }: { onSelect: (id: number) => void }) {
  const { data: doctors, isLoading } = useListDoctors(
    {},
    { query: { queryKey: ["doctors"] } }
  );

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading doctors...</div>;

  const approved = doctors?.filter((d) => d.verificationStatus === "approved") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Priority Queue</h1>
        <p className="text-muted-foreground mt-1">Select a doctor to view their patient queue for today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {approved.map((doc) => (
          <Card
            key={doc.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelect(doc.id)}
          >
            <CardContent className="pt-6 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{doc.fullName}</div>
                <div className="text-xs text-muted-foreground">{doc.specialization}</div>
                <Badge variant="outline" className="mt-1 text-xs">View Queue →</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {approved.length === 0 && (
          <p className="text-muted-foreground col-span-3 text-center py-8">No approved doctors found.</p>
        )}
      </div>
    </div>
  );
}

export default function DoctorQueue() {
  const params = useParams<{ id?: string }>();
  const paramId = parseInt(params.id || "0");
  const [selectedId, setSelectedId] = useState<number>(0);

  const doctorId = paramId > 0 ? paramId : selectedId;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {doctorId > 0 ? (
        <QueueTable doctorId={doctorId} />
      ) : (
        <DoctorSelector onSelect={setSelectedId} />
      )}
    </div>
  );
}

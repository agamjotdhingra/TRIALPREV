import { useListAppointments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, Clock, Video, MessageSquare, User } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let colorClass = "bg-muted text-muted-foreground";
  
  if (s === "scheduled") colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "completed") colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (s === "cancelled") colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  if (s === "rescheduled") colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize`}>{status}</Badge>;
}

export function TypeIcon({ type }: { type?: string | null }) {
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "chat") return <MessageSquare className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
}

export default function Appointments() {
  const [search, setSearch] = useState("");
  // Currently using a generic search parameter on the hook isn't fully supported without patientId/doctorId
  // We will just fetch all and let the user filter via UI or pass params if API supports it.
  const { data: appointments, isLoading } = useListAppointments({});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Center</h1>
          <p className="text-muted-foreground mt-2">Manage patient schedules and consultations.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading appointments...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{new Date(apt.scheduledDate).toLocaleDateString()}</span>
                          <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                          <span className="text-sm">{apt.scheduledTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${apt.patientId}`} className="hover:underline font-medium">
                          {apt.patientName || `Patient #${apt.patientId}`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/doctors/${apt.doctorId}`} className="hover:underline">
                          Dr. {apt.doctorName || `Doctor #${apt.doctorId}`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm capitalize text-muted-foreground">
                          <TypeIcon type={apt.consultationType} />
                          {apt.consultationType || "In-person"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={apt.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!appointments || appointments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No appointments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
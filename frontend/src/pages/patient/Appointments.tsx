import { useListAppointments, useListDoctors, useCreateAppointment, useUpdateAppointmentStatus } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Plus, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge, TypeIcon } from "@/components/SharedHelpers";
import { useAuth } from "@/auth/AuthContext";

export default function PatientAppointments() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const { data: appointments, isLoading, refetch } = useListAppointments();
  const { data: doctors } = useListDoctors();
  const createMutation = useCreateAppointment();
  const cancelMutation = useUpdateAppointmentStatus(); // We use update status to mark as cancelled

  const [form, setForm] = useState({
    doctorId: "",
    scheduledDate: "",
    scheduledTime: "",
    consultationType: "in-person",
    reason: "",
  });

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!form.doctorId || !form.scheduledDate || !form.scheduledTime) {
      toast({ title: "Validation Error", description: "Doctor, Date and Time are required.", variant: "destructive" });
      return;
    }

    try {
      await createMutation.mutateAsync({
        patientId: profile?.entity_id,
        doctorId: parseInt(form.doctorId, 10),
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        consultationType: form.consultationType,
        reason: form.reason.trim() || null,
      });

      toast({ title: "Appointment Scheduled", description: "Your consultation has been successfully booked." });
      setForm({ doctorId: "", scheduledDate: "", scheduledTime: "", consultationType: "in-person", reason: "" });
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    }
  }

  async function handleCancel(id: number) {
    try {
      await cancelMutation.mutateAsync({ id, status: "cancelled" });
      toast({ title: "Cancelled", description: "Appointment has been cancelled." });
      refetch();
    } catch (err: any) {
      toast({ title: "Cancel failed", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Appointments</h1>
          <p className="text-slate-400 mt-2 font-medium">Schedule and manage visits with your physicians.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="book-appt-trigger" className="bg-blue-600 hover:bg-blue-500 text-white border-none gap-2 font-semibold">
              <Plus className="h-4 w-4" /> Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Schedule Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBook} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-slate-350">Select Doctor *</Label>
                <Select value={form.doctorId} onValueChange={(v) => setForm((f) => ({ ...f, doctorId: v }))}>
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue placeholder="Choose a physician..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-850 text-white">
                    {doctors?.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)} className="focus:bg-slate-800">
                        {d.full_name} ({d.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-slate-350">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    className="bg-slate-950 border-slate-850 text-white"
                    value={form.scheduledDate}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="time" className="text-slate-350">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    className="bg-slate-950 border-slate-850 text-white"
                    value={form.scheduledTime}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-350">Consultation Mode</Label>
                <Select value={form.consultationType} onValueChange={(v) => setForm((f) => ({ ...f, consultationType: v }))}>
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-850 text-white">
                    <SelectItem value="in-person" className="focus:bg-slate-800">In-Person Visit</SelectItem>
                    <SelectItem value="video" className="focus:bg-slate-800">Video Consultation</SelectItem>
                    <SelectItem value="chat" className="focus:bg-slate-800">Chat Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="reason" className="text-slate-350">Reason for Visit</Label>
                <Input
                  id="reason"
                  placeholder="e.g. Annual checkup, chest pain..."
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="flex-1 bg-blue-600 hover:bg-blue-505 text-white">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book Appointment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading appointments schedule...</div>
          ) : !appointments || appointments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Calendar className="h-10 w-10 text-slate-655" />
              <p className="font-medium">You have no appointments booked yet.</p>
            </div>
          ) : (
            <Table className="text-slate-330">
              <TableHeader className="bg-slate-850 border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Date & Time</TableHead>
                  <TableHead className="text-slate-400">Doctor</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Reason</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id} className="border-slate-800 hover:bg-slate-850/40">
                    <TableCell className="font-semibold text-white">
                      <div className="flex flex-col">
                        <span>{new Date(apt.scheduled_date || apt.scheduledDate).toLocaleDateString()}</span>
                        <span className="text-xs text-slate-405 mt-1 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {apt.scheduled_time || apt.scheduledTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-white">{apt.doctorName || `Doctor #${apt.doctor_id}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs capitalize text-slate-400">
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
                        <Button
                          id={`cancel-appt-${apt.id}`}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-semibold gap-1.5"
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancelMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" /> Cancel
                        </Button>
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

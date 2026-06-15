import {
  useListAdmissions,
  useListPatients,
  useListWards,
  useListBeds,
  useListDoctors,
  useCreateAdmission,
  useDischargeAdmission,
} from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Calendar, BedDouble, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function AdmissionStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let colorClass = "bg-slate-800 text-slate-400";

  if (s === "admitted") colorClass = "bg-blue-955/40 text-blue-400 border border-blue-500/20";
  if (s === "icu") colorClass = "bg-red-955/40 text-red-400 border border-red-500/20";
  if (s === "observation") colorClass = "bg-orange-955/40 text-orange-400 border border-orange-500/20";
  if (s === "recovery") colorClass = "bg-emerald-955/40 text-emerald-450 border border-emerald-500/20";
  if (s === "discharged") colorClass = "bg-slate-950 text-slate-500 border border-slate-850";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize px-2 py-0.5 rounded-full font-medium text-xs`}>{status}</Badge>;
}

export default function HospitalAdmissions() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [admitOpen, setAdmitOpen] = useState(false);
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [activeAdmissionId, setActiveAdmissionId] = useState<number | null>(null);

  const { data: admissions, isLoading, refetch } = useListAdmissions();
  const { data: patients } = useListPatients();
  const { data: wards } = useListWards();
  const { data: doctors } = useListDoctors();
  const createAdmissionMutation = useCreateAdmission();
  const dischargeMutation = useDischargeAdmission();

  // For Admit Form
  const [admitForm, setAdmitForm] = useState({
    patientId: "",
    wardId: "",
    bedId: "",
    primaryDoctorId: "",
    admissionReason: "",
    admissionDate: new Date().toISOString().split("T")[0],
    status: "admitted",
  });

  // For Discharge Form
  const [dischargeForm, setDischargeForm] = useState({
    dischargeDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Query beds for selected ward in admit form
  const { data: beds } = useListBeds({
    wardId: admitForm.wardId ? parseInt(admitForm.wardId, 10) : undefined,
  });

  const availableBeds = beds?.filter((b) => b.status === "available");

  const filtered = admissions?.filter(
    (a) =>
      a.patients?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.admission_reason?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdmitSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!admitForm.patientId || !admitForm.admissionReason) {
      toast({ title: "Validation Error", description: "Patient and Admission Reason are required.", variant: "destructive" });
      return;
    }

    try {
      await createAdmissionMutation.mutateAsync({
        patientId: parseInt(admitForm.patientId, 10),
        wardId: admitForm.wardId ? parseInt(admitForm.wardId, 10) : null,
        bedId: admitForm.bedId ? parseInt(admitForm.bedId, 10) : null,
        primaryDoctorId: admitForm.primaryDoctorId ? parseInt(admitForm.primaryDoctorId, 10) : null,
        admissionReason: admitForm.admissionReason.trim(),
        admissionDate: admitForm.admissionDate,
        status: admitForm.status,
      });

      toast({ title: "Success", description: "Patient has been admitted successfully." });
      setAdmitForm({
        patientId: "",
        wardId: "",
        bedId: "",
        primaryDoctorId: "",
        admissionReason: "",
        admissionDate: new Date().toISOString().split("T")[0],
        status: "admitted",
      });
      setAdmitOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Admission failed", description: err.message, variant: "destructive" });
    }
  }

  async function handleDischargeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAdmissionId) return;

    try {
      await dischargeMutation.mutateAsync({
        id: activeAdmissionId,
        dischargeDate: dischargeForm.dischargeDate,
        notes: dischargeForm.notes.trim() || undefined,
      });

      toast({ title: "Success", description: "Patient has been discharged and bed is now free." });
      setDischargeForm({ dischargeDate: new Date().toISOString().split("T")[0], notes: "" });
      setDischargeOpen(false);
      setActiveAdmissionId(null);
      refetch();
    } catch (err: any) {
      toast({ title: "Discharge failed", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admissions</h1>
          <p className="text-slate-400 mt-2">Manage clinical hospitalizations, allocate beds, and authorize patient discharges.</p>
        </div>

        {/* Admit Patient Dialog */}
        <Dialog open={admitOpen} onOpenChange={setAdmitOpen}>
          <DialogTrigger asChild>
            <Button id="new-admission-btn" className="bg-violet-650 hover:bg-violet-600 text-white border-none gap-2">
              <Plus className="h-4 w-4" /> New Admission
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Admit Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdmitSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-slate-350">Select Patient *</Label>
                <Select value={admitForm.patientId} onValueChange={(v) => setAdmitForm((f) => ({ ...f, patientId: v }))}>
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue placeholder="Search patient..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-850 text-white">
                    {patients?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="focus:bg-slate-800">
                        {p.full_name} — {p.health_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-350">Ward Assignment</Label>
                  <Select value={admitForm.wardId} onValueChange={(v) => setAdmitForm((f) => ({ ...f, wardId: v, bedId: "" }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                      <SelectValue placeholder="Select ward..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-850 text-white">
                      {wards?.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)} className="focus:bg-slate-800">
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-350">Bed Assignment</Label>
                  <Select value={admitForm.bedId} onValueChange={(v) => setAdmitForm((f) => ({ ...f, bedId: v }))} disabled={!admitForm.wardId}>
                    <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                      <SelectValue placeholder="Select bed..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-850 text-white">
                      {availableBeds?.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)} className="focus:bg-slate-800">
                          {b.bed_number} {b.room_number ? `(${b.room_number})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-350">Primary Doctor</Label>
                  <Select value={admitForm.primaryDoctorId} onValueChange={(v) => setAdmitForm((f) => ({ ...f, primaryDoctorId: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                      <SelectValue placeholder="Select physician..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-850 text-white">
                      {doctors?.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)} className="focus:bg-slate-800">
                          {d.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-350">Initial Severity / Status</Label>
                  <Select value={admitForm.status} onValueChange={(v) => setAdmitForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-850 text-white">
                      <SelectItem value="admitted" className="focus:bg-slate-800">Admitted (General)</SelectItem>
                      <SelectItem value="observation" className="focus:bg-slate-800">Observation</SelectItem>
                      <SelectItem value="icu" className="focus:bg-slate-800">ICU (Critical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="admitDate" className="text-slate-350">Admission Date</Label>
                <Input
                  id="admitDate"
                  type="date"
                  className="bg-slate-950 border-slate-850 text-white"
                  value={admitForm.admissionDate}
                  onChange={(e) => setAdmitForm((f) => ({ ...f, admissionDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reason" className="text-slate-350">Reason for Admission *</Label>
                <Input
                  id="reason"
                  required
                  placeholder="e.g. Acute respiratory failure, post-op care"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={admitForm.admissionReason}
                  onChange={(e) => setAdmitForm((f) => ({ ...f, admissionReason: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:text-white" onClick={() => setAdmitOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAdmissionMutation.isPending} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
                  {createAdmissionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Discharge Dialog */}
        <Dialog open={dischargeOpen} onOpenChange={setDischargeOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Patient Discharge Authorization</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleDischargeSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="dischargeDate" className="text-slate-350">Discharge Date</Label>
                <Input
                  id="dischargeDate"
                  type="date"
                  className="bg-slate-950 border-slate-850 text-white"
                  value={dischargeForm.dischargeDate}
                  onChange={(e) => setDischargeForm((f) => ({ ...f, dischargeDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dischargeNotes" className="text-slate-350">Discharge Notes / Summary</Label>
                <Textarea
                  id="dischargeNotes"
                  placeholder="Enter medical discharge summary, prescriptions, and follow up instructions..."
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  rows={4}
                  value={dischargeForm.notes}
                  onChange={(e) => setDischargeForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:text-white" onClick={() => setDischargeOpen(false)}>
                  Cancel
                </Button>
                <Button id="discharge-btn" type="submit" disabled={dischargeMutation.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                  {dischargeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Discharge"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search admissions by patient or reason..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-white">Patient Census</CardTitle>
          <CardDescription className="text-slate-400">Current inpatient list and historical hospital admissions.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading admissions roster...</div>
          ) : (
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table className="text-slate-300">
                <TableHeader className="bg-slate-850 border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Admission Date</TableHead>
                    <TableHead className="text-slate-400">Patient</TableHead>
                    <TableHead className="text-slate-400">Department / Bed</TableHead>
                    <TableHead className="text-slate-400">Primary Care Physician</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((admission) => (
                    <TableRow key={admission.id} className="border-slate-800 hover:bg-slate-850/40">
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          <Calendar className="h-4 w-4" />
                          {new Date(admission.admission_date || admission.admissionDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/hospital/patients/${admission.patient_id}`} className="hover:underline font-semibold text-white">
                          {admission.patients?.full_name || `Patient #${admission.patient_id}`}
                        </Link>
                        <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate" title={admission.admission_reason}>
                          {admission.admission_reason || admission.admissionReason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-white">{admission.wards?.name || "General Admissions"}</div>
                        <div className="text-xs text-slate-450 mt-1 flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5" /> Bed: {admission.beds?.bed_number || "Pending"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-white">
                        {admission.doctors?.full_name || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <AdmissionStatusBadge status={admission.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {admission.status !== "discharged" ? (
                          <Button
                            id={`discharge-trigger-${admission.id}`}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-semibold"
                            onClick={() => {
                              setActiveAdmissionId(admission.id);
                              setDischargeOpen(true);
                            }}
                          >
                            Discharge
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Discharged</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filtered || filtered.length === 0) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                        No active admissions found.
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

import { useListStaff, useCreateStaff } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Search, Plus, UserCircle, Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function RoleBadge({ role }: { role: string }) {
  const r = role.toLowerCase();
  let colorClass = "bg-slate-800 text-slate-400";

  if (r === "nurse") colorClass = "bg-pink-950/40 text-pink-400 border border-pink-500/20";
  if (r === "doctor") colorClass = "bg-emerald-950/40 text-emerald-450 border border-emerald-500/20";
  if (r === "technician") colorClass = "bg-purple-950/40 text-purple-400 border border-purple-500/20";
  if (r === "ward-assistant" || r === "ward_assistant") colorClass = "bg-blue-955/40 text-blue-400 border border-blue-500/20";
  if (r === "receptionist") colorClass = "bg-orange-955/40 text-orange-400 border border-orange-500/20";
  if (r === "admin") colorClass = "bg-indigo-955/40 text-indigo-400 border border-indigo-500/20";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize px-2 py-0.5 rounded-full font-medium text-xs`}>{role.replace("-", " ").replace("_", " ")}</Badge>;
}

export default function HospitalStaff() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: staff, isLoading, refetch } = useListStaff();
  const createStaffMutation = useCreateStaff();

  const [form, setForm] = useState({
    fullName: "",
    role: "nurse",
    qualification: "",
    mobile: "",
    email: "",
    assignedShift: "morning",
    licenseInfo: "",
  });

  const filteredStaff = staff?.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.mobile) {
      toast({ title: "Validation Error", description: "Name and Mobile are required.", variant: "destructive" });
      return;
    }

    try {
      await createStaffMutation.mutateAsync({
        full_name: form.fullName.trim(),
        role: form.role,
        qualification: form.qualification.trim() || null,
        mobile: form.mobile.trim(),
        email: form.email.trim() || null,
        assigned_shift: form.assignedShift,
        license_info: form.licenseInfo.trim() || null,
      });

      toast({ title: "Success", description: `Staff member ${form.fullName} has been added.` });
      setForm({
        fullName: "",
        role: "nurse",
        qualification: "",
        mobile: "",
        email: "",
        assignedShift: "morning",
        licenseInfo: "",
      });
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Failed to add staff", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Staff Registry</h1>
          <p className="text-slate-400 mt-2">Manage clinical personnel, qualification records, and shifts.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="add-staff-trigger" className="bg-violet-650 hover:bg-violet-600 text-white border-none gap-2">
              <Plus className="h-4 w-4" /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Add Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="staffName" className="text-slate-350">Full Name *</Label>
                <Input
                  id="staffName"
                  required
                  placeholder="e.g. Sarah Connor"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-350">Staff Role *</Label>
                  <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-850 text-white">
                      <SelectItem value="nurse" className="focus:bg-slate-800">Nurse</SelectItem>
                      <SelectItem value="doctor" className="focus:bg-slate-800">Doctor</SelectItem>
                      <SelectItem value="technician" className="focus:bg-slate-800">Technician</SelectItem>
                      <SelectItem value="ward_assistant" className="focus:bg-slate-800">Ward Assistant</SelectItem>
                      <SelectItem value="receptionist" className="focus:bg-slate-800">Receptionist</SelectItem>
                      <SelectItem value="admin" className="focus:bg-slate-800">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-350">Assigned Shift</Label>
                  <Select value={form.assignedShift} onValueChange={(v) => setForm((f) => ({ ...f, assignedShift: v }))}>
                    <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-850 text-white">
                      <SelectItem value="morning" className="focus:bg-slate-800">Morning Shift</SelectItem>
                      <SelectItem value="evening" className="focus:bg-slate-800">Evening Shift</SelectItem>
                      <SelectItem value="night" className="focus:bg-slate-800">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="qualification" className="text-slate-350">Qualification / Degree</Label>
                <Input
                  id="qualification"
                  placeholder="e.g. B.Sc. Nursing, MD Pediatrics"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.qualification}
                  onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mobile" className="text-slate-350">Mobile Number *</Label>
                <Input
                  id="mobile"
                  required
                  placeholder="+91 9876543210"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-slate-350">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sarah@hospital.com"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="license" className="text-slate-350">License / Registration Info</Label>
                <Input
                  id="license"
                  placeholder="e.g. State Nursing Council Reg No"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.licenseInfo}
                  onChange={(e) => setForm((f) => ({ ...f, licenseInfo: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStaffMutation.isPending} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
                  {createStaffMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
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
            placeholder="Search staff by name or employee ID..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-white">Active Personnel</CardTitle>
          <CardDescription className="text-slate-400">List of all staff members currently assigned to this hospital.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading staff roster...</div>
          ) : (
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table className="text-slate-350">
                <TableHeader className="bg-slate-850 border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Staff Member</TableHead>
                    <TableHead className="text-slate-400">Employee ID</TableHead>
                    <TableHead className="text-slate-400">Role</TableHead>
                    <TableHead className="text-slate-400">Contact</TableHead>
                    <TableHead className="text-slate-400">Shift</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff?.map((member) => (
                    <TableRow key={member.id} className="border-slate-800 hover:bg-slate-850/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-8 w-8 text-slate-400 animate-pulse" />
                          <div>
                            <div className="font-semibold text-white">{member.full_name}</div>
                            <div className="text-xs text-slate-400">{member.qualification || "No degree specified"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">{member.employee_id}</TableCell>
                      <TableCell>
                        <RoleBadge role={member.role} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                          {member.mobile}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs capitalize text-slate-300 font-medium">{member.assigned_shift || "Unassigned"}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredStaff || filteredStaff.length === 0) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="h-24 text-center text-slate-400">
                        No staff members found.
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

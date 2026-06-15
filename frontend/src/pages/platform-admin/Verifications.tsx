import { useListPendingApplications, useApproveApplication, useRejectApplication } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminVerifications() {
  const { toast } = useToast();
  const { data: apps, isLoading, refetch } = useListPendingApplications({ status: "pending" });
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  async function handleApprove(id: number) {
    try {
      await approveMutation.mutateAsync(id);
      toast({ title: "Approved", description: "Application approved and invite email sent." });
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  }

  async function handleReject(id: number) {
    try {
      await rejectMutation.mutateAsync(id);
      toast({ title: "Rejected", description: "Application marked as rejected." });
      refetch();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Pending Verifications</h1>
        <p className="text-slate-400 mt-2">Review and verify registrations for doctors, lab networks, and hospital administrators.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Verification Queue</CardTitle>
          <CardDescription className="text-slate-400">Applications currently awaiting administrator approval.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading applications...</div>
          ) : (
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table className="text-slate-300">
                <TableHeader className="bg-slate-800/40 border-b border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Applicant</TableHead>
                    <TableHead className="text-slate-400">Applied Role</TableHead>
                    <TableHead className="text-slate-400">Details</TableHead>
                    <TableHead className="text-slate-400">Submission Date</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps?.map((app) => {
                    let detailsObj: any = {};
                    try { detailsObj = JSON.parse(app.details || "{}"); } catch { /* noop */ }
                    return (
                      <TableRow key={app.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-white">{app.full_name}</div>
                            <div className="text-xs text-slate-400">{app.email}</div>
                            <div className="text-xs text-slate-400">{app.mobile}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-950/40 text-blue-400 border border-blue-500/20 capitalize font-medium">
                            {app.role?.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-xs space-y-1 text-slate-300">
                            {app.role === "doctor" && (
                              <>
                                <p><strong>Specialization:</strong> {detailsObj.specialization}</p>
                                <p><strong>Quals:</strong> {detailsObj.qualification} ({detailsObj.yearsOfExperience} yrs exp)</p>
                                <p><strong>License:</strong> {detailsObj.licenseNumber || "N/A"}</p>
                              </>
                            )}
                            {app.role === "lab_admin" && (
                              <>
                                <p><strong>Lab Name:</strong> {detailsObj.labName}</p>
                                <p><strong>Reg No:</strong> {detailsObj.registrationNumber}</p>
                                <p><strong>Address:</strong> {detailsObj.address || "N/A"}</p>
                              </>
                            )}
                            {app.role === "hospital_admin" && (
                              <>
                                <p><strong>Hospital Name:</strong> {detailsObj.hospitalName}</p>
                                <p><strong>Reg No:</strong> {detailsObj.registrationNumber}</p>
                                <p><strong>Total Beds:</strong> {detailsObj.totalBeds || "N/A"}</p>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {new Date(app.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              id={`approve-${app.id}`}
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(app.id)}
                              className="bg-emerald-950/30 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                            >
                              <Check className="h-4 w-4" /> Approve
                            </Button>
                            <Button
                              id={`reject-${app.id}`}
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(app.id)}
                              className="bg-red-955/30 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                            >
                              <X className="h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {apps?.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="h-24 text-center text-slate-400">
                        No pending applications found.
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

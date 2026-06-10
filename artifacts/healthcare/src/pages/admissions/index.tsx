import { useListAdmissions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, BedDouble } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function AdmissionStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let colorClass = "bg-muted text-muted-foreground";
  
  if (s === "admitted") colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "icu") colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  if (s === "observation") colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  if (s === "recovery") colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (s === "discharged") colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize`}>{status}</Badge>;
}

export default function Admissions() {
  const [search, setSearch] = useState("");
  const { data: admissions, isLoading } = useListAdmissions({});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
          <p className="text-muted-foreground mt-2">Track patient hospitalizations and bed assignments.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Admission
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient or hospital..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading admissions...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Hospital / Ward</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admissions?.map((admission) => (
                    <TableRow key={admission.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(admission.admissionDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${admission.patientId}`} className="hover:underline font-medium">
                          {admission.patientName || `Patient #${admission.patientId}`}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{admission.admissionReason}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{admission.hospitalName || `Hospital #${admission.hospitalId}`}</div>
                        <div className="text-xs text-muted-foreground">{admission.wardName || "Unassigned"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                          {admission.bedNumber || "Pending"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <AdmissionStatusBadge status={admission.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!admissions || admissions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
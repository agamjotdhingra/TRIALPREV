import { useListDoctors } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Stethoscope } from "lucide-react";
import { useState } from "react";

export function VerificationBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = status.toLowerCase();
  
  let colorClass = "bg-muted text-muted-foreground";
  if (s === "approved") colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (s === "pending") colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (s === "rejected") colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize`}>{status}</Badge>;
}

export default function Doctors() {
  const [search, setSearch] = useState("");
  const { data: doctors, isLoading } = useListDoctors({ specialization: search || undefined });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Registry</h1>
          <p className="text-muted-foreground mt-2">Manage medical staff and specialists.</p>
        </div>
        <Button className="gap-2">
          Onboard Doctor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by specialization..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading doctors...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors?.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Stethoscope className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doctor.fullName}</div>
                            <div className="text-xs text-muted-foreground">{doctor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.yearsOfExperience} yrs</TableCell>
                      <TableCell className="font-mono text-sm">{doctor.licenseNumber || "N/A"}</TableCell>
                      <TableCell>
                        <VerificationBadge status={doctor.verificationStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/doctors/${doctor.id}`}>
                          <Button variant="ghost" size="sm">View Profile</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {doctors?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No doctors found.
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
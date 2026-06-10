import { useListPatients } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, UserCircle } from "lucide-react";
import { useState } from "react";

export function RiskBadge({ level }: { level?: string | null }) {
  if (!level) return null;
  const l = level.toLowerCase();
  
  let colorClass = "bg-muted text-muted-foreground";
  if (l === "healthy") colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (l === "moderate") colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (l === "high") colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  if (l === "critical") colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize`}>{level}</Badge>;
}

export default function Patients() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = useListPatients({ search: search || undefined });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Registry</h1>
          <p className="text-muted-foreground mt-2">Manage and view longitudinal health records.</p>
        </div>
        <Link href="/patients/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Register Patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or Health ID..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading patients...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Health ID</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Health Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients?.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{patient.fullName}</div>
                            <div className="text-xs text-muted-foreground">{patient.gender}, {patient.age} yrs</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{patient.healthId}</TableCell>
                      <TableCell>{patient.bloodGroup}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-medium ${
                            (patient.healthScore ?? 0) >= 80 ? "text-emerald-600" :
                            (patient.healthScore ?? 0) >= 60 ? "text-yellow-600" :
                            (patient.healthScore ?? 0) >= 40 ? "text-orange-600" :
                            "text-red-600"
                          }`}>
                            {patient.healthScore ?? "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={patient.riskLevel} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm">View EHR</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patients?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No patients found.
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
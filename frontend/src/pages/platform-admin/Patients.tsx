import { useListPatients } from "@/api/hooks";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserCircle } from "lucide-react";
import { useState } from "react";
import { RiskBadge } from "@/components/SharedHelpers";

export default function AdminPatients() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = useListPatients({ search: search || undefined });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Patient Registry</h1>
          <p className="text-slate-400 mt-2">Manage and view longitudinal health records across the platform.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, Health ID or mobile..."
                className="pl-9 bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading patients...</div>
          ) : (
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table className="text-slate-300">
                <TableHeader className="bg-slate-800/40 border-b border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Patient</TableHead>
                    <TableHead className="text-slate-400">Health ID</TableHead>
                    <TableHead className="text-slate-400">Blood Group</TableHead>
                    <TableHead className="text-slate-400">Health Score</TableHead>
                    <TableHead className="text-slate-400">Risk Level</TableHead>
                    <TableHead className="text-slate-400 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients?.map((patient) => (
                    <TableRow key={patient.id} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-8 w-8 text-slate-400" />
                          <div>
                            <div className="font-semibold text-white">{patient.full_name}</div>
                            <div className="text-xs text-slate-400">{patient.gender}, {patient.age} yrs</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-300">{patient.health_id}</TableCell>
                      <TableCell>{patient.blood_group || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-semibold ${
                            (patient.health_score ?? 0) >= 80 ? "text-emerald-400" :
                            (patient.health_score ?? 0) >= 60 ? "text-yellow-400" :
                            (patient.health_score ?? 0) >= 40 ? "text-orange-400" :
                            "text-red-400"
                          }`}>
                            {patient.health_score ?? "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={patient.risk_level} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                            View EHR
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patients?.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="h-24 text-center text-slate-400">
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

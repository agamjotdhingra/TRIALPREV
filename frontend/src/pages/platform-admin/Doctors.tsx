import { useListDoctors } from "@/api/hooks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Stethoscope } from "lucide-react";
import { useState } from "react";

export function VerificationBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = status.toLowerCase();

  let colorClass = "bg-slate-800 text-slate-400";
  if (s === "approved") colorClass = "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20";
  if (s === "pending") colorClass = "bg-yellow-950/40 text-yellow-400 border border-yellow-500/20";
  if (s === "rejected") colorClass = "bg-red-950/40 text-red-400 border border-red-500/20";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize px-2 py-0.5 rounded-full font-medium text-xs`}>{status}</Badge>;
}

export default function AdminDoctors() {
  const [search, setSearch] = useState("");
  // Backend search allows name or spec
  const { data: doctors, isLoading } = useListDoctors({ search: search || undefined });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Doctor Registry</h1>
          <p className="text-slate-400 mt-2">Manage medical staff and specialists across the platform.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or specialization..."
                className="pl-9 bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading doctors...</div>
          ) : (
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table className="text-slate-300">
                <TableHeader className="bg-slate-800/40 border-b border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Doctor</TableHead>
                    <TableHead className="text-slate-400">Specialization</TableHead>
                    <TableHead className="text-slate-400">Experience</TableHead>
                    <TableHead className="text-slate-400">License</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors?.map((doctor) => (
                    <TableRow key={doctor.id} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Stethoscope className="h-8 w-8 text-slate-400" />
                          <div>
                            <div className="font-semibold text-white">{doctor.full_name}</div>
                            <div className="text-xs text-slate-400">{doctor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.years_of_experience} yrs</TableCell>
                      <TableCell className="font-mono text-sm text-slate-300">{doctor.license_number || "N/A"}</TableCell>
                      <TableCell>
                        <VerificationBadge status={doctor.verification_status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {doctors?.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="h-24 text-center text-slate-400">
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

import { useGetDashboardStats, useListWards } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bed, Users, HeartPulse, UserCircle } from "lucide-react";

export default function HospitalDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: wards, isLoading: wardsLoading } = useListWards();

  if (statsLoading || wardsLoading) {
    return <div className="p-8 text-center text-slate-400">Loading hospital data...</div>;
  }

  const occupancyRate = stats?.totalBeds ? ((stats.occupiedBeds || 0) / stats.totalBeds) * 100 : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Hospital Command Center</h1>
        <p className="text-slate-400 mt-1">Real-time bed occupancy, admissions tracking, and shift logistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupied Beds */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">Occupied Beds</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.occupiedBeds || 0} <span className="text-sm font-normal text-slate-400">/ {stats?.totalBeds || 0}</span>
                </p>
              </div>
              <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center">
                <Bed className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${Math.min(100, occupancyRate)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admitted Patients */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">Admitted Patients</p>
                <p className="text-2xl font-bold text-white">{stats?.totalAdmitted || 0}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Active inpatient records</p>
          </CardContent>
        </Card>

        {/* ICU Patients */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">ICU Patients</p>
                <p className="text-2xl font-bold text-red-400">{stats?.icuPatients || 0}</p>
              </div>
              <div className="h-10 w-10 bg-red-500/10 text-red-450 rounded-full flex items-center justify-center">
                <HeartPulse className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Requires intensive monitoring</p>
          </CardContent>
        </Card>

        {/* Staff on Duty */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">On Duty Staff</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.doctorsOnDuty || 0} <span className="text-sm font-normal text-slate-400">Doc</span> + {stats?.nursesOnDuty || 0} <span className="text-sm font-normal text-slate-400">Nur</span>
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center">
                <UserCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Active on shift roster</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Ward Breakdown</CardTitle>
            <CardDescription className="text-slate-400">Current occupancy rates by clinical department</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="rounded-md border border-slate-800 overflow-hidden">
              <Table className="text-slate-350">
                <TableHeader className="bg-slate-850 border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Ward Name</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Occupancy</TableHead>
                    <TableHead className="w-1/3 text-slate-400">Capacity Bar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wards?.map((ward) => {
                    const wardTotal = ward.total_beds || 0;
                    const wardOcc = ward.occupied_beds || 0;
                    const rate = wardTotal ? (wardOcc / wardTotal) * 100 : 0;
                    let barColor = "bg-emerald-500";
                    if (rate >= 90) barColor = "bg-red-500";
                    else if (rate >= 75) barColor = "bg-orange-500";

                    return (
                      <TableRow key={ward.id} className="border-slate-800 hover:bg-slate-850/40">
                        <TableCell className="font-semibold text-white">{ward.name}</TableCell>
                        <TableCell className="uppercase text-xs tracking-wider text-slate-400">{ward.ward_type || "General"}</TableCell>
                        <TableCell className="text-sm text-white font-medium">
                          {wardOcc} / {wardTotal} ({rate.toFixed(0)}%)
                        </TableCell>
                        <TableCell>
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${rate}%` }} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!wards || wards.length === 0) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                        No wards defined for this hospital.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

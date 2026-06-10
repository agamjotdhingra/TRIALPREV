import { useParams, Link } from "wouter";
import { useGetHospital, useGetHospitalOverview, useListWards } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Users, Bed, AlertCircle, HeartPulse, UserCircle } from "lucide-react";

export default function HospitalCommandCenter() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");

  const { data: hospital, isLoading: hospLoading } = useGetHospital(id, { query: { enabled: !!id, queryKey: ["hospital", id] }});
  const { data: overview, isLoading: overviewLoading } = useGetHospitalOverview(id, { query: { enabled: !!id, queryKey: ["hospital-overview", id] }});
  const { data: wards, isLoading: wardsLoading } = useListWards({ hospitalId: id }, { query: { enabled: !!id }});

  if (hospLoading || overviewLoading || wardsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading hospital data...</div>;
  }

  if (!hospital) {
    return <div className="p-8 text-center text-red-500">Hospital not found</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hospitals">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{hospital.name}</h1>
          <p className="text-muted-foreground mt-1">Command Center • {hospital.registrationNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Occupied Beds</p>
                <p className="text-2xl font-bold">{overview?.occupiedBeds || 0} <span className="text-sm font-normal text-muted-foreground">/ {overview?.totalBeds || 0}</span></p>
              </div>
              <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center">
                <Bed className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${Math.min(100, ((overview?.occupiedBeds || 0) / (overview?.totalBeds || 1)) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Admitted Patients</p>
                <p className="text-2xl font-bold">{overview?.admittedPatients || 0}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{overview?.dischargedToday || 0} discharged today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">ICU Patients</p>
                <p className="text-2xl font-bold text-red-500">{overview?.icuPatients || 0}</p>
              </div>
              <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <HeartPulse className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">On Duty Staff</p>
                <p className="text-2xl font-bold">
                  {overview?.doctorsOnDuty || 0} <span className="text-sm font-normal text-muted-foreground">Doc</span> + {overview?.nursesOnDuty || 0} <span className="text-sm font-normal text-muted-foreground">Nur</span>
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                <UserCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ward Breakdown</CardTitle>
            <CardDescription>Current occupancy across all departments</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ward Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead className="w-1/3">Capacity Bar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wards?.map((ward) => {
                    const occupancyRate = (ward.occupiedBeds / ward.totalBeds) * 100;
                    let barColor = "bg-emerald-500";
                    if (occupancyRate >= 90) barColor = "bg-red-500";
                    else if (occupancyRate >= 75) barColor = "bg-orange-500";

                    return (
                      <TableRow key={ward.id}>
                        <TableCell className="font-medium">{ward.name}</TableCell>
                        <TableCell className="uppercase text-xs tracking-wider text-muted-foreground">{ward.wardType}</TableCell>
                        <TableCell className="text-sm">
                          {ward.occupiedBeds} / {ward.totalBeds} ({occupancyRate.toFixed(0)}%)
                        </TableCell>
                        <TableCell>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${occupancyRate}%` }} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!wards || wards.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No wards defined for this hospital.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview?.alerts && overview.alerts.length > 0 ? (
              <div className="space-y-3">
                {overview.alerts.map((alert, i) => (
                  <div key={i} className="p-3 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400 rounded-md text-sm border border-red-100 dark:border-red-900/50">
                    {alert}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No critical alerts at this time.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
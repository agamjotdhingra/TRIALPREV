import { useParams, Link } from "wouter";
import { useGetPatient, useGetPatientHealthScore, useListAppointments, useListPrescriptions, useListReports } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Calendar, Activity, Pill, AlertTriangle, Clock, Download } from "lucide-react";
import { RiskBadge } from "./index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, TypeIcon } from "../appointments/index";

export default function PatientEHR() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");

  const { data: patient, isLoading } = useGetPatient(id, { query: { enabled: !!id, queryKey: ["patient", id] }});
  const { data: score } = useGetPatientHealthScore(id, { query: { enabled: !!id, queryKey: ["health-score", id] }});
  
  const { data: appointments } = useListAppointments({ patientId: id }, { query: { enabled: !!id } });
  const { data: prescriptions } = useListPrescriptions({ patientId: id }, { query: { enabled: !!id } });
  const { data: reports } = useListReports({ patientId: id }, { query: { enabled: !!id } });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading patient record...</div>;
  }

  if (!patient) {
    return <div className="p-8 text-center text-red-500">Patient not found</div>;
  }

  const scoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-yellow-500";
    if (s >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{patient.fullName}</h1>
            <RiskBadge level={patient.riskLevel} />
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-1">{patient.healthId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Age / Gender</div>
                <div className="font-medium">{patient.age} yrs / {patient.gender}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Blood Group</div>
                <div className="font-medium">{patient.bloodGroup}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Height / Weight</div>
                <div className="font-medium">{patient.height}cm / {patient.weight}kg</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">BMI</div>
                <div className="font-medium">{patient.bmi?.toFixed(1) || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Mobile</div>
                <div className="font-medium">{patient.mobile}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Email</div>
                <div className="font-medium">{patient.email || "-"}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-muted-foreground mb-1">Date of Birth</div>
                <div className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-muted">
              <div className={`text-4xl font-bold ${scoreColor(score?.score ?? patient.healthScore ?? 0)}`}>
                {score?.score ?? patient.healthScore ?? "-"}
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Computed Health Index</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clinical" className="w-full">
        <TabsList>
          <TabsTrigger value="clinical" className="gap-2"><Activity className="w-4 h-4"/> Clinical Profile</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2"><Calendar className="w-4 h-4"/> Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-2"><Pill className="w-4 h-4"/> Prescriptions</TabsTrigger>
          <TabsTrigger value="reports" className="gap-2"><FileText className="w-4 h-4"/> Lab Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinical" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground/80">Existing Conditions</h4>
                <p className="text-sm text-muted-foreground">{patient.existingDiseases || "None reported"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground/80">Allergies</h4>
                <p className="text-sm text-muted-foreground">{patient.allergies || "None reported"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2 text-foreground/80">Current Medications</h4>
                <p className="text-sm text-muted-foreground">{patient.currentMedications || "None reported"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{new Date(apt.scheduledDate).toLocaleDateString()}</span>
                          <span className="text-sm text-muted-foreground">{apt.scheduledTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>Dr. {apt.doctorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm capitalize text-muted-foreground">
                          <TypeIcon type={apt.consultationType} />
                          {apt.consultationType || "In-person"}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={apt.status} /></TableCell>
                    </TableRow>
                  ))}
                  {(!appointments || appointments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No appointments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Medicines</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions?.map((rx) => {
                    let medsCount = 0;
                    try { medsCount = JSON.parse(rx.medicines).length; } catch { medsCount = 1; }
                    return (
                      <TableRow key={rx.id}>
                        <TableCell className="text-sm">{new Date(rx.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">Dr. {rx.doctorName}</TableCell>
                        <TableCell className="font-medium">{rx.diagnosis}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{medsCount} {medsCount === 1 ? 'medicine' : 'medicines'}</TableCell>
                      </TableRow>
                    );
                  })}
                  {(!prescriptions || prescriptions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No prescriptions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Laboratory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports?.map((report) => (
                    <TableRow key={report.id} className={report.isCritical ? "bg-red-50 dark:bg-red-950/20" : ""}>
                      <TableCell className="text-sm">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {report.reportName}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{report.labName}</TableCell>
                      <TableCell>
                        {report.isCritical ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 gap-1">
                            <AlertTriangle className="h-3 w-3" /> Critical
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.fileUrl && (
                          <Button variant="ghost" size="icon" title="Download File">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!reports || reports.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No lab reports found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
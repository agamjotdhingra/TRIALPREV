import { useParams, Link } from "wouter";
import { useGetPatient, useGetPatientHealthScore, useListAppointments, useListPrescriptions, useListReports } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, FileText, Calendar, Activity, Pill, AlertTriangle, QrCode, Download } from "lucide-react";
import { RiskBadge } from "./index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, TypeIcon } from "../appointments/index";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

function PrescriptionPrintable({ rx }: { rx: {
  id: number;
  diagnosis: string;
  medicines: string;
  instructions: string | null;
  followUpDate: string | null;
  createdAt: string;
  patientName: string | null;
  doctorName: string | null;
}}) {
  let medicines: string[] = [];
  try { medicines = JSON.parse(rx.medicines); } catch { medicines = [rx.medicines]; }
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 680, margin: "0 auto", padding: 40 }}>
      <div style={{ borderBottom: "3px solid #1e3a5f", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1e3a5f", letterSpacing: 1 }}>HealthOS</div>
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Preventive Healthcare Platform — Digital Prescription</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 13 }}>
        <div>
          <div style={{ color: "#888", marginBottom: 3 }}>Patient</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{rx.patientName || "—"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#888", marginBottom: 3 }}>Prescribing Doctor</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{rx.doctorName || "—"}</div>
          <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
      </div>

      <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "12px 18px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Diagnosis</div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#1e3a5f" }}>{rx.diagnosis}</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Prescribed Medicines</div>
        {medicines.map((med, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "#1e3a5f", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontSize: 14, color: "#222" }}>{typeof med === "object" ? JSON.stringify(med) : med}</div>
          </div>
        ))}
      </div>

      {rx.instructions && (
        <div style={{ background: "#fffbea", border: "1px solid #f0d060", borderRadius: 8, padding: "12px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4, textTransform: "uppercase" }}>Instructions</div>
          <div style={{ fontSize: 13, color: "#333" }}>{rx.instructions}</div>
        </div>
      )}

      {rx.followUpDate && (
        <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
          <strong>Follow-up Date:</strong> {new Date(rx.followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      )}

      <div style={{ borderTop: "1px dashed #ccc", paddingTop: 16, fontSize: 11, color: "#aaa", display: "flex", justifyContent: "space-between" }}>
        <span>This is a digitally generated prescription from HealthOS Platform.</span>
        <span>Rx #{rx.id}</span>
      </div>
    </div>
  );
}

function PrintablePrescriptionWrapper({ rx }: { rx: Parameters<typeof PrescriptionPrintable>[0]["rx"] }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Prescription-${rx.id}-${rx.patientName ?? "patient"}`,
  });

  return (
    <div>
      <Button className="w-full mb-4 gap-2" onClick={() => handlePrint()}>
        <Download className="h-4 w-4" /> Download / Print PDF
      </Button>
      <div ref={printRef}>
        <PrescriptionPrintable rx={rx} />
      </div>
    </div>
  );
}

export default function PatientEHR() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");

  const { data: patient, isLoading } = useGetPatient(id, { query: { enabled: !!id, queryKey: ["patient", id] } });
  const { data: score } = useGetPatientHealthScore(id, { query: { enabled: !!id, queryKey: ["health-score", id] } });
  const { data: appointments } = useListAppointments({ patientId: id }, { query: { enabled: !!id } });
  const { data: prescriptions } = useListPrescriptions({ patientId: id }, { query: { enabled: !!id } });
  const { data: reports } = useListReports({ patientId: id }, { query: { enabled: !!id } });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading patient record...</div>;
  if (!patient) return <div className="p-8 text-center text-red-500">Patient not found</div>;

  const healthScore = score?.score ?? patient.healthScore ?? 0;
  const scoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-yellow-500";
    if (s >= 40) return "text-orange-500";
    return "text-red-500";
  };
  const ringColor = (s: number) => {
    if (s >= 80) return "border-emerald-400";
    if (s >= 60) return "border-yellow-400";
    if (s >= 40) return "border-orange-400";
    return "border-red-400";
  };

  const qrData = JSON.stringify({ healthId: patient.healthId, name: patient.fullName, blood: patient.bloodGroup });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{patient.fullName}</h1>
            <RiskBadge level={patient.riskLevel} />
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-1">{patient.healthId}</p>
        </div>
        <div className="ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" /> Health ID QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Patient QR Code</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-xl border shadow-sm">
                  <QRCodeSVG value={qrData} size={200} level="H" includeMargin />
                </div>
                <div className="text-center">
                  <p className="font-mono font-bold text-lg tracking-widest">{patient.healthId}</p>
                  <p className="text-sm text-muted-foreground mt-1">{patient.fullName}</p>
                  <p className="text-xs text-muted-foreground">Blood Group: {patient.bloodGroup}</p>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Scan at any HealthOS-connected hospital, lab, or clinic for instant patient identification.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
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
                <div className="font-medium">{patient.bmi?.toFixed(1) || "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Mobile</div>
                <div className="font-medium">{patient.mobile}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Email</div>
                <div className="font-medium">{patient.email || "—"}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-muted-foreground mb-1">Date of Birth</div>
                <div className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Health Score</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4 gap-3">
            <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-8 ${ringColor(healthScore)}`}>
              <div className={`text-4xl font-bold ${scoreColor(healthScore)}`}>{healthScore || "—"}</div>
            </div>
            <div className="text-center space-y-1">
              <RiskBadge level={patient.riskLevel} />
              <p className="text-xs text-muted-foreground mt-1">Computed from BMI, conditions & lifestyle</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="clinical" className="w-full">
        <TabsList>
          <TabsTrigger value="clinical" className="gap-2"><Activity className="w-4 h-4" />Clinical Profile</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2"><Calendar className="w-4 h-4" />Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-2"><Pill className="w-4 h-4" />Prescriptions</TabsTrigger>
          <TabsTrigger value="reports" className="gap-2"><FileText className="w-4 h-4" />Lab Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle>Medical History</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              {[
                ["Existing Conditions", patient.existingDiseases],
                ["Chronic Diseases", patient.chronicDiseases],
                ["Allergies", patient.allergies],
                ["Current Medications", patient.currentMedications],
                ["Family Medical History", patient.familyMedicalHistory],
                ["Previous Surgeries", patient.surgeries],
                ["Vaccinations", patient.vaccinations],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <h4 className="font-medium text-foreground/80 mb-1">{label}</h4>
                  <p className="text-muted-foreground">{value || "None reported"}</p>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h4 className="font-medium text-foreground/80 mb-1">Smoking</h4>
                  <Badge variant={patient.smokingStatus === "yes" ? "destructive" : "secondary"}>
                    {patient.smokingStatus === "yes" ? "Smoker" : "Non-smoker"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-foreground/80 mb-1">Alcohol</h4>
                  <Badge variant={patient.alcoholConsumption === "yes" ? "destructive" : "secondary"}>
                    {patient.alcoholConsumption === "yes" ? "Consumes Alcohol" : "Non-drinker"}
                  </Badge>
                </div>
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
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <span className="font-medium">{new Date(apt.scheduledDate).toLocaleDateString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">{apt.scheduledTime}</span>
                      </TableCell>
                      <TableCell>{apt.doctorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm capitalize text-muted-foreground">
                          <TypeIcon type={apt.consultationType} />{apt.consultationType || "In-person"}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={apt.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{apt.reason || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(!appointments || appointments.length === 0) && (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No appointments found.</TableCell></TableRow>
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
                    <TableHead>Follow-up</TableHead>
                    <TableHead className="text-right">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions?.map((rx) => {
                    let medsCount = 0;
                    try { medsCount = JSON.parse(rx.medicines).length; } catch { medsCount = 1; }
                    return (
                      <TableRow key={rx.id}>
                        <TableCell className="text-sm">{new Date(rx.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{rx.doctorName}</TableCell>
                        <TableCell className="font-medium">{rx.diagnosis}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{medsCount} {medsCount === 1 ? "medicine" : "medicines"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {rx.followUpDate ? new Date(rx.followUpDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Download PDF">
                                <Download className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Prescription — {rx.diagnosis}</DialogTitle>
                              </DialogHeader>
                              <PrintablePrescriptionWrapper rx={rx} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!prescriptions || prescriptions.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No prescriptions found.</TableCell></TableRow>
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
                    <TableHead>Findings</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{report.findings || "—"}</TableCell>
                      <TableCell>
                        {report.isCritical ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 gap-1">
                            <AlertTriangle className="h-3 w-3" /> Critical
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!reports || reports.length === 0) && (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No lab reports found.</TableCell></TableRow>
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

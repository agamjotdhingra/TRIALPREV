import { useParams, Link, useLocation } from "wouter";
import { useGetPatient, useGetPatientHealthScore, useListAppointments, useListPrescriptions, useListReports } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, FileText, Calendar, Activity, Pill, AlertTriangle, QrCode, Download } from "lucide-react";
import { RiskBadge, StatusBadge, TypeIcon } from "@/components/SharedHelpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "@/auth/AuthContext";

function PrescriptionPrintable({ rx }: { rx: any }) {
  let medicines: string[] = [];
  try { medicines = JSON.parse(rx.medicines); } catch { medicines = [rx.medicines]; }
  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 680, margin: "0 auto", padding: 40, backgroundColor: "#fff", color: "#000" }}>
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
          <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
            {new Date(rx.created_at || rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
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

      {rx.follow_up_date && (
        <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
          <strong>Follow-up Date:</strong> {new Date(rx.follow_up_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      )}

      <div style={{ borderTop: "1px dashed #ccc", paddingTop: 16, fontSize: 11, color: "#aaa", display: "flex", justifyContent: "space-between" }}>
        <span>This is a digitally generated prescription from HealthOS Platform.</span>
        <span>Rx #{rx.id}</span>
      </div>
    </div>
  );
}

function PrintablePrescriptionWrapper({ rx }: { rx: any }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Prescription-${rx.id}-${rx.patientName ?? "patient"}`,
  });

  return (
    <div>
      <Button className="w-full mb-4 gap-2 bg-blue-600 hover:bg-blue-500 text-white border-none" onClick={() => handlePrint()}>
        <Download className="h-4 w-4" /> Download / Print PDF
      </Button>
      <div ref={printRef}>
        <PrescriptionPrintable rx={rx} />
      </div>
    </div>
  );
}

interface PatientEHRProps {
  patientId?: number;
  [key: string]: any;
}

export default function PatientEHR({ patientId }: PatientEHRProps) {
  const params = useParams<{ id?: string }>();
  const { profile } = useAuth();
  const [location] = useLocation();

  // Determine which patient record to view
  const activeId = (patientId ?? (params.id ? parseInt(params.id, 10) : profile?.entity_id)) || undefined;

  const { data: patient, isLoading } = useGetPatient(activeId!, { query: { enabled: !!activeId } });
  const { data: score } = useGetPatientHealthScore(activeId!, { query: { enabled: !!activeId } });
  const { data: appointments } = useListAppointments({ patientId: activeId }, { query: { enabled: !!activeId } });
  const { data: prescriptions } = useListPrescriptions({ patientId: activeId });
  const { data: reports } = useListReports({ patientId: activeId });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading patient record...</div>;
  if (!patient) return <div className="p-8 text-center text-red-400">Patient not found</div>;

  const healthScore = score?.score ?? patient.health_score ?? 0;
  const scoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400";
    if (s >= 60) return "text-yellow-400";
    if (s >= 40) return "text-orange-400";
    return "text-red-400";
  };
  const ringColor = (s: number) => {
    if (s >= 80) return "border-emerald-500/30";
    if (s >= 60) return "border-yellow-500/30";
    if (s >= 40) return "border-orange-500/30";
    return "border-red-500/30";
  };

  const qrData = JSON.stringify({ healthId: patient.health_id, name: patient.full_name, blood: patient.blood_group });

  let backUrl = "/";
  if (location.startsWith("/admin")) backUrl = "/admin/patients";
  else if (location.startsWith("/doctor")) backUrl = "/doctor/patients";
  else if (location.startsWith("/hospital")) backUrl = "/hospital/patients";

  const showBackButton = profile?.role !== 'patient';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {showBackButton && (
          <Link href={backUrl}>
            <Button variant="outline" size="icon" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{patient.full_name}</h1>
            <RiskBadge level={patient.risk_level} />
          </div>
          <p className="text-slate-400 font-mono text-sm mt-1">{patient.health_id}</p>
        </div>
        <div className="sm:ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800">
                <QrCode className="h-4 w-4" /> Health ID QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Patient QR Code</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-xl border border-slate-700 shadow-sm">
                  <QRCodeSVG value={qrData} size={200} level="H" includeMargin />
                </div>
                <div className="text-center">
                  <p className="font-mono font-bold text-lg tracking-widest text-slate-900">{patient.health_id}</p>
                  <p className="text-sm text-slate-400 mt-1">{patient.full_name}</p>
                  <p className="text-xs text-slate-500">Blood Group: {patient.blood_group}</p>
                </div>
                <p className="text-xs text-center text-slate-400">
                  Scan at any HealthOS-connected hospital, lab, or clinic for instant patient identification.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Personal Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-300">
              <div>
                <div className="text-slate-400 mb-1">Age / Gender</div>
                <div className="font-medium text-white">{patient.age} yrs / {patient.gender}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Blood Group</div>
                <div className="font-medium text-white">{patient.blood_group || "—"}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Height / Weight</div>
                <div className="font-medium text-white">{patient.height}cm / {patient.weight}kg</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">BMI</div>
                <div className="font-medium text-white">{patient.bmi?.toFixed(1) || "—"}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Mobile</div>
                <div className="font-medium text-white">{patient.mobile}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Email</div>
                <div className="font-medium text-white truncate">{patient.email || "—"}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 mb-1">Date of Birth</div>
                <div className="font-medium text-white">
                  {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Health Score</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4 gap-3">
            <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-8 ${ringColor(healthScore)}`}>
              <div className={`text-4xl font-bold ${scoreColor(healthScore)}`}>{healthScore || "—"}</div>
            </div>
            <div className="text-center space-y-1">
              <RiskBadge level={patient.risk_level} />
              <p className="text-xs text-slate-400 mt-1">Computed from BMI, conditions & lifestyle</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="clinical" className="w-full">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="clinical" className="gap-2 text-slate-400 data-[state=active]:text-white"><Activity className="w-4 h-4" />Clinical Profile</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2 text-slate-400 data-[state=active]:text-white"><Calendar className="w-4 h-4" />Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-2 text-slate-400 data-[state=active]:text-white"><Pill className="w-4 h-4" />Prescriptions</TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 text-slate-400 data-[state=active]:text-white"><FileText className="w-4 h-4" />Lab Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="mt-6 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white">Medical History</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              {[
                ["Existing Conditions", patient.existing_diseases],
                ["Chronic Diseases", patient.chronic_diseases],
                ["Allergies", patient.allergies],
                ["Current Medications", patient.current_medications],
                ["Family Medical History", patient.family_medical_history],
                ["Previous Surgeries", patient.surgeries],
                ["Vaccinations", patient.vaccinations],
              ].map(([label, value]) => (
                <div key={label as string} className="pb-3 border-b border-slate-800 last:border-b-0 last:pb-0">
                  <h4 className="font-semibold text-slate-300 mb-1">{label}</h4>
                  <p className="text-slate-400">{value || "None reported"}</p>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1">Smoking</h4>
                  <Badge variant={patient.smoking_status === "yes" ? "destructive" : "secondary"} className="rounded-full">
                    {patient.smoking_status === "yes" ? "Smoker" : "Non-smoker"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1">Alcohol</h4>
                  <Badge variant={patient.alcohol_consumption === "yes" ? "destructive" : "secondary"} className="rounded-full">
                    {patient.alcohol_consumption === "yes" ? "Consumes Alcohol" : "Non-drinker"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardContent className="p-0">
              <Table className="text-slate-300">
                <TableHeader className="bg-slate-800/40">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Date & Time</TableHead>
                    <TableHead className="text-slate-400">Doctor</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments?.map((apt) => (
                    <TableRow key={apt.id} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell className="font-medium text-white">
                        <span>{new Date(apt.scheduled_date || apt.scheduledDate).toLocaleDateString()}</span>
                        <span className="text-xs text-slate-400 ml-2">{apt.scheduled_time || apt.scheduledTime}</span>
                      </TableCell>
                      <TableCell>{apt.doctorName || `Doctor #${apt.doctor_id}`}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs capitalize text-slate-400">
                          <TypeIcon type={apt.consultation_type || apt.consultationType} />
                          {apt.consultation_type || apt.consultationType || "In-person"}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={apt.status} /></TableCell>
                      <TableCell className="text-xs text-slate-400 max-w-[200px] truncate">{apt.reason || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(!appointments || appointments.length === 0) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="h-24 text-center text-slate-400">No appointments found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardContent className="p-0">
              <Table className="text-slate-300">
                <TableHeader className="bg-slate-800/40">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Doctor</TableHead>
                    <TableHead className="text-slate-400">Diagnosis</TableHead>
                    <TableHead className="text-slate-400">Medicines</TableHead>
                    <TableHead className="text-slate-400">Follow-up</TableHead>
                    <TableHead className="text-slate-400 text-right">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions?.map((rx) => {
                    let medsCount = 0;
                    try { medsCount = JSON.parse(rx.medicines).length; } catch { medsCount = 1; }
                    return (
                      <TableRow key={rx.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="text-xs">{new Date(rx.created_at || rx.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs text-slate-400">{rx.doctorName || `Doctor #${rx.doctor_id}`}</TableCell>
                        <TableCell className="font-semibold text-white">{rx.diagnosis}</TableCell>
                        <TableCell className="text-xs text-slate-400">{medsCount} {medsCount === 1 ? "medicine" : "medicines"}</TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {rx.follow_up_date || rx.followUpDate ? new Date(rx.follow_up_date || rx.followUpDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-850">
                                <Download className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-white">Prescription — {rx.diagnosis}</DialogTitle>
                              </DialogHeader>
                              <PrintablePrescriptionWrapper rx={rx} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!prescriptions || prescriptions.length === 0) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="h-24 text-center text-slate-400">No prescriptions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardContent className="p-0">
              <Table className="text-slate-300">
                <TableHeader className="bg-slate-800/40">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Report Name</TableHead>
                    <TableHead className="text-slate-400">Laboratory</TableHead>
                    <TableHead className="text-slate-400">Findings</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports?.map((report) => (
                    <TableRow key={report.id} className={`border-slate-800 hover:bg-slate-800/20 ${report.is_critical || report.isCritical ? "bg-red-500/5 hover:bg-red-500/10" : ""}`}>
                      <TableCell className="text-xs">{new Date(report.created_at || report.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-semibold text-white">
                          <FileText className="h-4 w-4 text-slate-400" />
                          {report.report_name || report.reportName}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">{report.labName || `Lab #${report.lab_id}`}</TableCell>
                      <TableCell className="text-xs text-slate-400 max-w-[200px] truncate">{report.findings || "—"}</TableCell>
                      <TableCell>
                        {report.is_critical || report.isCritical ? (
                          <Badge className="bg-red-950/40 text-red-400 border border-red-500/20 gap-1 rounded-full">
                            <AlertTriangle className="h-3 w-3" /> Critical
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-full">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!reports || reports.length === 0) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="h-24 text-center text-slate-400">No lab reports found.</TableCell>
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

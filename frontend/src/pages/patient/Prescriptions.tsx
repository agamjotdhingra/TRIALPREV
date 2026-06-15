import { useState, useRef } from "react";
import { useListPrescriptions } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pill, Search, Download, Calendar, User, FileText, ChevronRight } from "lucide-react";
import { useReactToPrint } from "react-to-print";

function PrescriptionPrintable({ rx }: { rx: any }) {
  let medicines: string[] = [];
  try {
    medicines = JSON.parse(rx.medicines);
  } catch {
    medicines = typeof rx.medicines === "string" ? [rx.medicines] : [];
  }

  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 680, margin: "0 auto", padding: 40, backgroundColor: "#fff", color: "#000" }}>
      <div style={{ borderBottom: "3px solid #1e3a5f", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1e3a5f", letterSpacing: 1 }}>HealthOS</div>
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Preventive Healthcare Platform — Digital Prescription</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 13, gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#888", marginBottom: 3 }}>Patient</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{rx.patientName || rx.patient_id || "—"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#888", marginBottom: 3 }}>Prescribing Doctor</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{rx.doctorName || `Doctor #${rx.doctor_id}`}</div>
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
    documentTitle: `Prescription-${rx.id}`,
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

export default function PatientPrescriptions() {
  const { data: prescriptions, isLoading } = useListPrescriptions();
  const [search, setSearch] = useState("");

  const filtered = prescriptions?.filter((rx) => {
    const term = search.toLowerCase();
    const diagnosis = rx.diagnosis?.toLowerCase() || "";
    const doctor = rx.doctorName?.toLowerCase() || "";
    return diagnosis.includes(term) || doctor.includes(term);
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading your prescriptions...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Pill className="h-8 w-8 text-blue-500" />
          My Prescriptions
        </h1>
        <p className="text-slate-400 mt-2">
          Access your digital medical prescriptions, drug instructions, and follow-up schedules.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search by diagnosis or doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
        />
      </div>

      {/* Main List */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Prescription History</CardTitle>
          <CardDescription className="text-slate-400">
            Total {filtered?.length || 0} prescriptions found.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="text-slate-350">
            <TableHeader className="bg-slate-950/40">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Date Issued</TableHead>
                <TableHead className="text-slate-400">Prescribed By</TableHead>
                <TableHead className="text-slate-400">Diagnosis</TableHead>
                <TableHead className="text-slate-400">Medicines</TableHead>
                <TableHead className="text-slate-400">Follow-up</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((rx) => {
                let meds: string[] = [];
                try {
                  meds = JSON.parse(rx.medicines);
                } catch {
                  meds = typeof rx.medicines === "string" ? [rx.medicines] : [];
                }

                return (
                  <TableRow key={rx.id} className="border-slate-800 hover:bg-slate-850/40">
                    <TableCell className="font-mono text-xs">
                      {new Date(rx.created_at || rx.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {rx.doctorName ? rx.doctorName[0] : "D"}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-none">{rx.doctorName || `Doctor #${rx.doctor_id}`}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{rx.doctorSpecialization || "General Medicine"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-white max-w-[180px] truncate">
                      {rx.diagnosis}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {meds.map((med, idx) => (
                          <span key={idx} className="bg-slate-800/80 border border-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-300">
                            {med}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {rx.follow_up_date || rx.followUpDate ? (
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(rx.follow_up_date || rx.followUpDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-white hover:bg-blue-600 border border-transparent hover:border-blue-500 gap-1.5 transition">
                            View <ChevronRight className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-white">Prescription Details</DialogTitle>
                          </DialogHeader>
                          <PrintablePrescriptionWrapper rx={rx} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!filtered || filtered.length === 0) && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <FileText className="h-8 w-8 text-slate-600" />
                      <p>No prescriptions found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

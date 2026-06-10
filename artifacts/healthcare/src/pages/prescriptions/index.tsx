import { useListPrescriptions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Pill, Calendar, Download } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "wouter";
import { useReactToPrint } from "react-to-print";

type Rx = ReturnType<typeof useListPrescriptions>["data"] extends Array<infer T> | undefined ? T : never;

function PrescriptionPrintable({ rx }: { rx: Rx }) {
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
          <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
            {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
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

      {rx.followUpDate && (
        <div style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
          <strong>Follow-up Date:</strong>{" "}
          {new Date(rx.followUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      )}

      <div style={{ borderTop: "1px dashed #ccc", paddingTop: 16, fontSize: 11, color: "#aaa", display: "flex", justifyContent: "space-between" }}>
        <span>This is a digitally generated prescription from HealthOS Platform.</span>
        <span>Rx #{rx.id}</span>
      </div>
    </div>
  );
}

function PrintButton({ rx }: { rx: Rx }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Rx-${rx.id}-${rx.patientName ?? "patient"}`,
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

export default function Prescriptions() {
  const [search, setSearch] = useState("");
  const { data: prescriptions, isLoading } = useListPrescriptions({});

  const filtered = prescriptions?.filter((rx) => {
    const s = search.toLowerCase();
    return !s ||
      rx.diagnosis.toLowerCase().includes(s) ||
      (rx.patientName ?? "").toLowerCase().includes(s) ||
      (rx.doctorName ?? "").toLowerCase().includes(s);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Vault</h1>
          <p className="text-muted-foreground mt-2">Centralized digital prescriptions and medication records.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diagnosis, patient or doctor..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading prescriptions...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Medicines</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead className="text-right">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((rx) => {
                    let medsCount = 0;
                    try { medsCount = JSON.parse(rx.medicines).length; } catch { medsCount = 1; }
                    return (
                      <TableRow key={rx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(rx.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/patients/${rx.patientId}`} className="hover:underline font-medium">
                            {rx.patientName || `Patient #${rx.patientId}`}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/doctors/${rx.doctorId}`} className="hover:underline text-muted-foreground">
                            {rx.doctorName || `Doctor #${rx.doctorId}`}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">{rx.diagnosis}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Pill className="h-3.5 w-3.5" />
                            {medsCount} {medsCount === 1 ? "medicine" : "medicines"}
                          </div>
                        </TableCell>
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
                              <PrintButton rx={rx} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!filtered || filtered.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No prescriptions found.
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

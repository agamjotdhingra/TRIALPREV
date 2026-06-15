import { useState, useEffect } from "react";
import { useListPatients, useCreateReport } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const REPORT_CATEGORIES = [
  "Blood Test",
  "Urine Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "ECG",
  "Ultrasound",
  "Biopsy",
  "Culture",
  "Lipid Profile",
  "Liver Function Test",
  "Kidney Function Test",
  "Thyroid Profile",
  "HbA1c",
  "Other",
];

export default function LabUploadReport() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: patients, isLoading: patientsLoading } = useListPatients();
  const createReportMutation = useCreateReport();

  // Extract from query params if coming from Search Patient page
  const searchParams = new URLSearchParams(window.location.search);
  const paramPatientId = searchParams.get("patientId") || "";

  const [form, setForm] = useState({
    patientId: paramPatientId,
    reportName: "",
    category: "",
    fileUrl: "",
    findings: "",
    isCritical: false,
    criticalNote: "",
  });

  useEffect(() => {
    if (paramPatientId) {
      setForm((f) => ({ ...f, patientId: paramPatientId }));
    }
  }, [paramPatientId]);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patientId || !form.reportName || !form.category) {
      toast({
        title: "Missing fields",
        description: "Patient, report name, and category are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReportMutation.mutateAsync({
        patientId: parseInt(form.patientId, 10),
        reportName: form.reportName,
        category: form.category,
        fileUrl: form.fileUrl.trim() || null,
        findings: form.findings.trim() || null,
        isCritical: form.isCritical,
        criticalNote: form.isCritical ? form.criticalNote.trim() : null,
      });

      toast({
        title: form.isCritical ? "⚠️ Critical report uploaded" : "Report uploaded successfully",
        description: `"${form.reportName}" has been submitted and the patient has been notified.`,
      });

      // Redirect to reports list
      setLocation("/lab/reports");
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Could not submit report.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Upload Lab Report</h1>
        <p className="text-slate-400 mt-2">Publish lab results, clinical values, and diagnostic attachments directly to a patient record.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-400" /> New Diagnostics Entry
          </CardTitle>
          <CardDescription className="text-slate-400">All fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Select */}
            <div className="space-y-2">
              <Label className="text-slate-300">Patient *</Label>
              {patientsLoading ? (
                <div className="text-sm text-slate-400">Loading patients...</div>
              ) : (
                <Select value={form.patientId} onValueChange={(v) => update("patientId", v)}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:ring-slate-700">
                    <SelectValue placeholder="Select patient..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    {patients?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="focus:bg-slate-850 hover:bg-slate-850">
                        {p.full_name} — {p.health_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Report Name */}
            <div className="space-y-2">
              <Label htmlFor="reportName" className="text-slate-300">Report Name *</Label>
              <Input
                id="reportName"
                placeholder="e.g. Complete Blood Count (CBC)"
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
                value={form.reportName}
                onChange={(e) => update("reportName", e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-slate-300">Category *</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:ring-slate-700">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-white">
                  {REPORT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="focus:bg-slate-850 hover:bg-slate-850">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Findings */}
            <div className="space-y-2">
              <Label htmlFor="findings" className="text-slate-300">Findings / Observations</Label>
              <Textarea
                id="findings"
                placeholder="Enter lab findings, observations, or abnormal test values..."
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
                rows={4}
                value={form.findings}
                onChange={(e) => update("findings", e.target.value)}
              />
            </div>

            {/* File URL */}
            <div className="space-y-2">
              <Label htmlFor="fileUrl" className="text-slate-300">Report File URL</Label>
              <Input
                id="fileUrl"
                placeholder="e.g. https://storage.example.com/report-file.pdf"
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
                value={form.fileUrl}
                onChange={(e) => update("fileUrl", e.target.value)}
              />
              <p className="text-xs text-slate-500">Optional — paste link to PDF or image attachment.</p>
            </div>

            {/* Critical Flag */}
            <div className="flex items-center justify-between rounded-xl border border-slate-850 p-4 bg-slate-950/40">
              <div className="space-y-0.5">
                <Label htmlFor="critical" className="font-semibold flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                  Mark as Critical
                </Label>
                <p className="text-xs text-slate-500">
                  Instantly flags this report and issues priority alerts to the patient and medical team.
                </p>
              </div>
              <Switch
                id="critical"
                checked={form.isCritical}
                onCheckedChange={(v: boolean) => update("isCritical", v)}
              />
            </div>

            {/* Critical Note */}
            {form.isCritical && (
              <div className="space-y-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <Label htmlFor="criticalNote" className="text-red-400 font-semibold">
                  Critical Note *
                </Label>
                <Textarea
                  id="criticalNote"
                  placeholder="Explain the critical diagnostic metrics (e.g. Hb < 7 g/dL) and immediate actions required..."
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-red-500 border-red-500/20"
                  rows={3}
                  value={form.criticalNote}
                  onChange={(e) => update("criticalNote", e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => setLocation("/lab/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReportMutation.isPending} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white border-none gap-2">
                {createReportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Submit Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

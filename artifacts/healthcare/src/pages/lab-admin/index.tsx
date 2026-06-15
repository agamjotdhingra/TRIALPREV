import { useState } from "react";
import { useListLabs, useListPatients, useListReports } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  FlaskConical,
  LogOut,
  Upload,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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

interface UploadForm {
  patientId: string;
  reportName: string;
  category: string;
  fileUrl: string;
  findings: string;
  isCritical: boolean;
  criticalNote: string;
}

const emptyForm: UploadForm = {
  patientId: "",
  reportName: "",
  category: "",
  fileUrl: "",
  findings: "",
  isCritical: false,
  criticalNote: "",
};

// ── Lab Selector ─────────────────────────────────────────────────────────────

function LabSelector({ onSelect }: { onSelect: (id: number, name: string) => void }) {
  const { data: labs, isLoading } = useListLabs({});

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-muted/30 p-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <FlaskConical className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lab Admin Portal</h1>
          <p className="text-muted-foreground text-sm">
            Select your laboratory to access the upload dashboard and manage patient reports.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {labs?.map((lab) => (
              <button
                key={lab.id}
                onClick={() => onSelect(lab.id, lab.name)}
                className="w-full flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{lab.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      Reg: {lab.registrationNumber} · {lab.mobile}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={
                      lab.verificationStatus === "approved"
                        ? "border-emerald-300 text-emerald-600"
                        : "border-yellow-300 text-yellow-600"
                    }
                  >
                    {lab.verificationStatus}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Upload Report Dialog ──────────────────────────────────────────────────────

function UploadDialog({
  labId,
  onSuccess,
}: {
  labId: number;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UploadForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { data: patients } = useListPatients({});
  const { toast } = useToast();

  function set<K extends keyof UploadForm>(key: K, value: UploadForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patientId || !form.reportName || !form.category) {
      toast({ title: "Missing fields", description: "Patient, report name, and category are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        patientId: parseInt(form.patientId),
        labId,
        reportName: form.reportName,
        category: form.category,
        isCritical: form.isCritical,
      };
      if (form.fileUrl.trim()) body.fileUrl = form.fileUrl.trim();
      if (form.findings.trim()) body.findings = form.findings.trim();
      if (form.isCritical && form.criticalNote.trim()) body.criticalNote = form.criticalNote.trim();

      const res = await fetch(`${BASE}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      toast({
        title: form.isCritical ? "⚠️ Critical report uploaded" : "Report uploaded successfully",
        description: `"${form.reportName}" has been submitted and notifications sent to relevant parties.`,
      });
      setForm(emptyForm);
      setOpen(false);
      onSuccess();
    } catch {
      toast({ title: "Upload failed", description: "Could not submit the report. Try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Upload New Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Lab Report
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Patient */}
          <div className="space-y-1.5">
            <Label htmlFor="patient">Patient *</Label>
            <Select value={form.patientId} onValueChange={(v) => set("patientId", v)}>
              <SelectTrigger id="patient">
                <SelectValue placeholder="Select patient…" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.fullName} — {p.healthId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Name */}
          <div className="space-y-1.5">
            <Label htmlFor="reportName">Report Name *</Label>
            <Input
              id="reportName"
              placeholder="e.g. Complete Blood Count (CBC)"
              value={form.reportName}
              onChange={(e) => set("reportName", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Category *</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Findings */}
          <div className="space-y-1.5">
            <Label htmlFor="findings">Findings / Observations</Label>
            <Textarea
              id="findings"
              placeholder="Enter lab findings, test values, and observations…"
              rows={4}
              value={form.findings}
              onChange={(e) => set("findings", e.target.value)}
            />
          </div>

          {/* File URL */}
          <div className="space-y-1.5">
            <Label htmlFor="fileUrl">Report File URL</Label>
            <Input
              id="fileUrl"
              placeholder="https://storage.example.com/report.pdf"
              value={form.fileUrl}
              onChange={(e) => set("fileUrl", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Optional — paste a link to the uploaded report PDF or image.</p>
          </div>

          {/* Critical Flag */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="critical" className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Mark as Critical
              </Label>
              <p className="text-xs text-muted-foreground">
                Notifies patient, admin, and all treating doctors immediately.
              </p>
            </div>
            <Switch
              id="critical"
              checked={form.isCritical}
              onCheckedChange={(v) => set("isCritical", v)}
            />
          </div>

          {/* Critical Note — only shown when flagged */}
          {form.isCritical && (
            <div className="space-y-1.5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-4">
              <Label htmlFor="criticalNote" className="text-red-700 dark:text-red-400">
                Critical Note *
              </Label>
              <Textarea
                id="criticalNote"
                placeholder="Describe the critical finding and recommended action…"
                rows={3}
                value={form.criticalNote}
                onChange={(e) => set("criticalNote", e.target.value)}
                className="border-red-200 focus-visible:ring-red-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1 gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {submitting ? "Uploading…" : "Upload Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Lab Admin Dashboard ───────────────────────────────────────────────────────

function LabDashboard({ labId, labName, onLogout }: { labId: number; labName: string; onLogout: () => void }) {
  const { data: reports, refetch, isLoading } = useListReports({ labId });
  const { data: patients } = useListPatients({});

  const total = reports?.length ?? 0;
  const critical = reports?.filter((r) => r.isCritical).length ?? 0;
  const today = new Date().toISOString().split("T")[0];
  const todayCount = reports?.filter((r) => r.createdAt?.startsWith(today)).length ?? 0;

  const sorted = [...(reports ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function getPatientName(id: number) {
    return patients?.find((p) => p.id === id)?.fullName ?? `Patient #${id}`;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{labName}</h1>
            <p className="text-muted-foreground text-sm">Lab Admin Portal — report management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UploadDialog labId={labId} onSuccess={() => refetch()} />
          <Button variant="outline" className="gap-2" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Switch Lab
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total Reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{todayCount}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{total - critical}</div>
                <div className="text-xs text-muted-foreground">Normal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>Reports uploaded by {labName}, most recent first.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">No reports uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Upload New Report" to get started.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.reportName}</TableCell>
                    <TableCell>
                      <div className="text-sm">{r.patientName ?? getPatientName(r.patientId)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{r.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-sm text-muted-foreground truncate block">
                        {r.findings ? (r.findings.length > 60 ? r.findings.substring(0, 60) + "…" : r.findings) : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.isCritical ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" /> Critical
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" /> Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {r.fileUrl ? (
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────

export default function LabAdmin() {
  const [activeLab, setActiveLab] = useState<{ id: number; name: string } | null>(null);

  if (!activeLab) {
    return <LabSelector onSelect={(id, name) => setActiveLab({ id, name })} />;
  }

  return (
    <LabDashboard
      labId={activeLab.id}
      labName={activeLab.name}
      onLogout={() => setActiveLab(null)}
    />
  );
}

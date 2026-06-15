import { useState } from "react";
import { useListReports } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Search, Download, AlertTriangle, CheckCircle, ExternalLink, Calendar, Database } from "lucide-react";

export default function PatientReports() {
  const { data: reports, isLoading } = useListReports();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = reports?.filter((report) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (report.report_name || report.reportName || "").toLowerCase().includes(term) ||
      (report.labName || "").toLowerCase().includes(term) ||
      (report.category || "").toLowerCase().includes(term);

    const matchesCategory = categoryFilter === "All" || report.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Unique categories for filtering
  const categories = ["All", ...Array.from(new Set(reports?.map((r) => r.category).filter(Boolean) || []))];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading your lab reports...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Database className="h-8 w-8 text-blue-500" />
          My Lab Reports
        </h1>
        <p className="text-slate-400 mt-2">
          View your diagnostic laboratory observations, blood work, scan results, and clinical findings.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by report name, laboratory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full border-slate-800 ${
                categoryFilter === cat
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white bg-slate-900"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports Grid/Table */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Diagnostic Reports</CardTitle>
          <CardDescription className="text-slate-400">
            Total {filtered?.length || 0} reports matching filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="text-slate-350">
            <TableHeader className="bg-slate-950/40">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Date Uploaded</TableHead>
                <TableHead className="text-slate-400">Report Name</TableHead>
                <TableHead className="text-slate-400">Laboratory</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((report) => {
                const isCritical = report.is_critical || report.isCritical;
                return (
                  <TableRow
                    key={report.id}
                    className={`border-slate-800 hover:bg-slate-850/40 ${
                      isCritical ? "bg-red-500/5 hover:bg-red-500/10" : ""
                    }`}
                  >
                    <TableCell className="font-mono text-xs">
                      {new Date(report.created_at || report.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <FileText className={`h-5 w-5 shrink-0 ${isCritical ? "text-red-400" : "text-slate-400"}`} />
                        <span className="font-semibold text-white">{report.report_name || report.reportName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-450">
                      {report.labName || `Laboratory #${report.lab_id}`}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 border-slate-700 text-slate-300 text-[10px] rounded-full uppercase tracking-wider">
                        {report.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isCritical ? (
                        <Badge className="bg-red-950/40 text-red-400 border border-red-500/20 gap-1 rounded-full text-xs">
                          <AlertTriangle className="h-3 w-3" /> Critical
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 gap-1 rounded-full text-xs">
                          <CheckCircle className="h-3 w-3" /> Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-white hover:bg-blue-600 border border-transparent hover:border-blue-500 gap-1 transition"
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-white flex items-center gap-2">
                              {report.report_name || report.reportName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4 text-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                              <span className="text-slate-400">Date:</span>
                              <span className="font-medium">
                                {new Date(report.created_at || report.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                              <span className="text-slate-400">Category:</span>
                              <span className="font-medium">{report.category}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                              <span className="text-slate-400">Facility:</span>
                              <span className="font-medium">
                                {report.labName || `Laboratory #${report.lab_id}`}
                              </span>
                            </div>

                            {/* Status */}
                            <div>
                              <span className="text-slate-400 block mb-1">Status:</span>
                              {isCritical ? (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-red-400 space-y-1">
                                  <div className="font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                                    <AlertTriangle className="h-4 w-4" /> CRITICAL FINDING REPORTED
                                  </div>
                                  {report.critical_note || report.criticalNote ? (
                                    <p className="text-slate-300 text-xs mt-1">
                                      {report.critical_note || report.criticalNote}
                                    </p>
                                  ) : (
                                    <p className="text-slate-300 text-xs mt-1">
                                      Please contact your primary care physician immediately to review these results.
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-450">
                                  <div className="font-semibold flex items-center gap-1 text-xs uppercase tracking-wider">
                                    <CheckCircle className="h-4 w-4" /> NORMAL RANGE
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Findings */}
                            {report.findings && (
                              <div>
                                <span className="text-slate-400 block mb-1">Observations / Findings:</span>
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                                  {report.findings}
                                </div>
                              </div>
                            )}

                            {/* File Download */}
                            {report.file_url || report.fileUrl ? (
                              <Button
                                asChild
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none gap-2 font-semibold"
                              >
                                <a
                                  href={report.file_url || report.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center"
                                >
                                  <ExternalLink className="h-4 w-4" /> View Lab Attachment
                                </a>
                              </Button>
                            ) : (
                              <div className="text-xs text-center text-slate-500">
                                No physical file attachment provided by laboratory.
                              </div>
                            )}
                          </div>
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
                      <p>No reports found matching criteria.</p>
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

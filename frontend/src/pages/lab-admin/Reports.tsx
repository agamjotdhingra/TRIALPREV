import { useListReports } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { useState } from "react";

export default function LabReports() {
  const [search, setSearch] = useState("");
  const { data: reports, isLoading } = useListReports();

  const filtered = reports?.filter(
    (r) =>
      r.report_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Diagnostics Archive</h1>
        <p className="text-slate-400 mt-2">Historical database of all reports uploaded by this laboratory.</p>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by report name, category or patient..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading diagnostics records...</div>
          ) : !filtered || filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <FileText className="h-10 w-10 text-slate-650" />
              <p className="font-medium">No reports match your filters.</p>
            </div>
          ) : (
            <Table className="text-slate-300">
              <TableHeader className="bg-slate-800/40 border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Report Name</TableHead>
                  <TableHead className="text-slate-400">Patient</TableHead>
                  <TableHead className="text-slate-400">Category</TableHead>
                  <TableHead className="text-slate-400">Findings</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Upload Date</TableHead>
                  <TableHead className="text-slate-400 text-right">File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className={`border-slate-800 hover:bg-slate-800/20 ${r.is_critical || r.isCritical ? "bg-red-500/5 hover:bg-red-500/10" : ""}`}>
                    <TableCell className="font-semibold text-white">{r.report_name || r.reportName}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{r.patientName}</div>
                        <div className="text-xs text-slate-400 font-mono">{r.patientHealthId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-350">{r.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <span className="text-xs text-slate-400 block truncate" title={r.findings}>
                        {r.findings || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.is_critical || r.isCritical ? (
                        <Badge className="bg-red-950/40 text-red-400 border border-red-500/20 gap-1 text-xs rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Critical
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 gap-1 text-xs rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(r.created_at || r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.file_url || r.fileUrl ? (
                        <a
                          href={r.file_url || r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center justify-end gap-1"
                        >
                          <Download className="h-3.5 w-3.5" /> View File
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
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

import { useListReports } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertTriangle, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Reports() {
  const [search, setSearch] = useState("");
  const { data: reports, isLoading } = useListReports({});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Reports</h1>
          <p className="text-muted-foreground mt-2">Diagnostic results and clinical findings.</p>
        </div>
        <Button className="gap-2">Upload Report</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient or report..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Laboratory</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports?.map((report) => (
                    <TableRow key={report.id} className={report.isCritical ? "bg-red-50 dark:bg-red-950/20" : ""}>
                      <TableCell className="text-sm">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {report.reportName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/patients/${report.patientId}`} className="hover:underline font-medium">
                          {report.patientName || `Patient #${report.patientId}`}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {report.labName || `Lab #${report.labId}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase bg-background">
                          {report.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.isCritical ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 gap-1 border-red-200 dark:border-red-800/50">
                            <AlertTriangle className="h-3 w-3" /> Critical
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {report.fileUrl && (
                            <Button variant="ghost" size="icon" title="Download File">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" title="View Details">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!reports || reports.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No lab reports found.
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
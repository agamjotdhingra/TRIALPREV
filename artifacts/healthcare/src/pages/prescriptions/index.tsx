import { useListPrescriptions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Pill, Calendar, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Prescriptions() {
  const [search, setSearch] = useState("");
  const { data: prescriptions, isLoading } = useListPrescriptions({});

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Vault</h1>
          <p className="text-muted-foreground mt-2">Centralized digital prescriptions and medication records.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search diagnosis or patient..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions?.map((rx) => {
                    let medsCount = 0;
                    try {
                      medsCount = JSON.parse(rx.medicines).length;
                    } catch {
                      medsCount = 1;
                    }

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
                            Dr. {rx.doctorName || `Doctor #${rx.doctorId}`}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {rx.diagnosis}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Pill className="h-3.5 w-3.5" />
                            {medsCount} {medsCount === 1 ? 'medicine' : 'medicines'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" title="Download PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!prescriptions || prescriptions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
import { useListStaff } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, UserCircle, Phone } from "lucide-react";
import { useState } from "react";

export function RoleBadge({ role }: { role: string }) {
  const r = role.toLowerCase();
  let colorClass = "bg-muted text-muted-foreground";
  
  if (r === "nurse") colorClass = "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
  if (r === "technician") colorClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
  if (r === "ward-assistant") colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (r === "receptionist") colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  if (r === "admin") colorClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize`}>{role.replace("-", " ")}</Badge>;
}

export default function Staff() {
  const [search, setSearch] = useState("");
  const { data: staff, isLoading } = useListStaff({});

  const filteredStaff = staff?.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()) || s.employeeId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Registry</h1>
          <p className="text-muted-foreground mt-2">Manage hospital personnel and shift assignments.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name or ID..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading staff records...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff?.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{member.fullName}</div>
                            <div className="text-xs text-muted-foreground">{member.qualification}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{member.employeeId}</TableCell>
                      <TableCell>
                        <RoleBadge role={member.role} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {member.mobile}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm capitalize">{member.assignedShift || "Unassigned"}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredStaff || filteredStaff.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No staff members found.
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
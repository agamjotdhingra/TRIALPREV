import { useParams, Link } from "wouter";
import { useGetDoctor, useGetDoctorStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users, Calendar, Clock, AlertCircle, FileText } from "lucide-react";
import { VerificationBadge } from "./index";

export default function DoctorProfile() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");

  const { data: doctor, isLoading: doctorLoading } = useGetDoctor(id, { query: { enabled: !!id, queryKey: ["doctor", id] }});
  const { data: stats, isLoading: statsLoading } = useGetDoctorStats(id, { query: { enabled: !!id, queryKey: ["doctor-stats", id] }});

  if (doctorLoading || statsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading doctor profile...</div>;
  }

  if (!doctor) {
    return <div className="p-8 text-center text-red-500">Doctor not found</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/doctors">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{doctor.fullName}</h1>
              <VerificationBadge status={doctor.verificationStatus} />
            </div>
            <p className="text-muted-foreground font-medium mt-1">{doctor.specialization} • {doctor.yearsOfExperience} yrs experience</p>
          </div>
          <Link href={`/doctors/${id}/queue`}>
            <Button>View Smart Queue</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Email</div>
                <div className="font-medium">{doctor.email}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Mobile</div>
                <div className="font-medium">{doctor.mobile}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">License No.</div>
                <div className="font-medium">{doctor.licenseNumber || "N/A"}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Valid Until</div>
                <div className="font-medium">{doctor.licenseValidUntil ? new Date(doctor.licenseValidUntil).toLocaleDateString() : "N/A"}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Consultation Fees</div>
                <div className="font-medium">{doctor.consultationFees ? `$${doctor.consultationFees}` : "N/A"}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                  <div className="text-xs text-muted-foreground text-center">Total Patients</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
                  <div className="text-xs text-muted-foreground text-center">Today's Appointments</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div className="text-2xl font-bold">{stats?.pendingAppointments || 0}</div>
                  <div className="text-xs text-muted-foreground text-center">Pending Appointments</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div className="text-2xl font-bold">{stats?.criticalPatients || 0}</div>
                  <div className="text-xs text-muted-foreground text-center">Critical Patients</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Professional Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {doctor.bio || "No biography provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{doctor.qualification}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useGetPatientByHealthId } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, ArrowRight, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { RiskBadge } from "@/components/SharedHelpers";

export default function LabSearchPatient() {
  const [, setLocation] = useLocation();
  const [healthId, setHealthId] = useState("");
  const [queryId, setQueryId] = useState("");

  const { data: patient, isLoading, error } = useGetPatientByHealthId(queryId);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (healthId.trim()) {
      setQueryId(healthId.trim());
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Search Patient</h1>
        <p className="text-slate-400 mt-2">Find a patient's profile by entering their unique Health ID before uploading lab results.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Enter Health ID (e.g. HOS-XXXXXX)..."
                className="pl-10 bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700 h-11"
                value={healthId}
                onChange={(e) => setHealthId(e.target.value)}
              />
            </div>
            <Button id="search-btn" type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white border-none px-6 h-11">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && <div className="text-center text-slate-400">Searching...</div>}

      {queryId && !isLoading && !patient && (
        <Card className="bg-slate-900 border-slate-800 text-white p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <div>
            <p className="font-semibold text-white">Patient Not Found</p>
            <p className="text-sm text-slate-450 mt-1">Please double check the Health ID and try again.</p>
          </div>
        </Card>
      )}

      {patient && (
        <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" /> Patient Match Found
            </CardTitle>
            <CardDescription className="text-slate-400">EHR identification verified.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-sm text-slate-300">
              <div>
                <p className="text-slate-500 mb-1">Full Name</p>
                <p className="font-semibold text-white text-base">{patient.full_name}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Health ID</p>
                <p className="font-mono font-semibold text-white text-base">{patient.health_id}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Age / Gender</p>
                <p className="font-medium text-white">{patient.age ? `${patient.age} yrs` : "—"} / {patient.gender}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Blood Group</p>
                <p className="font-medium text-white">{patient.blood_group || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Mobile</p>
                <p className="font-medium text-white">{patient.mobile}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Health Risk Level</p>
                <div className="mt-1">
                  <RiskBadge level={patient.risk_level} />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <Button
                id="proceed-upload"
                onClick={() => setLocation(`/lab/upload?patientId=${patient.id}&patientName=${encodeURIComponent(patient.full_name)}`)}
                className="bg-blue-600 hover:bg-blue-500 text-white border-none gap-2"
              >
                Proceed to Upload Report <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

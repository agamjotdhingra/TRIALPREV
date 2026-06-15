import { useListHospitals } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, Building2, Bed as BedIcon } from "lucide-react";
import { useState } from "react";

export default function AdminHospitals() {
  const [search, setSearch] = useState("");
  const { data: hospitals, isLoading } = useListHospitals();

  const filteredHospitals = hospitals?.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.registration_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Hospital Network</h1>
          <p className="text-slate-400 mt-2">Manage affiliated hospitals and bed capacities.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search hospitals..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading hospitals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHospitals?.map((hospital) => (
            <Card key={hospital.id} className="flex flex-col bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight text-white font-semibold">{hospital.name}</CardTitle>
                      <CardDescription className="font-mono text-xs mt-1 text-slate-400">ID: {hospital.registration_number}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2 text-sm text-slate-305">
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{hospital.address || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{hospital.mobile || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <BedIcon className="h-4 w-4 shrink-0" />
                    <span>{hospital.total_beds || 0} Total Beds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredHospitals?.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/50 rounded-lg border border-dashed border-slate-800">
              No hospitals match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

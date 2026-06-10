import { useListHospitals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MapPin, Phone, Building2, Bed as BedIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Hospitals() {
  const [search, setSearch] = useState("");
  const { data: hospitals, isLoading } = useListHospitals();

  const filteredHospitals = hospitals?.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.registrationNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Network</h1>
          <p className="text-muted-foreground mt-2">Manage affiliated hospitals and bed capacities.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Hospital
        </Button>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hospitals..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading hospitals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHospitals?.map((hospital) => (
            <Card key={hospital.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">{hospital.name}</CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">ID: {hospital.registrationNumber}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{hospital.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BedIcon className="h-4 w-4 shrink-0" />
                    <span>{hospital.totalBeds || 0} Total Beds</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-end">
                  <Link href={`/hospitals/${hospital.id}`}>
                    <Button variant="outline" size="sm">Command Center</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredHospitals?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              No hospitals match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
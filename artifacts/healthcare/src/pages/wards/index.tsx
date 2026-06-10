import { useListWards, useListHospitals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, LayoutGrid } from "lucide-react";
import { useState } from "react";

export default function Wards() {
  const [search, setSearch] = useState("");
  const [hospitalId, setHospitalId] = useState<string>("all");
  
  const { data: wards, isLoading } = useListWards({ 
    hospitalId: hospitalId !== "all" ? parseInt(hospitalId) : undefined 
  });
  const { data: hospitals } = useListHospitals();

  const filteredWards = wards?.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.wardType.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ward Management</h1>
          <p className="text-muted-foreground mt-2">Monitor capacity and bed utilization.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Ward
        </Button>
      </div>

      <div className="flex items-center gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search wards..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[250px]">
          <Select value={hospitalId} onValueChange={setHospitalId}>
            <SelectTrigger>
              <SelectValue placeholder="All Hospitals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              {hospitals?.map(h => (
                <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading wards...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWards?.map((ward) => {
            const occupancyRate = (ward.occupiedBeds / ward.totalBeds) * 100;
            let barColor = "bg-emerald-500";
            if (occupancyRate >= 90) barColor = "bg-red-500";
            else if (occupancyRate >= 75) barColor = "bg-orange-500";
            
            return (
              <Card key={ward.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{ward.name}</CardTitle>
                      <CardDescription className="uppercase mt-1 text-[10px] tracking-wider font-bold">{ward.wardType}</CardDescription>
                    </div>
                    <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-medium">{ward.occupiedBeds} / {ward.totalBeds} Beds</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} transition-all`} style={{ width: `${occupancyRate}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{ward.availableBeds} Available</span>
                      <span>{occupancyRate.toFixed(0)}% Full</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredWards?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              No wards match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
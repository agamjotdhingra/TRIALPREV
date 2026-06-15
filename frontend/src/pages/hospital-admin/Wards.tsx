import { useListWards, useCreateWard } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, LayoutGrid, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function HospitalWards() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: wards, isLoading, refetch } = useListWards();
  const createWardMutation = useCreateWard();

  const [form, setForm] = useState({
    name: "",
    wardType: "General",
    totalBeds: "10",
  });

  const filteredWards = wards?.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.ward_type?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddWard(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      await createWardMutation.mutateAsync({
        name: form.name.trim(),
        ward_type: form.wardType,
        total_beds: parseInt(form.totalBeds, 10),
      });

      toast({ title: "Success", description: `Ward "${form.name}" has been created.` });
      setForm({ name: "", wardType: "General", totalBeds: "10" });
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Failed to create ward", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Ward Management</h1>
          <p className="text-slate-400 mt-2">Monitor capacity, configure bed spaces, and track department utilization.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="add-ward-trigger" className="bg-violet-650 hover:bg-violet-600 text-white border-none gap-2">
              <Plus className="h-4 w-4" /> Add Ward
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create Hospital Ward</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddWard} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="wardName" className="text-slate-350">Ward Name *</Label>
                <Input
                  id="wardName"
                  required
                  placeholder="e.g. ICU Wing A"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="wardType" className="text-slate-350">Ward Type / Specialization</Label>
                <Input
                  id="wardType"
                  placeholder="e.g. ICU, General, Pediatrics"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.wardType}
                  onChange={(e) => setForm((f) => ({ ...f, wardType: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="totalBeds" className="text-slate-350">Initial Bed Capacity</Label>
                <Input
                  id="totalBeds"
                  type="number"
                  min="1"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.totalBeds}
                  onChange={(e) => setForm((f) => ({ ...f, totalBeds: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createWardMutation.isPending} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
                  {createWardMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search wards by name or type..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading wards...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWards?.map((ward) => {
            const total = ward.total_beds || 0;
            const occ = ward.occupied_beds || 0;
            const rate = total ? (occ / total) * 100 : 0;
            const available = total - occ;

            let barColor = "bg-emerald-500";
            if (rate >= 90) barColor = "bg-red-500";
            else if (rate >= 75) barColor = "bg-orange-500";

            return (
              <Card key={ward.id} className="bg-slate-900 border-slate-800 text-white">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-white">{ward.name}</CardTitle>
                      <CardDescription className="uppercase mt-1 text-[10px] tracking-wider font-bold text-slate-400">
                        {ward.ward_type || "General"}
                      </CardDescription>
                    </div>
                    <LayoutGrid className="h-5 w-5 text-slate-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span className="text-slate-400">Occupancy</span>
                      <span className="font-semibold text-white">{occ} / {total} Beds</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} transition-all`} style={{ width: `${rate}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{available} Available</span>
                      <span>{rate.toFixed(0)}% Full</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredWards?.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/50 rounded-lg border border-dashed border-slate-800">
              No wards match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

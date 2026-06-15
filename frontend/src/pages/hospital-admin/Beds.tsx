import { useListBeds, useListWards, useCreateBed } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Bed, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/api/supabase";

export default function HospitalBeds() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const { data: beds, isLoading, refetch } = useListBeds();
  const { data: wards } = useListWards();
  const createBedMutation = useCreateBed();

  useEffect(() => {
    const channel = supabase
      .channel("beds-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "beds" },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const [form, setForm] = useState({
    wardId: "",
    bedNumber: "",
    roomNumber: "",
  });

  const filteredBeds = beds?.filter((b) => {
    const matchesSearch =
      b.bed_number.toLowerCase().includes(search.toLowerCase()) ||
      b.room_number?.toLowerCase().includes(search.toLowerCase());
    const matchesWard = wardFilter === "all" || String(b.ward_id) === wardFilter;
    return matchesSearch && matchesWard;
  });

  async function handleAddBed(e: React.FormEvent) {
    e.preventDefault();
    if (!form.wardId || !form.bedNumber) {
      toast({ title: "Missing fields", description: "Ward and Bed Number are required.", variant: "destructive" });
      return;
    }

    try {
      await createBedMutation.mutateAsync({
        ward_id: parseInt(form.wardId, 10),
        bed_number: form.bedNumber.trim(),
        room_number: form.roomNumber.trim() || null,
        status: "available",
      });

      toast({ title: "Success", description: `Bed ${form.bedNumber} has been added.` });
      setForm({ wardId: "", bedNumber: "", roomNumber: "" });
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Failed to add bed", description: err.message, variant: "destructive" });
    }
  }

  function getStatusBadge(status: string) {
    const s = status.toLowerCase();
    let cls = "bg-slate-800 text-slate-400";
    if (s === "available") cls = "bg-emerald-950/40 text-emerald-450 border border-emerald-500/20";
    if (s === "occupied") cls = "bg-red-950/40 text-red-400 border border-red-500/20";
    if (s === "maintenance") cls = "bg-amber-950/40 text-amber-400 border border-amber-500/20";
    return <Badge className={`${cls} hover:${cls} capitalize rounded-full px-2`}>{status}</Badge>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Bed Roster</h1>
          <p className="text-slate-400 mt-2">Allocate, manage, and audit inpatient bed states.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="add-bed-trigger" className="bg-violet-650 hover:bg-violet-600 text-white border-none gap-2">
              <Plus className="h-4 w-4" /> Add Bed
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add Patient Bed</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBed} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-slate-350">Assign to Ward *</Label>
                <Select value={form.wardId} onValueChange={(v) => setForm((f) => ({ ...f, wardId: v }))}>
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue placeholder="Select ward..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-850 text-white">
                    {wards?.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)} className="focus:bg-slate-800">
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="bedNumber" className="text-slate-350">Bed Number / Code *</Label>
                <Input
                  id="bedNumber"
                  required
                  placeholder="e.g. Bed-101"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.bedNumber}
                  onChange={(e) => setForm((f) => ({ ...f, bedNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="roomNumber" className="text-slate-350">Room Number</Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g. Room 302"
                  className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                  value={form.roomNumber}
                  onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBedMutation.isPending} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
                  {createBedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by bed or room number..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select value={wardFilter} onValueChange={setWardFilter}>
            <SelectTrigger className="bg-slate-905 border-slate-800 text-white focus:ring-slate-700">
              <SelectValue placeholder="All Wards" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-white">
              <SelectItem value="all" className="focus:bg-slate-800">All Wards</SelectItem>
              {wards?.map((w) => (
                <SelectItem key={w.id} value={String(w.id)} className="focus:bg-slate-800">
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading beds...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredBeds?.map((bed) => (
            <Card key={bed.id} className="bg-slate-900 border-slate-800 text-white flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                <div className="h-9 w-9 rounded-lg bg-slate-805 flex items-center justify-center text-slate-400 shrink-0">
                  <Bed className="h-5 w-5" />
                </div>
                {getStatusBadge(bed.status)}
              </div>
              <div className="mt-4">
                <p className="font-bold text-white text-lg">{bed.bed_number}</p>
                <p className="text-xs text-slate-400 mt-1">Room: {bed.room_number || "—"}</p>
                <p className="text-[10px] text-violet-400 uppercase font-semibold tracking-wider mt-2 truncate">
                  {bed.wards?.name || `Ward #${bed.ward_id}`}
                </p>
              </div>
            </Card>
          ))}
          {filteredBeds?.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/50 rounded-lg border border-dashed border-slate-800">
              No beds found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

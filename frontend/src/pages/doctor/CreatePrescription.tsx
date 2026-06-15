import { useState } from "react";
import { useListPatients, useCreatePrescription } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pill, Plus, Trash2, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function CreatePrescription() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: patients, isLoading: patientsLoading } = useListPatients();
  const createPrescriptionMutation = useCreatePrescription();

  // Extract from query params if coming from Patient EHR page
  const searchParams = new URLSearchParams(window.location.search);
  const paramPatientId = searchParams.get("patientId") || "";

  const [patientId, setPatientId] = useState(paramPatientId);
  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medicines, setMedicines] = useState<string[]>([""]);

  function handleAddMedicine() {
    setMedicines([...medicines, ""]);
  }

  function handleRemoveMedicine(index: number) {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  }

  function handleMedicineChange(index: number, val: string) {
    const updated = [...medicines];
    updated[index] = val;
    setMedicines(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !diagnosis) {
      toast({ title: "Validation Error", description: "Patient and Diagnosis are required.", variant: "destructive" });
      return;
    }

    const filteredMeds = medicines.filter((m) => m.trim() !== "");
    if (filteredMeds.length === 0) {
      toast({ title: "Validation Error", description: "At least one medicine must be prescribed.", variant: "destructive" });
      return;
    }

    try {
      await createPrescriptionMutation.mutateAsync({
        patientId: parseInt(patientId, 10),
        diagnosis: diagnosis.trim(),
        medicines: filteredMeds,
        instructions: instructions.trim() || null,
        followUpDate: followUpDate || null,
      });

      toast({ title: "Prescription Created", description: "Digital prescription saved successfully." });
      setLocation("/doctor/dashboard");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Prescription</h1>
        <p className="text-slate-400 mt-2">Write a digital prescription, add medications, and schedule follow-ups.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Pill className="h-5 w-5 text-emerald-400" /> Digital Prescription Form
          </CardTitle>
          <CardDescription className="text-slate-400">All prescribed items will be registered under the patient's EHR.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Select */}
            <div className="space-y-2">
              <Label className="text-slate-350">Select Patient *</Label>
              {patientsLoading ? (
                <div className="text-sm text-slate-400">Loading patients...</div>
              ) : (
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger className="bg-slate-950 border-slate-850 text-white">
                    <SelectValue placeholder="Select patient..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-850 text-white">
                    {patients?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="focus:bg-slate-800">
                        {p.full_name} — {p.health_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-slate-350">Diagnosis *</Label>
              <Input
                id="diagnosis"
                required
                placeholder="e.g. Hypertension, Viral Fever"
                className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            {/* Medicines List */}
            <div className="space-y-3">
              <Label className="text-slate-350">Prescribed Medications *</Label>
              {medicines.map((med, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    required
                    placeholder={`e.g. Paracetamol 500mg - Twice a day (after food) - ${index === 0 ? "1st item" : `${index + 1}th item`}`}
                    className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                    value={med}
                    onChange={(e) => handleMedicineChange(index, e.target.value)}
                  />
                  {medicines.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-slate-800 text-red-400 hover:text-red-300 hover:bg-slate-800 shrink-0"
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="border-slate-800 text-slate-300 hover:text-white mt-1 gap-2 border-dashed"
                onClick={handleAddMedicine}
              >
                <Plus className="h-4 w-4" /> Add Medication Row
              </Button>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-slate-350">Special Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="e.g. Avoid cold drinks, take bed rest for 3 days..."
                className="bg-slate-950 border-slate-850 text-white placeholder-slate-500"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Follow Up Date */}
            <div className="space-y-2">
              <Label htmlFor="followUpDate" className="text-slate-350">Follow-Up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                className="bg-slate-950 border-slate-850 text-white"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:text-white" onClick={() => setLocation("/doctor/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPrescriptionMutation.isPending} className="flex-1 bg-emerald-650 hover:bg-emerald-600 text-white border-none gap-2">
                {createPrescriptionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Prescription
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

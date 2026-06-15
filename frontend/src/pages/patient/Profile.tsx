import { useState, useEffect } from "react";
import { useGetPatientMe, useUpdatePatientMe } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RiskBadge } from "@/components/SharedHelpers";
import { User, Activity, Heart, ShieldCheck, Loader2 } from "lucide-react";

export default function PatientProfile() {
  const { toast } = useToast();
  const { data: patient, isLoading } = useGetPatientMe();
  const updateMutation = useUpdatePatientMe();

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    height: 0,
    weight: 0,
    smoking_status: "no",
    alcohol_consumption: "no",
    lifestyle_info: "",
    existing_diseases: "",
    chronic_diseases: "",
    allergies: "",
    current_medications: "",
    family_medical_history: "",
    surgeries: "",
    vaccinations: "",
    previous_conditions: "",
  });

  useEffect(() => {
    if (patient) {
      setForm({
        full_name: patient.full_name || "",
        mobile: patient.mobile || "",
        date_of_birth: patient.date_of_birth ? patient.date_of_birth.substring(0, 10) : "",
        gender: patient.gender || "",
        blood_group: patient.blood_group || "",
        height: patient.height || 0,
        weight: patient.weight || 0,
        smoking_status: patient.smoking_status || "no",
        alcohol_consumption: patient.alcohol_consumption || "no",
        lifestyle_info: patient.lifestyle_info || "",
        existing_diseases: patient.existing_diseases || "",
        chronic_diseases: patient.chronic_diseases || "",
        allergies: patient.allergies || "",
        current_medications: patient.current_medications || "",
        family_medical_history: patient.family_medical_history || "",
        surgeries: patient.surgeries || "",
        vaccinations: patient.vaccinations || "",
        previous_conditions: patient.previous_conditions || "",
      });
    }
  }, [patient]);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        ...form,
        height: Number(form.height),
        weight: Number(form.weight),
      });

      toast({
        title: "Profile updated",
        description: "Your health records and vital details have been saved.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update profile records.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading your profile...</div>;
  }

  const healthScore = patient?.health_score ?? 0;
  const scoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-450";
    if (s >= 60) return "text-yellow-450";
    if (s >= 40) return "text-orange-400";
    return "text-red-400";
  };
  const ringColor = (s: number) => {
    if (s >= 80) return "border-emerald-500/20";
    if (s >= 60) return "border-yellow-500/20";
    if (s >= 40) return "border-orange-500/20";
    return "border-red-500/20";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="h-8 w-8 text-blue-500" />
          My Profile
        </h1>
        <p className="text-slate-400 mt-2">
          View your demographics, update health metrics, and compile clinical history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Health score & status */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-white flex flex-col items-center justify-center p-6 text-center">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Health Status Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 p-0 w-full">
              <div className={`relative flex items-center justify-center w-36 h-36 rounded-full border-[10px] ${ringColor(healthScore)}`}>
                <div className={`text-5xl font-black ${scoreColor(healthScore)}`}>{healthScore}</div>
              </div>
              <div className="space-y-1 mt-2">
                <RiskBadge level={patient?.risk_level} />
                <p className="text-sm font-semibold mt-3 text-white">{patient?.full_name}</p>
                <p className="text-xs text-slate-500 font-mono">ID: {patient?.health_id}</p>
                <p className="text-xs text-slate-500 font-mono">Email: {patient?.email}</p>
              </div>

              <div className="w-full border-t border-slate-850 pt-4 mt-2 grid grid-cols-2 gap-3 text-xs text-left">
                <div>
                  <span className="text-slate-500 block">BMI</span>
                  <span className="font-semibold text-slate-300 text-sm">{patient?.bmi?.toFixed(1) || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blood Group</span>
                  <span className="font-semibold text-slate-300 text-sm">{patient?.blood_group || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Height</span>
                  <span className="font-semibold text-slate-300 text-sm">{patient?.height ? `${patient.height} cm` : "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Weight</span>
                  <span className="font-semibold text-slate-300 text-sm">{patient?.weight ? `${patient.weight} kg` : "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white p-4 text-xs text-slate-450 space-y-2">
            <div className="flex gap-2 items-start">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p>Your records are encrypted and compliant with medical data standards. Only doctors with active appointments or verified lab technicians can view details of your history.</p>
            </div>
          </Card>
        </div>

        {/* Right Card: Tabs Form */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="bg-slate-950 border-slate-850 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="personal" className="gap-2 text-slate-450 data-[state=active]:text-white">
                      <User className="w-4 h-4" /> Personal
                    </TabsTrigger>
                    <TabsTrigger value="vitals" className="gap-2 text-slate-450 data-[state=active]:text-white">
                      <Activity className="w-4 h-4" /> Vitals & Lifestyle
                    </TabsTrigger>
                    <TabsTrigger value="medical" className="gap-2 text-slate-450 data-[state=active]:text-white">
                      <Heart className="w-4 h-4" /> Medical History
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Tab */}
                  <TabsContent value="personal" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-slate-300">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={form.full_name}
                          onChange={(e) => update("full_name", e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-slate-300">Mobile Number *</Label>
                        <Input
                          id="mobile"
                          value={form.mobile}
                          onChange={(e) => update("mobile", e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth" className="text-slate-300">Date of Birth *</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={form.date_of_birth}
                          onChange={(e) => update("date_of_birth", e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-slate-300">Gender *</Label>
                        <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                          <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:ring-slate-700">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 text-white">
                            <SelectItem value="male" className="focus:bg-slate-850 hover:bg-slate-850">Male</SelectItem>
                            <SelectItem value="female" className="focus:bg-slate-850 hover:bg-slate-850">Female</SelectItem>
                            <SelectItem value="other" className="focus:bg-slate-850 hover:bg-slate-850">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blood_group" className="text-slate-300">Blood Group</Label>
                        <Select value={form.blood_group} onValueChange={(v) => update("blood_group", v)}>
                          <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:ring-slate-700">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 text-white">
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                              <SelectItem key={g} value={g} className="focus:bg-slate-850 hover:bg-slate-850">{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Vitals & Lifestyle Tab */}
                  <TabsContent value="vitals" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-slate-300">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.1"
                          value={form.height || ""}
                          onChange={(e) => update("height", Number(e.target.value))}
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-slate-300">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={form.weight || ""}
                          onChange={(e) => update("weight", Number(e.target.value))}
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smoking_status" className="text-slate-300">Smoking Status</Label>
                        <Select value={form.smoking_status} onValueChange={(v) => update("smoking_status", v)}>
                          <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:ring-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 text-white">
                            <SelectItem value="no" className="focus:bg-slate-850 hover:bg-slate-850">Non-Smoker</SelectItem>
                            <SelectItem value="yes" className="focus:bg-slate-850 hover:bg-slate-850">Smoker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alcohol_consumption" className="text-slate-300">Alcohol Consumption</Label>
                        <Select value={form.alcohol_consumption} onValueChange={(v) => update("alcohol_consumption", v)}>
                          <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:ring-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 text-white">
                            <SelectItem value="no" className="focus:bg-slate-850 hover:bg-slate-850">Non-Drinker</SelectItem>
                            <SelectItem value="yes" className="focus:bg-slate-850 hover:bg-slate-850">Consumes Alcohol</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lifestyle_info" className="text-slate-300">Lifestyle Information (Exercise, Diet, Sleep, etc.)</Label>
                      <Textarea
                        id="lifestyle_info"
                        value={form.lifestyle_info}
                        onChange={(e) => update("lifestyle_info", e.target.value)}
                        placeholder="Describe your daily diet, workout routine, typical sleep duration..."
                        className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  {/* Medical History Tab */}
                  <TabsContent value="medical" className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="existing_diseases" className="text-slate-350">Existing Diseases / Acute Illnesses</Label>
                        <Input
                          id="existing_diseases"
                          value={form.existing_diseases}
                          onChange={(e) => update("existing_diseases", e.target.value)}
                          placeholder="e.g. Hypertension, Diabetes, Thyroid"
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="chronic_diseases" className="text-slate-350">Chronic Diseases</Label>
                        <Input
                          id="chronic_diseases"
                          value={form.chronic_diseases}
                          onChange={(e) => update("chronic_diseases", e.target.value)}
                          placeholder="e.g. Asthma, Coronary Artery Disease"
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="allergies" className="text-slate-350 text-red-400">Allergies</Label>
                        <Input
                          id="allergies"
                          value={form.allergies}
                          onChange={(e) => update("allergies", e.target.value)}
                          placeholder="e.g. Penicillin, Peanuts, Pollen"
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700 border-red-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="current_medications" className="text-slate-350">Current Medications</Label>
                        <Input
                          id="current_medications"
                          value={form.current_medications}
                          onChange={(e) => update("current_medications", e.target.value)}
                          placeholder="e.g. Metformin 500mg daily"
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="family_medical_history" className="text-slate-350">Family Medical History</Label>
                        <Input
                          id="family_medical_history"
                          value={form.family_medical_history}
                          onChange={(e) => update("family_medical_history", e.target.value)}
                          placeholder="e.g. Father has Heart Disease, Mother has Hypertension"
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="surgeries" className="text-slate-350">Previous Surgeries / Procedures</Label>
                        <Input
                          id="surgeries"
                          value={form.surgeries}
                          onChange={(e) => update("surgeries", e.target.value)}
                          placeholder="e.g. Appendectomy (2018), Knee Arthroscopy (2022)"
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="vaccinations" className="text-slate-350">Vaccination Records</Label>
                        <Input
                          id="vaccinations"
                          value={form.vaccinations}
                          onChange={(e) => update("vaccinations", e.target.value)}
                          placeholder="e.g. COVID-19 (3 doses), Tetanus booster (2024)"
                          className="bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="border-t border-slate-850 pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-500 text-white border-none gap-2 font-semibold min-w-[150px]"
                  >
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

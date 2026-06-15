import { useState, useEffect } from "react";
import { useGetDoctorMe, useUpdateDoctorMe } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DoctorProfile() {
  const { toast } = useToast();
  const { data: doctor, isLoading, refetch } = useGetDoctorMe();
  const updateMutation = useUpdateDoctorMe();

  const [form, setForm] = useState({
    fullName: "",
    specialization: "",
    qualification: "",
    yearsOfExperience: 0,
    consultationFees: 0,
    bio: "",
    mobile: "",
  });

  useEffect(() => {
    if (doctor) {
      setForm({
        fullName: doctor.full_name || "",
        specialization: doctor.specialization || "",
        qualification: doctor.qualification || "",
        yearsOfExperience: doctor.years_of_experience ?? 0,
        consultationFees: doctor.consultation_fees ?? 0,
        bio: doctor.bio || "",
        mobile: doctor.mobile || "",
      });
    }
  }, [doctor]);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        full_name: form.fullName.trim(),
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        years_of_experience: Number(form.yearsOfExperience),
        consultation_fees: Number(form.consultationFees),
        bio: form.bio.trim() || null,
        mobile: form.mobile.trim(),
      });

      toast({ title: "Profile Updated", description: "Your profile details have been saved successfully." });
      refetch();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  }

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="text-slate-400 mt-2">Manage your clinical profile, bio, fees, and specialization fields.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" /> Physician Details
          </CardTitle>
          <CardDescription className="text-slate-400">This information will be visible to booking patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-slate-350">Full Name</Label>
                <Input
                  id="fullName"
                  className="bg-slate-950 border-slate-850 text-white"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="mobile" className="text-slate-350">Mobile</Label>
                <Input
                  id="mobile"
                  className="bg-slate-950 border-slate-850 text-white"
                  value={form.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="specialization" className="text-slate-350">Specialization</Label>
                <Input
                  id="specialization"
                  className="bg-slate-950 border-slate-850 text-white"
                  value={form.specialization}
                  onChange={(e) => update("specialization", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="qualification" className="text-slate-350">Qualification</Label>
                <Input
                  id="qualification"
                  className="bg-slate-950 border-slate-850 text-white"
                  value={form.qualification}
                  onChange={(e) => update("qualification", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="experience" className="text-slate-350">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  className="bg-slate-950 border-slate-850 text-white"
                  value={String(form.yearsOfExperience)}
                  onChange={(e) => update("yearsOfExperience", Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="fees" className="text-slate-350">Consultation Fees (₹)</Label>
                <Input
                  id="fees"
                  type="number"
                  className="bg-slate-950 border-slate-850 text-white"
                  value={String(form.consultationFees)}
                  onChange={(e) => update("consultationFees", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="license" className="text-slate-350">License / Reg Number (Verified)</Label>
              <Input
                id="license"
                disabled
                className="bg-slate-950/50 border-slate-850 text-slate-400 font-mono"
                value={doctor?.license_number || "Unspecified"}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bio" className="text-slate-350">Short Bio</Label>
              <Textarea
                id="bio"
                className="bg-slate-950 border-slate-850 text-white"
                rows={4}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending} className="bg-emerald-650 hover:bg-emerald-600 text-white border-none gap-2 font-semibold px-6">
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

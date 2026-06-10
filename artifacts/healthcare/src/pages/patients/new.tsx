import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreatePatient } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const patientSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  mobile: z.string().min(10, "Valid mobile required"),
  email: z.string().email().optional().or(z.literal("")),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  gender: z.string().min(1, "Gender required"),
  bloodGroup: z.string().min(1, "Blood group required"),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  existingDiseases: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  smokingStatus: z.string().optional(),
  alcoholConsumption: z.string().optional(),
});

export default function NewPatient() {
  const [, setLocation] = useLocation();
  const createPatient = useCreatePatient();

  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      existingDiseases: "",
      allergies: "",
      currentMedications: "",
      smokingStatus: "never",
      alcoholConsumption: "none",
    },
  });

  function onSubmit(values: z.infer<typeof patientSchema>) {
    createPatient.mutate({ data: values }, {
      onSuccess: (data) => {
        setLocation(`/patients/${data.id}`);
      }
    });
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Onboard New Patient</h1>
        <p className="text-muted-foreground mt-2">Enter details to generate a unique Health ID.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="mobile" render={({ field }) => (
                <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="existingDiseases" render={({ field }) => (
                <FormItem><FormLabel>Existing Conditions</FormLabel><FormControl><Textarea placeholder="e.g. Hypertension, Diabetes" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="allergies" render={({ field }) => (
                <FormItem><FormLabel>Allergies</FormLabel><FormControl><Textarea placeholder="e.g. Penicillin, Peanuts" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="currentMedications" render={({ field }) => (
                <FormItem><FormLabel>Current Medications</FormLabel><FormControl><Textarea placeholder="Ongoing prescriptions" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/patients")}>Cancel</Button>
            <Button type="submit" disabled={createPatient.isPending}>
              {createPatient.isPending ? "Registering..." : "Register Patient"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
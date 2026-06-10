import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, patientsTable } from "@workspace/db";
import {
  ListPatientsQueryParams,
  CreatePatientBody,
  GetPatientParams,
  UpdatePatientParams,
  UpdatePatientBody,
  GetPatientByHealthIdParams,
  GetPatientHealthScoreParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateHealthId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
  return `PVT-${year}-${num}`;
}

function calculateBmi(height?: number | null, weight?: number | null): number | null {
  if (!height || !weight) return null;
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

function computeHealthScore(patient: {
  bmi?: number | null;
  existingDiseases?: string | null;
  chronicDiseases?: string | null;
  smokingStatus?: string | null;
  alcoholConsumption?: string | null;
  allergies?: string | null;
}): { score: number; riskLevel: string } {
  let score = 100;
  const bmi = patient.bmi;
  if (bmi !== null && bmi !== undefined) {
    if (bmi < 18.5 || bmi > 30) score -= 15;
    else if (bmi > 25) score -= 8;
  }
  if (patient.existingDiseases && patient.existingDiseases.trim()) score -= 15;
  if (patient.chronicDiseases && patient.chronicDiseases.trim()) score -= 20;
  if (patient.smokingStatus && patient.smokingStatus.toLowerCase() === "yes") score -= 15;
  if (patient.alcoholConsumption && patient.alcoholConsumption.toLowerCase() === "yes") score -= 10;
  score = Math.max(0, Math.min(100, score));
  let riskLevel = "healthy";
  if (score < 40) riskLevel = "critical";
  else if (score < 60) riskLevel = "high";
  else if (score < 80) riskLevel = "moderate";
  return { score, riskLevel };
}

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

router.get("/patients", async (req, res): Promise<void> => {
  const params = ListPatientsQueryParams.safeParse(req.query);
  let query = db.select().from(patientsTable);
  // @ts-expect-error drizzle dynamic where
  let results = await query;
  if (params.success && params.data.search) {
    const s = params.data.search.toLowerCase();
    results = results.filter((p) =>
      p.fullName.toLowerCase().includes(s) ||
      p.healthId.toLowerCase().includes(s) ||
      p.mobile.includes(s)
    );
  }
  if (params.success && params.data.bloodGroup) {
    results = results.filter((p) => p.bloodGroup === params.data.bloodGroup);
  }
  if (params.success && params.data.riskLevel) {
    results = results.filter((p) => p.riskLevel === params.data.riskLevel);
  }
  res.json(results);
});

router.post("/patients", async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const bmi = calculateBmi(data.height, data.weight);
  const { score, riskLevel } = computeHealthScore({ ...data, bmi });
  const age = calcAge(data.dateOfBirth);
  const healthId = generateHealthId();
  const [patient] = await db.insert(patientsTable).values({
    ...data,
    healthId,
    age,
    bmi,
    healthScore: score,
    riskLevel,
  }).returning();
  res.status(201).json(patient);
});

router.get("/patients/by-health-id/:healthId", async (req, res): Promise<void> => {
  const params = GetPatientByHealthIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.healthId, params.data.healthId));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(patient);
});

router.get("/patients/:id/health-score", async (req, res): Promise<void> => {
  const params = GetPatientHealthScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  const { score, riskLevel } = computeHealthScore(patient);
  res.json({
    patientId: patient.id,
    score,
    riskLevel,
    bmiContribution: patient.bmi ? (patient.bmi > 25 || patient.bmi < 18.5 ? 15 : 0) : null,
    conditionsContribution: patient.existingDiseases ? 15 : 0,
    lifestyleContribution: (patient.smokingStatus === "yes" ? 15 : 0) + (patient.alcoholConsumption === "yes" ? 10 : 0),
    computedAt: new Date().toISOString(),
  });
});

router.get("/patients/:id", async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(patient);
});

router.patch("/patients/:id", async (req, res): Promise<void> => {
  const params = UpdatePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  const merged = { ...existing, ...parsed.data };
  const bmi = calculateBmi(merged.height, merged.weight);
  const { score, riskLevel } = computeHealthScore({ ...merged, bmi });
  const [updated] = await db.update(patientsTable)
    .set({ ...parsed.data, bmi, healthScore: score, riskLevel })
    .where(eq(patientsTable.id, params.data.id))
    .returning();
  res.json(updated);
});

export default router;

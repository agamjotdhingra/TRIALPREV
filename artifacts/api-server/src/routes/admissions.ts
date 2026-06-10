import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, admissionsTable, patientsTable, hospitalsTable, wardsTable, bedsTable, doctorsTable } from "@workspace/db";
import {
  ListAdmissionsQueryParams,
  CreateAdmissionBody,
  GetAdmissionParams,
  UpdateAdmissionParams,
  UpdateAdmissionBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichAdmission(a: typeof admissionsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, a.patientId));
  const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, a.hospitalId));
  let wardName = null, bedNumber = null, primaryDoctorName = null;
  if (a.wardId) {
    const [ward] = await db.select().from(wardsTable).where(eq(wardsTable.id, a.wardId));
    wardName = ward?.name ?? null;
  }
  if (a.bedId) {
    const [bed] = await db.select().from(bedsTable).where(eq(bedsTable.id, a.bedId));
    bedNumber = bed?.bedNumber ?? null;
  }
  if (a.primaryDoctorId) {
    const [doc] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, a.primaryDoctorId));
    primaryDoctorName = doc?.fullName ?? null;
  }
  return {
    ...a,
    patientName: patient?.fullName ?? null,
    hospitalName: hospital?.name ?? null,
    wardName,
    bedNumber,
    primaryDoctorName,
  };
}

router.get("/admissions", async (req, res): Promise<void> => {
  const params = ListAdmissionsQueryParams.safeParse(req.query);
  let results = await db.select().from(admissionsTable);
  if (params.success) {
    if (params.data.hospitalId) results = results.filter((a) => a.hospitalId === params.data.hospitalId);
    if (params.data.patientId) results = results.filter((a) => a.patientId === params.data.patientId);
    if (params.data.status) results = results.filter((a) => a.status === params.data.status);
  }
  res.json(await Promise.all(results.map(enrichAdmission)));
});

router.post("/admissions", async (req, res): Promise<void> => {
  const parsed = CreateAdmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [admission] = await db.insert(admissionsTable).values({ ...parsed.data, status: parsed.data.status ?? "admitted" }).returning();
  if (admission.bedId) {
    await db.update(bedsTable).set({ status: "occupied", currentPatientId: admission.patientId }).where(eq(bedsTable.id, admission.bedId));
  }
  res.status(201).json(await enrichAdmission(admission));
});

router.get("/admissions/:id", async (req, res): Promise<void> => {
  const params = GetAdmissionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [admission] = await db.select().from(admissionsTable).where(eq(admissionsTable.id, params.data.id));
  if (!admission) {
    res.status(404).json({ error: "Admission not found" });
    return;
  }
  res.json(await enrichAdmission(admission));
});

router.patch("/admissions/:id", async (req, res): Promise<void> => {
  const params = UpdateAdmissionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAdmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(admissionsTable).where(eq(admissionsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Admission not found" });
    return;
  }
  const [admission] = await db.update(admissionsTable).set(parsed.data).where(eq(admissionsTable.id, params.data.id)).returning();
  if (parsed.data.status === "discharged" && existing.bedId) {
    await db.update(bedsTable).set({ status: "available", currentPatientId: null }).where(eq(bedsTable.id, existing.bedId));
  }
  res.json(await enrichAdmission(admission));
});

export default router;

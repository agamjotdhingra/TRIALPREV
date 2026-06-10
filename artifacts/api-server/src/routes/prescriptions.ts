import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, prescriptionsTable, patientsTable, doctorsTable } from "@workspace/db";
import {
  ListPrescriptionsQueryParams,
  CreatePrescriptionBody,
  GetPrescriptionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichPrescription(rx: typeof prescriptionsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, rx.patientId));
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, rx.doctorId));
  return { ...rx, patientName: patient?.fullName ?? null, doctorName: doctor?.fullName ?? null };
}

router.get("/prescriptions", async (req, res): Promise<void> => {
  const params = ListPrescriptionsQueryParams.safeParse(req.query);
  let results = await db.select().from(prescriptionsTable);
  if (params.success) {
    if (params.data.patientId) results = results.filter((r) => r.patientId === params.data.patientId);
    if (params.data.doctorId) results = results.filter((r) => r.doctorId === params.data.doctorId);
  }
  res.json(await Promise.all(results.map(enrichPrescription)));
});

router.post("/prescriptions", async (req, res): Promise<void> => {
  const parsed = CreatePrescriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [rx] = await db.insert(prescriptionsTable).values(parsed.data).returning();
  res.status(201).json(await enrichPrescription(rx));
});

router.get("/prescriptions/:id", async (req, res): Promise<void> => {
  const params = GetPrescriptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [rx] = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.id, params.data.id));
  if (!rx) {
    res.status(404).json({ error: "Prescription not found" });
    return;
  }
  res.json(await enrichPrescription(rx));
});

export default router;

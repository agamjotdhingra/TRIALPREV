import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, hospitalsTable, admissionsTable, staffTable, wardsTable, bedsTable } from "@workspace/db";
import {
  CreateHospitalBody,
  GetHospitalParams,
  GetHospitalOverviewParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/hospitals", async (_req, res): Promise<void> => {
  const results = await db.select().from(hospitalsTable);
  res.json(results);
});

router.post("/hospitals", async (req, res): Promise<void> => {
  const parsed = CreateHospitalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [hospital] = await db.insert(hospitalsTable).values(parsed.data).returning();
  res.status(201).json(hospital);
});

router.get("/hospitals/:id/overview", async (req, res): Promise<void> => {
  const params = GetHospitalOverviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const hId = params.data.id;
  const admissions = await db.select().from(admissionsTable).where(eq(admissionsTable.hospitalId, hId));
  const allStaff = await db.select().from(staffTable).where(eq(staffTable.hospitalId, hId));
  const allWards = await db.select().from(wardsTable).where(eq(wardsTable.hospitalId, hId));
  const wardIds = allWards.map((w) => w.id);
  let allBeds: typeof bedsTable.$inferSelect[] = [];
  for (const wId of wardIds) {
    const beds = await db.select().from(bedsTable).where(eq(bedsTable.wardId, wId));
    allBeds = allBeds.concat(beds);
  }
  const admitted = admissions.filter((a) => a.status !== "discharged");
  const today = new Date().toISOString().split("T")[0];
  const dischargedToday = admissions.filter((a) => a.status === "discharged" && a.dischargeDate === today);
  const icuPatients = admissions.filter((a) => a.status === "icu");
  const doctors = allStaff.filter((s) => s.role === "doctor" || s.assignedShift);
  const nurses = allStaff.filter((s) => s.role === "nurse");
  const totalBeds = allBeds.length;
  const occupiedBeds = allBeds.filter((b) => b.status === "occupied").length;
  const availableBeds = allBeds.filter((b) => b.status === "available").length;
  const alerts: string[] = [];
  if (availableBeds === 0) alerts.push("Bed Shortage: No beds available");
  if (icuPatients.length > 0) alerts.push(`${icuPatients.length} ICU patient(s) require attention`);
  if (availableBeds < 5) alerts.push("Low bed availability warning");
  res.json({
    hospitalId: hId,
    totalPatients: admitted.length,
    admittedPatients: admitted.filter((a) => a.status === "admitted").length,
    dischargedToday: dischargedToday.length,
    icuPatients: icuPatients.length,
    doctorsOnDuty: doctors.length,
    nursesOnDuty: nurses.length,
    totalBeds,
    availableBeds,
    occupiedBeds,
    alerts,
  });
});

router.get("/hospitals/:id", async (req, res): Promise<void> => {
  const params = GetHospitalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, params.data.id));
  if (!hospital) {
    res.status(404).json({ error: "Hospital not found" });
    return;
  }
  res.json(hospital);
});

export default router;

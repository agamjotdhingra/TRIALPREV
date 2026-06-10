import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable, patientsTable, labsTable } from "@workspace/db";
import {
  ListReportsQueryParams,
  CreateReportBody,
  GetReportParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichReport(r: typeof reportsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, r.patientId));
  const [lab] = await db.select().from(labsTable).where(eq(labsTable.id, r.labId));
  return { ...r, patientName: patient?.fullName ?? null, labName: lab?.name ?? null };
}

router.get("/reports", async (req, res): Promise<void> => {
  const params = ListReportsQueryParams.safeParse(req.query);
  let results = await db.select().from(reportsTable);
  if (params.success) {
    if (params.data.patientId) results = results.filter((r) => r.patientId === params.data.patientId);
    if (params.data.labId) results = results.filter((r) => r.labId === params.data.labId);
    if (params.data.category) results = results.filter((r) => r.category === params.data.category);
    if (params.data.isCritical !== undefined) results = results.filter((r) => r.isCritical === params.data.isCritical);
  }
  res.json(await Promise.all(results.map(enrichReport)));
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [report] = await db.insert(reportsTable).values(parsed.data).returning();
  res.status(201).json(await enrichReport(report));
});

router.get("/reports/:id", async (req, res): Promise<void> => {
  const params = GetReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, params.data.id));
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(await enrichReport(report));
});

export default router;

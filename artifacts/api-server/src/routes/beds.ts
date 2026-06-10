import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bedsTable, wardsTable, patientsTable } from "@workspace/db";
import {
  ListBedsQueryParams,
  CreateBedBody,
  GetBedParams,
  UpdateBedParams,
  UpdateBedBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichBed(b: typeof bedsTable.$inferSelect) {
  const [ward] = await db.select().from(wardsTable).where(eq(wardsTable.id, b.wardId));
  let currentPatientName = null;
  if (b.currentPatientId) {
    const [p] = await db.select().from(patientsTable).where(eq(patientsTable.id, b.currentPatientId));
    currentPatientName = p?.fullName ?? null;
  }
  return { ...b, wardName: ward?.name ?? null, currentPatientName };
}

router.get("/beds", async (req, res): Promise<void> => {
  const params = ListBedsQueryParams.safeParse(req.query);
  let results = await db.select().from(bedsTable);
  if (params.success) {
    if (params.data.wardId) results = results.filter((b) => b.wardId === params.data.wardId);
    if (params.data.status) results = results.filter((b) => b.status === params.data.status);
  }
  res.json(await Promise.all(results.map(enrichBed)));
});

router.post("/beds", async (req, res): Promise<void> => {
  const parsed = CreateBedBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [bed] = await db.insert(bedsTable).values({ ...parsed.data, status: parsed.data.status ?? "available" }).returning();
  res.status(201).json(await enrichBed(bed));
});

router.get("/beds/:id", async (req, res): Promise<void> => {
  const params = GetBedParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [bed] = await db.select().from(bedsTable).where(eq(bedsTable.id, params.data.id));
  if (!bed) {
    res.status(404).json({ error: "Bed not found" });
    return;
  }
  res.json(await enrichBed(bed));
});

router.patch("/beds/:id", async (req, res): Promise<void> => {
  const params = UpdateBedParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBedBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [bed] = await db.update(bedsTable).set(parsed.data).where(eq(bedsTable.id, params.data.id)).returning();
  if (!bed) {
    res.status(404).json({ error: "Bed not found" });
    return;
  }
  res.json(await enrichBed(bed));
});

export default router;

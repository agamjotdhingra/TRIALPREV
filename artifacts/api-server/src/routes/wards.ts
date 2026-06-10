import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, wardsTable } from "@workspace/db";
import {
  ListWardsQueryParams,
  CreateWardBody,
  GetWardParams,
  UpdateWardParams,
  UpdateWardBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/wards", async (req, res): Promise<void> => {
  const params = ListWardsQueryParams.safeParse(req.query);
  let results = await db.select().from(wardsTable);
  if (params.success) {
    if (params.data.hospitalId) results = results.filter((w) => w.hospitalId === params.data.hospitalId);
    if (params.data.wardType) results = results.filter((w) => w.wardType === params.data.wardType);
  }
  res.json(results);
});

router.post("/wards", async (req, res): Promise<void> => {
  const parsed = CreateWardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ward] = await db.insert(wardsTable).values({
    ...parsed.data,
    occupiedBeds: 0,
    availableBeds: parsed.data.totalBeds,
  }).returning();
  res.status(201).json(ward);
});

router.get("/wards/:id", async (req, res): Promise<void> => {
  const params = GetWardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [ward] = await db.select().from(wardsTable).where(eq(wardsTable.id, params.data.id));
  if (!ward) {
    res.status(404).json({ error: "Ward not found" });
    return;
  }
  res.json(ward);
});

router.patch("/wards/:id", async (req, res): Promise<void> => {
  const params = UpdateWardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateWardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ward] = await db.update(wardsTable).set(parsed.data).where(eq(wardsTable.id, params.data.id)).returning();
  if (!ward) {
    res.status(404).json({ error: "Ward not found" });
    return;
  }
  res.json(ward);
});

export default router;

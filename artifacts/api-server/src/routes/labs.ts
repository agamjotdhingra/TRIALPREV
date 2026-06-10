import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, labsTable } from "@workspace/db";
import {
  ListLabsQueryParams,
  CreateLabBody,
  GetLabParams,
  UpdateLabParams,
  UpdateLabBody,
  VerifyLabParams,
  VerifyLabBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/labs", async (req, res): Promise<void> => {
  const params = ListLabsQueryParams.safeParse(req.query);
  let results = await db.select().from(labsTable);
  if (params.success && params.data.verificationStatus) {
    results = results.filter((l) => l.verificationStatus === params.data.verificationStatus);
  }
  res.json(results);
});

router.post("/labs", async (req, res): Promise<void> => {
  const parsed = CreateLabBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [lab] = await db.insert(labsTable).values({ ...parsed.data, verificationStatus: "pending" }).returning();
  res.status(201).json(lab);
});

router.get("/labs/:id", async (req, res): Promise<void> => {
  const params = GetLabParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [lab] = await db.select().from(labsTable).where(eq(labsTable.id, params.data.id));
  if (!lab) {
    res.status(404).json({ error: "Lab not found" });
    return;
  }
  res.json(lab);
});

router.patch("/labs/:id/verify", async (req, res): Promise<void> => {
  const params = VerifyLabParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = VerifyLabBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [lab] = await db.update(labsTable).set({ verificationStatus: parsed.data.status }).where(eq(labsTable.id, params.data.id)).returning();
  if (!lab) {
    res.status(404).json({ error: "Lab not found" });
    return;
  }
  res.json(lab);
});

router.patch("/labs/:id", async (req, res): Promise<void> => {
  const params = UpdateLabParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLabBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [lab] = await db.update(labsTable).set(parsed.data).where(eq(labsTable.id, params.data.id)).returning();
  if (!lab) {
    res.status(404).json({ error: "Lab not found" });
    return;
  }
  res.json(lab);
});

export default router;

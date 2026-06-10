import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, staffTable } from "@workspace/db";
import {
  ListStaffQueryParams,
  CreateStaffMemberBody,
  GetStaffMemberParams,
  UpdateStaffMemberParams,
  UpdateStaffMemberBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateEmployeeId(): string {
  return `EMP-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;
}

router.get("/staff", async (req, res): Promise<void> => {
  const params = ListStaffQueryParams.safeParse(req.query);
  let results = await db.select().from(staffTable);
  if (params.success) {
    if (params.data.hospitalId) results = results.filter((s) => s.hospitalId === params.data.hospitalId);
    if (params.data.role) results = results.filter((s) => s.role === params.data.role);
    if (params.data.wardId) results = results.filter((s) => s.wardId === params.data.wardId);
  }
  res.json(results);
});

router.post("/staff", async (req, res): Promise<void> => {
  const parsed = CreateStaffMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [staff] = await db.insert(staffTable).values({ ...parsed.data, employeeId: generateEmployeeId() }).returning();
  res.status(201).json(staff);
});

router.get("/staff/:id", async (req, res): Promise<void> => {
  const params = GetStaffMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, params.data.id));
  if (!staff) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }
  res.json(staff);
});

router.patch("/staff/:id", async (req, res): Promise<void> => {
  const params = UpdateStaffMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStaffMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [staff] = await db.update(staffTable).set(parsed.data).where(eq(staffTable.id, params.data.id)).returning();
  if (!staff) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }
  res.json(staff);
});

export default router;

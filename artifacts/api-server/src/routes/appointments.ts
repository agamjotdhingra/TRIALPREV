import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, appointmentsTable, patientsTable, doctorsTable } from "@workspace/db";
import {
  ListAppointmentsQueryParams,
  CreateAppointmentBody,
  GetAppointmentParams,
  UpdateAppointmentParams,
  UpdateAppointmentBody,
  CancelAppointmentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichAppointment(appt: typeof appointmentsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, appt.patientId));
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, appt.doctorId));
  return {
    ...appt,
    patientName: patient?.fullName ?? null,
    doctorName: doctor?.fullName ?? null,
  };
}

router.get("/appointments", async (req, res): Promise<void> => {
  const params = ListAppointmentsQueryParams.safeParse(req.query);
  let results = await db.select().from(appointmentsTable);
  if (params.success) {
    if (params.data.patientId) results = results.filter((a) => a.patientId === params.data.patientId);
    if (params.data.doctorId) results = results.filter((a) => a.doctorId === params.data.doctorId);
    if (params.data.status) results = results.filter((a) => a.status === params.data.status);
    if (params.data.date) results = results.filter((a) => a.scheduledDate === params.data.date);
  }
  const enriched = await Promise.all(results.map(enrichAppointment));
  res.json(enriched);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [appt] = await db.insert(appointmentsTable).values({
    ...parsed.data,
    status: "scheduled",
  }).returning();
  res.status(201).json(await enrichAppointment(appt));
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [appt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, params.data.id));
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json(await enrichAppointment(appt));
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [appt] = await db.update(appointmentsTable)
    .set(parsed.data)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json(await enrichAppointment(appt));
});

router.delete("/appointments/:id", async (req, res): Promise<void> => {
  const params = CancelAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [appt] = await db.update(appointmentsTable)
    .set({ status: "cancelled" })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;

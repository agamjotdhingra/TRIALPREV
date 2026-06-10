import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, doctorsTable, appointmentsTable, patientsTable } from "@workspace/db";
import {
  ListDoctorsQueryParams,
  CreateDoctorBody,
  GetDoctorParams,
  UpdateDoctorParams,
  UpdateDoctorBody,
  VerifyDoctorParams,
  VerifyDoctorBody,
  GetDoctorQueueParams,
  GetDoctorStatsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/doctors", async (req, res): Promise<void> => {
  const params = ListDoctorsQueryParams.safeParse(req.query);
  let results = await db.select().from(doctorsTable);
  if (params.success && params.data.specialization) {
    results = results.filter((d) => d.specialization.toLowerCase().includes(params.data.specialization!.toLowerCase()));
  }
  if (params.success && params.data.verificationStatus) {
    results = results.filter((d) => d.verificationStatus === params.data.verificationStatus);
  }
  res.json(results);
});

router.post("/doctors", async (req, res): Promise<void> => {
  const parsed = CreateDoctorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [doctor] = await db.insert(doctorsTable).values({
    ...parsed.data,
    verificationStatus: "pending",
  }).returning();
  res.status(201).json(doctor);
});

router.get("/doctors/:id/queue", async (req, res): Promise<void> => {
  const params = GetDoctorQueueParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const today = new Date().toISOString().split("T")[0];
  const appointments = await db.select().from(appointmentsTable)
    .where(eq(appointmentsTable.doctorId, params.data.id));
  const todayAppts = appointments.filter((a) => a.scheduledDate === today && a.status === "scheduled");
  const result = await Promise.all(todayAppts.map(async (appt) => {
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, appt.patientId));
    const priority = !patient ? "moderate"
      : (patient.riskLevel === "critical" ? "critical"
        : patient.riskLevel === "high" ? "high"
          : patient.riskLevel === "moderate" ? "moderate" : "healthy");
    return {
      patientId: appt.patientId,
      fullName: patient?.fullName ?? "Unknown",
      healthId: patient?.healthId ?? "",
      healthScore: patient?.healthScore ?? null,
      riskLevel: patient?.riskLevel ?? null,
      priority,
      appointmentId: appt.id,
      scheduledTime: appt.scheduledTime,
      reason: appt.reason,
    };
  }));
  const priorityOrder = { critical: 0, high: 1, moderate: 2, healthy: 3 };
  result.sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3));
  res.json(result);
});

router.get("/doctors/:id/stats", async (req, res): Promise<void> => {
  const params = GetDoctorStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const allAppts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.doctorId, params.data.id));
  const today = new Date().toISOString().split("T")[0];
  const todayAppts = allAppts.filter((a) => a.scheduledDate === today);
  const uniquePatients = new Set(allAppts.map((a) => a.patientId));
  const pendingAppts = allAppts.filter((a) => a.status === "scheduled" && a.scheduledDate >= today);
  const completedToday = todayAppts.filter((a) => a.status === "completed");
  const criticalPatients = await db.select().from(patientsTable);
  const myCritical = criticalPatients.filter((p) => uniquePatients.has(p.id) && p.riskLevel === "critical");
  res.json({
    totalPatients: uniquePatients.size,
    todayAppointments: todayAppts.length,
    pendingAppointments: pendingAppts.length,
    completedToday: completedToday.length,
    criticalPatients: myCritical.length,
  });
});

router.get("/doctors/:id", async (req, res): Promise<void> => {
  const params = GetDoctorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, params.data.id));
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  res.json(doctor);
});

router.patch("/doctors/:id/verify", async (req, res): Promise<void> => {
  const params = VerifyDoctorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = VerifyDoctorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [doctor] = await db.update(doctorsTable)
    .set({ verificationStatus: parsed.data.status })
    .where(eq(doctorsTable.id, params.data.id))
    .returning();
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  res.json(doctor);
});

router.patch("/doctors/:id", async (req, res): Promise<void> => {
  const params = UpdateDoctorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDoctorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [doctor] = await db.update(doctorsTable)
    .set(parsed.data)
    .where(eq(doctorsTable.id, params.data.id))
    .returning();
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  res.json(doctor);
});

export default router;

import { Router, type IRouter } from "express";
import { db, patientsTable, doctorsTable, labsTable, hospitalsTable, appointmentsTable, reportsTable, notificationsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const patients = await db.select().from(patientsTable);
  const doctors = await db.select().from(doctorsTable);
  const labs = await db.select().from(labsTable);
  const hospitals = await db.select().from(hospitalsTable);
  const appointments = await db.select().from(appointmentsTable);
  const reports = await db.select().from(reportsTable);
  const today = new Date().toISOString().split("T")[0];
  const criticalPatients = patients.filter((p) => p.riskLevel === "critical").length;
  const highRiskPatients = patients.filter((p) => p.riskLevel === "high").length;
  const todayAppointments = appointments.filter((a) => a.scheduledDate === today).length;
  const pendingDoctors = doctors.filter((d) => d.verificationStatus === "pending").length;
  const pendingLabs = labs.filter((l) => l.verificationStatus === "pending").length;
  res.json({
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalLabs: labs.length,
    totalHospitals: hospitals.length,
    totalAppointments: appointments.length,
    totalReports: reports.length,
    criticalPatients,
    highRiskPatients,
    todayAppointments,
    pendingVerifications: pendingDoctors + pendingLabs,
  });
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const patients = await db.select().from(patientsTable);
  const appointments = await db.select().from(appointmentsTable);
  const reports = await db.select().from(reportsTable);
  const items = [
    ...patients.slice(-5).map((p, i) => ({
      id: i + 1,
      type: "patient_registered",
      description: `New patient registered`,
      entityName: p.fullName,
      timestamp: p.createdAt,
    })),
    ...appointments.slice(-5).map((a, i) => ({
      id: i + 100,
      type: "appointment_booked",
      description: `Appointment ${a.status}`,
      entityName: `Patient #${a.patientId}`,
      timestamp: a.createdAt,
    })),
    ...reports.slice(-5).map((r, i) => ({
      id: i + 200,
      type: "report_uploaded",
      description: `Lab report uploaded${r.isCritical ? " — CRITICAL" : ""}`,
      entityName: r.reportName,
      timestamp: r.createdAt,
    })),
  ];
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(items.slice(0, 15));
});

router.get("/dashboard/risk-distribution", async (_req, res): Promise<void> => {
  const patients = await db.select().from(patientsTable);
  const total = patients.length || 1;
  const counts = { healthy: 0, moderate: 0, high: 0, critical: 0 };
  patients.forEach((p) => {
    const rl = (p.riskLevel ?? "healthy") as keyof typeof counts;
    if (rl in counts) counts[rl]++;
    else counts.healthy++;
  });
  res.json(
    Object.entries(counts).map(([riskLevel, count]) => ({
      riskLevel,
      count,
      percentage: Math.round((count / total) * 100 * 10) / 10,
    }))
  );
});

export default router;

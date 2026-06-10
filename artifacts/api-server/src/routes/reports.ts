import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable, patientsTable, labsTable, notificationsTable, appointmentsTable } from "@workspace/db";
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

async function distributeReportNotifications(report: typeof reportsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, report.patientId));
  const [lab] = await db.select().from(labsTable).where(eq(labsTable.id, report.labId));
  const labName = lab?.name ?? "the lab";
  const patientName = patient?.fullName ?? `Patient #${report.patientId}`;

  const notifications: (typeof notificationsTable.$inferInsert)[] = [];

  // Notify patient
  notifications.push({
    recipientType: "patient",
    recipientId: report.patientId,
    type: report.isCritical ? "critical_alert" : "new_report",
    title: report.isCritical ? "⚠️ Critical Lab Report Available" : "New Lab Report Available",
    message: report.isCritical
      ? `Your report "${report.reportName}" from ${labName} has been flagged as CRITICAL. ${report.criticalNote ?? "Please contact your doctor immediately."}`
      : `Your report "${report.reportName}" from ${labName} is now available. Category: ${report.category}.`,
    isRead: false,
    relatedEntityId: report.id,
    relatedEntityType: "report",
  });

  // Notify admin for critical reports
  if (report.isCritical) {
    notifications.push({
      recipientType: "admin",
      recipientId: 0,
      type: "critical_alert",
      title: `Critical Report — ${patientName}`,
      message: `A critical lab report "${report.reportName}" has been uploaded for ${patientName} (ID: ${report.patientId}). ${report.criticalNote ?? ""}`,
      isRead: false,
      relatedEntityId: report.id,
      relatedEntityType: "report",
    });
  }

  // Notify all doctors who have appointments with this patient
  const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.patientId, report.patientId));
  const uniqueDoctorIds = [...new Set(appts.map((a) => a.doctorId))];
  for (const doctorId of uniqueDoctorIds) {
    notifications.push({
      recipientType: "doctor",
      recipientId: doctorId,
      type: report.isCritical ? "critical_alert" : "report_uploaded",
      title: report.isCritical ? `⚠️ Critical Report — ${patientName}` : `Report Uploaded — ${patientName}`,
      message: report.isCritical
        ? `Critical report "${report.reportName}" uploaded for your patient ${patientName}. Immediate review recommended. ${report.criticalNote ?? ""}`
        : `New report "${report.reportName}" (${report.category}) has been uploaded for ${patientName} by ${labName}.`,
      isRead: false,
      relatedEntityId: report.id,
      relatedEntityType: "report",
    });
  }

  if (notifications.length > 0) {
    await db.insert(notificationsTable).values(notifications);
  }
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
  // Fire-and-forget auto-distribution — don't block the response
  distributeReportNotifications(report).catch(() => {});
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

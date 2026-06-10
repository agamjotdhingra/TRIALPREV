import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  labId: integer("lab_id").notNull(),
  category: text("category").notNull(),
  reportName: text("report_name").notNull(),
  fileUrl: text("file_url"),
  findings: text("findings"),
  isCritical: boolean("is_critical").notNull().default(false),
  criticalNote: text("critical_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true, createdAt: true,
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;

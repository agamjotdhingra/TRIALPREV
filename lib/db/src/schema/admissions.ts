import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const admissionsTable = pgTable("admissions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  hospitalId: integer("hospital_id").notNull(),
  wardId: integer("ward_id"),
  bedId: integer("bed_id"),
  primaryDoctorId: integer("primary_doctor_id"),
  admissionDate: date("admission_date", { mode: "string" }).notNull(),
  admissionReason: text("admission_reason").notNull(),
  status: text("status").notNull().default("admitted"),
  dischargeDate: date("discharge_date", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAdmissionSchema = createInsertSchema(admissionsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;
export type Admission = typeof admissionsTable.$inferSelect;

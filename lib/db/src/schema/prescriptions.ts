import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  appointmentId: integer("appointment_id"),
  diagnosis: text("diagnosis").notNull(),
  medicines: text("medicines").notNull(),
  instructions: text("instructions"),
  followUpDate: date("follow_up_date", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptionsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptionsTable.$inferSelect;

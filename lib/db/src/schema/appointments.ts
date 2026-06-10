import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  scheduledDate: date("scheduled_date", { mode: "string" }).notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  reason: text("reason"),
  consultationType: text("consultation_type").default("in-person"),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;

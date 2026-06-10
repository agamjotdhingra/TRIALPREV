import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bedsTable = pgTable("beds", {
  id: serial("id").primaryKey(),
  wardId: integer("ward_id").notNull(),
  bedNumber: text("bed_number").notNull(),
  roomNumber: text("room_number").notNull(),
  status: text("status").notNull().default("available"),
  currentPatientId: integer("current_patient_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBedSchema = createInsertSchema(bedsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertBed = z.infer<typeof insertBedSchema>;
export type Bed = typeof bedsTable.$inferSelect;

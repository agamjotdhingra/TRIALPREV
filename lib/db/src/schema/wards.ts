import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wardsTable = pgTable("wards", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").notNull(),
  name: text("name").notNull(),
  wardType: text("ward_type").notNull(),
  totalBeds: integer("total_beds").notNull().default(0),
  occupiedBeds: integer("occupied_beds").notNull().default(0),
  availableBeds: integer("available_beds").notNull().default(0),
  assignedStaff: integer("assigned_staff"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWardSchema = createInsertSchema(wardsTable).omit({
  id: true, occupiedBeds: true, availableBeds: true, createdAt: true, updatedAt: true,
});
export type InsertWard = z.infer<typeof insertWardSchema>;
export type Ward = typeof wardsTable.$inferSelect;

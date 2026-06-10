import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hospitalsTable = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  address: text("address").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  totalBeds: integer("total_beds"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertHospitalSchema = createInsertSchema(hospitalsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitalsTable.$inferSelect;

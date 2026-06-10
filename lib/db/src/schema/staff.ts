import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  qualification: text("qualification").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  hospitalId: integer("hospital_id"),
  wardId: integer("ward_id"),
  assignedShift: text("assigned_shift"),
  licenseInfo: text("license_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStaffSchema = createInsertSchema(staffTable).omit({
  id: true, employeeId: true, createdAt: true, updatedAt: true,
});
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staffTable.$inferSelect;

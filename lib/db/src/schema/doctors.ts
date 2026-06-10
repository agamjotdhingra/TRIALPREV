import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull(),
  specialization: text("specialization").notNull(),
  qualification: text("qualification").notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  licenseNumber: text("license_number"),
  licenseValidUntil: date("license_valid_until", { mode: "string" }),
  consultationFees: real("consultation_fees"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  verificationStatus: text("verification_status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctorsTable.$inferSelect;

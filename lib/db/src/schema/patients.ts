import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  healthId: text("health_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
  age: integer("age"),
  gender: text("gender").notNull(),
  bloodGroup: text("blood_group").notNull(),
  height: real("height"),
  weight: real("weight"),
  bmi: real("bmi"),
  healthScore: integer("health_score"),
  riskLevel: text("risk_level"),
  existingDiseases: text("existing_diseases"),
  allergies: text("allergies"),
  currentMedications: text("current_medications"),
  familyMedicalHistory: text("family_medical_history"),
  smokingStatus: text("smoking_status"),
  alcoholConsumption: text("alcohol_consumption"),
  lifestyleInfo: text("lifestyle_info"),
  previousConditions: text("previous_conditions"),
  surgeries: text("surgeries"),
  vaccinations: text("vaccinations"),
  chronicDiseases: text("chronic_diseases"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({
  id: true, healthId: true, age: true, bmi: true, healthScore: true, riskLevel: true, createdAt: true, updatedAt: true,
});
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;

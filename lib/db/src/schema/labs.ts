import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const labsTable = pgTable("labs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  contactPerson: text("contact_person").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  address: text("address"),
  verificationStatus: text("verification_status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLabSchema = createInsertSchema(labsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertLab = z.infer<typeof insertLabSchema>;
export type Lab = typeof labsTable.$inferSelect;

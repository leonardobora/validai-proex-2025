import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, varchar, text, integer, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Verification classification enum
export const VerificationClassification = z.enum([
  "VERDADEIRO",
  "FALSO", 
  "PARCIALMENTE_VERDADEIRO",
  "NAO_VERIFICAVEL"
]);

export type VerificationClassification = z.infer<typeof VerificationClassification>;

// Confidence level enum
export const ConfidenceLevel = z.enum([
  "ALTO",
  "MEDIO", 
  "BAIXO"
]);

export type ConfidenceLevel = z.infer<typeof ConfidenceLevel>;

// Source information schema
export const SourceSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  description: z.string(),
  year: z.number().optional()
});

export type Source = z.infer<typeof SourceSchema>;

// Verification request schema
export const VerificationRequestSchema = z.object({
  inputType: z.enum(["text", "url"]),
  content: z.string(),
  url: z.string().url().optional()
}).refine((data) => {
  if (data.inputType === "url" && !data.url) {
    return false;
  }
  if (data.inputType === "text" && !data.content.trim()) {
    return false;
  }
  return true;
}, {
  message: "URL é obrigatória quando tipo é 'url' e conteúdo é obrigatório quando tipo é 'text'"
});

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

// Verification result schema
export const VerificationResultSchema = z.object({
  classification: VerificationClassification,
  confidence_percentage: z.number().min(0).max(100),
  confidence_level: ConfidenceLevel,
  explanation: z.string(),
  temporal_context: z.string(),
  detected_bias: z.string(),
  sources: z.array(SourceSchema),
  observations: z.string().optional(),
  processing_time_ms: z.number().optional(),
  timestamp: z.string().optional()
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;

// API Response schema
export const VerificationResponseSchema = z.object({
  success: z.boolean(),
  data: VerificationResultSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export type VerificationResponse = z.infer<typeof VerificationResponseSchema>;

// Insert schemas
export const insertVerificationRequestSchema = VerificationRequestSchema;
export const insertVerificationResultSchema = VerificationResultSchema;

// Database tables
export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  name: varchar("name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const verificationRequestsTable = pgTable("verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => usersTable.id),
  inputType: varchar("input_type", { enum: ["text", "url"] }).notNull(),
  content: text("content").notNull(),
  url: varchar("url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const verificationResultsTable = pgTable("verification_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => verificationRequestsTable.id).notNull(),
  classification: varchar("classification", { enum: ["VERDADEIRO", "FALSO", "PARCIALMENTE_VERDADEIRO", "NAO_VERIFICAVEL"] }).notNull(),
  confidencePercentage: integer("confidence_percentage").notNull(),
  confidenceLevel: varchar("confidence_level", { enum: ["ALTO", "MEDIO", "BAIXO"] }).notNull(),
  explanation: text("explanation").notNull(),
  temporalContext: text("temporal_context").notNull(),
  detectedBias: text("detected_bias").notNull(),
  sources: jsonb("sources").notNull(),
  observations: text("observations"),
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Drizzle insert schemas
export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVerificationRequestSchemaDB = createInsertSchema(verificationRequestsTable).omit({ id: true, createdAt: true });
export const insertVerificationResultSchemaDB = createInsertSchema(verificationResultsTable).omit({ id: true, createdAt: true });

// Database types
export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type VerificationRequestDB = typeof verificationRequestsTable.$inferSelect;
export type InsertVerificationRequestDB = z.infer<typeof insertVerificationRequestSchemaDB>;
export type VerificationResultDB = typeof verificationResultsTable.$inferSelect;
export type InsertVerificationResultDB = z.infer<typeof insertVerificationResultSchemaDB>;

// Export types
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type InsertVerificationResult = z.infer<typeof insertVerificationResultSchema>;

import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

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
  content: z.string().min(1, "Conteúdo não pode estar vazio"),
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

// Export types
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type InsertVerificationResult = z.infer<typeof insertVerificationResultSchema>;

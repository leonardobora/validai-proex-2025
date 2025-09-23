import { 
  type VerificationRequest, 
  type VerificationResult,
  type InsertVerificationRequest,
  type InsertVerificationResult,
  type User,
  type InsertUser,
  type VerificationRequestDB,
  type VerificationResultDB,
  type InsertVerificationRequestDB,
  type InsertVerificationResultDB,
  usersTable,
  verificationRequestsTable,
  verificationResultsTable
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, count } from "drizzle-orm";

// Enhanced storage interface for ValidaÍ
export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  
  // Verification methods
  createVerificationRequest(request: InsertVerificationRequest, userId?: string): Promise<VerificationRequest & { id: string }>;
  getVerificationRequest(id: string): Promise<VerificationRequest & { id: string } | undefined>;
  createVerificationResult(result: InsertVerificationResult, requestId: string): Promise<VerificationResult & { id: string }>;
  getVerificationResult(id: string): Promise<VerificationResult & { id: string } | undefined>;
  
  // User verification history
  getUserVerificationHistory(userId: string, limit?: number, offset?: number): Promise<{
    verifications: Array<VerificationRequestDB & { result?: VerificationResultDB }>;
    total: number;
  }>;
  
  // Analytics methods
  getVerificationStats(): Promise<{
    totalVerifications: number;
    verdadeiroCount: number;
    falsoCount: number;
    parcialCount: number;
    naoVerificavelCount: number;
  }>;
}

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await this.db.insert(usersTable).values(user).returning();
    return created;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(usersTable).where(eq(usersTable.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  // Verification methods
  async createVerificationRequest(request: InsertVerificationRequest, userId?: string): Promise<VerificationRequest & { id: string }> {
    const dbRequest: InsertVerificationRequestDB = {
      userId,
      inputType: request.inputType,
      content: request.content,
      url: request.url
    };
    
    const [created] = await this.db.insert(verificationRequestsTable).values(dbRequest).returning();
    return {
      id: created.id,
      inputType: created.inputType as "text" | "url",
      content: created.content,
      url: created.url || undefined
    };
  }

  async getVerificationRequest(id: string): Promise<VerificationRequest & { id: string } | undefined> {
    const [request] = await this.db.select().from(verificationRequestsTable).where(eq(verificationRequestsTable.id, id));
    if (!request) return undefined;
    
    return {
      id: request.id,
      inputType: request.inputType as "text" | "url",
      content: request.content,
      url: request.url || undefined
    };
  }

  async createVerificationResult(result: InsertVerificationResult, requestId: string): Promise<VerificationResult & { id: string }> {
    const dbResult: InsertVerificationResultDB = {
      requestId,
      classification: result.classification,
      confidencePercentage: result.confidence_percentage,
      confidenceLevel: result.confidence_level,
      explanation: result.explanation,
      temporalContext: result.temporal_context,
      detectedBias: result.detected_bias,
      sources: result.sources,
      observations: result.observations,
      processingTimeMs: result.processing_time_ms
    };

    const [created] = await this.db.insert(verificationResultsTable).values(dbResult).returning();
    return {
      id: created.id,
      classification: created.classification,
      confidence_percentage: created.confidencePercentage,
      confidence_level: created.confidenceLevel,
      explanation: created.explanation,
      temporal_context: created.temporalContext,
      detected_bias: created.detectedBias,
      sources: created.sources as any,
      observations: created.observations || undefined,
      processing_time_ms: created.processingTimeMs || undefined,
      timestamp: created.createdAt.toISOString()
    };
  }

  async getVerificationResult(id: string): Promise<VerificationResult & { id: string } | undefined> {
    const [result] = await this.db.select().from(verificationResultsTable).where(eq(verificationResultsTable.id, id));
    if (!result) return undefined;

    return {
      id: result.id,
      classification: result.classification,
      confidence_percentage: result.confidencePercentage,
      confidence_level: result.confidenceLevel,
      explanation: result.explanation,
      temporal_context: result.temporalContext,
      detected_bias: result.detectedBias,
      sources: result.sources as any,
      observations: result.observations || undefined,
      processing_time_ms: result.processingTimeMs || undefined,
      timestamp: result.createdAt.toISOString()
    };
  }

  // User verification history
  async getUserVerificationHistory(userId: string, limit: number = 10, offset: number = 0): Promise<{
    verifications: Array<VerificationRequestDB & { result?: VerificationResultDB }>;
    total: number;
  }> {
    // Get total count
    const [totalResult] = await this.db.select({ count: count() }).from(verificationRequestsTable).where(eq(verificationRequestsTable.userId, userId));
    
    // Get requests with results
    const requests = await this.db.select().from(verificationRequestsTable)
      .where(eq(verificationRequestsTable.userId, userId))
      .orderBy(desc(verificationRequestsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const verificationsWithResults = await Promise.all(
      requests.map(async (request) => {
        const [result] = await this.db.select().from(verificationResultsTable)
          .where(eq(verificationResultsTable.requestId, request.id));
        return { ...request, result };
      })
    );

    return {
      verifications: verificationsWithResults,
      total: totalResult.count
    };
  }

  async getVerificationStats() {
    const results = await this.db.select().from(verificationResultsTable);
    return {
      totalVerifications: results.length,
      verdadeiroCount: results.filter(r => r.classification === "VERDADEIRO").length,
      falsoCount: results.filter(r => r.classification === "FALSO").length,
      parcialCount: results.filter(r => r.classification === "PARCIALMENTE_VERDADEIRO").length,
      naoVerificavelCount: results.filter(r => r.classification === "NAO_VERIFICAVEL").length,
    };
  }
}

export const storage = new PostgresStorage();

import { 
  type VerificationRequest, 
  type VerificationResult,
  type InsertVerificationRequest,
  type InsertVerificationResultDB,
  type User,
  type InsertUser,
  type TokenUsageDB,
  type InsertTokenUsageDB,
  type VerificationRequestDB,
  type VerificationResultDB,
  type InsertVerificationRequestDB,
  type InsertVerificationResultDB,
  type DailyUsageDB,
  type InsertDailyUsageDB,
  usersTable,
  verificationRequestsTable,
  verificationResultsTable,
  dailyUsageTable,
  tokenUsageTable
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, count, and, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

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
  
  // Daily usage tracking methods
  checkDailyUsage(userId: string): Promise<number>;
  incrementDailyUsage(userId: string): Promise<void>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  public sessionStore: session.Store;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
    
    // Setup PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
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

  // User verification history with filtering
  async getUserVerificationHistory(
    userId: string, 
    limit: number = 10, 
    offset: number = 0,
    filters?: {
      classification?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{
    verifications: Array<VerificationRequestDB & { result?: VerificationResultDB }>;
    total: number;
  }> {
    // Build base conditions
    const conditions = [eq(verificationRequestsTable.userId, userId)];
    
    // Add date filters
    if (filters?.dateFrom) {
      conditions.push(gte(verificationRequestsTable.createdAt, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999); // Include the entire day
      conditions.push(lte(verificationRequestsTable.createdAt, dateTo));
    }
    
    // Build where clause
    const whereClause = and(...conditions);
    
    // Get requests based on filters
    let requestsQuery = this.db.select().from(verificationRequestsTable)
      .where(whereClause)
      .orderBy(desc(verificationRequestsTable.createdAt));
    
    // Apply search and classification filters after joining with results
    let requests = await requestsQuery;
    
    // Apply search filter to content and URL
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      requests = requests.filter(request => 
        request.content.toLowerCase().includes(searchLower) ||
        (request.url && request.url.toLowerCase().includes(searchLower))
      );
    }
    
    // Get results for all requests first
    const verificationsWithResults = await Promise.all(
      requests.map(async (request) => {
        const [result] = await this.db.select().from(verificationResultsTable)
          .where(eq(verificationResultsTable.requestId, request.id));
        return { ...request, result };
      })
    );
    
    // Apply classification filter
    let filteredVerifications = verificationsWithResults;
    if (filters?.classification) {
      filteredVerifications = verificationsWithResults.filter(verification => 
        verification.result?.classification === filters.classification
      );
    }
    
    // Calculate total after filtering
    const total = filteredVerifications.length;
    
    // Apply pagination
    const paginatedVerifications = filteredVerifications.slice(offset, offset + limit);

    return {
      verifications: paginatedVerifications,
      total
    };
  }

  // Get single verification by ID for a specific user
  async getVerificationByIdForUser(verificationId: string, userId: string): Promise<(VerificationRequestDB & { result?: VerificationResultDB }) | null> {
    const [request] = await this.db.select().from(verificationRequestsTable)
      .where(and(
        eq(verificationRequestsTable.id, verificationId),
        eq(verificationRequestsTable.userId, userId)
      ));
    
    if (!request) return null;
    
    const [result] = await this.db.select().from(verificationResultsTable)
      .where(eq(verificationResultsTable.requestId, request.id));
    
    return { ...request, result };
  }

  // Delete verification for a specific user
  async deleteVerificationForUser(verificationId: string, userId: string): Promise<boolean> {
    // First check if the verification belongs to the user
    const [request] = await this.db.select().from(verificationRequestsTable)
      .where(and(
        eq(verificationRequestsTable.id, verificationId),
        eq(verificationRequestsTable.userId, userId)
      ));
    
    if (!request) return false;
    
    // Delete the result first (due to foreign key constraint)
    await this.db.delete(verificationResultsTable)
      .where(eq(verificationResultsTable.requestId, verificationId));
    
    // Delete the request
    const deleteResult = await this.db.delete(verificationRequestsTable)
      .where(and(
        eq(verificationRequestsTable.id, verificationId),
        eq(verificationRequestsTable.userId, userId)
      ));
    
    return deleteResult.rowCount! > 0;
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

  // Daily usage tracking methods
  async checkDailyUsage(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const [usage] = await this.db.select().from(dailyUsageTable)
      .where(and(
        eq(dailyUsageTable.userId, userId),
        eq(dailyUsageTable.date, today)
      ));
    
    return usage?.verificationCount || 0;
  }

  async incrementDailyUsage(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Try to find existing record
    const [existingUsage] = await this.db.select().from(dailyUsageTable)
      .where(and(
        eq(dailyUsageTable.userId, userId),
        eq(dailyUsageTable.date, today)
      ));
    
    if (existingUsage) {
      // Update existing record
      await this.db.update(dailyUsageTable)
        .set({ 
          verificationCount: existingUsage.verificationCount + 1,
          updatedAt: new Date()
        })
        .where(eq(dailyUsageTable.id, existingUsage.id));
    } else {
      // Create new record
      await this.db.insert(dailyUsageTable).values({
        userId,
        date: today,
        verificationCount: 1
      });
    }
  }

  // Admin methods
  async getAllUsers() {
    const users = await this.db.select({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      isAdmin: usersTable.isAdmin,
      createdAt: usersTable.createdAt
    }).from(usersTable).orderBy(usersTable.createdAt);
    
    return users;
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
    const updateResult = await this.db.update(usersTable)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
      
    return updateResult.rowCount! > 0;
  }

  async getSystemStats() {
    const totalUsersQuery = this.db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const totalAdminsQuery = this.db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.isAdmin, true));
    const totalVerificationsQuery = this.db.select({ count: sql<number>`count(*)` }).from(verificationResultsTable);
    const totalRequestsQuery = this.db.select({ count: sql<number>`count(*)` }).from(verificationRequestsTable);

    const [totalUsers, totalAdmins, totalVerifications, totalRequests] = await Promise.all([
      totalUsersQuery,
      totalAdminsQuery,
      totalVerificationsQuery,
      totalRequestsQuery
    ]);

    return {
      totalUsers: totalUsers[0].count,
      totalAdmins: totalAdmins[0].count,
      totalVerifications: totalVerifications[0].count,
      totalRequests: totalRequests[0].count
    };
  }

  // Token usage tracking methods
  async trackTokenUsage(tokenData: InsertTokenUsageDB): Promise<void> {
    await this.db.insert(tokenUsageTable).values(tokenData);
  }

  async getTokenUsageStats(): Promise<{
    totalTokens: number;
    totalCost: number;
    avgTokensPerRequest: number;
    requestsCount: number;
  }> {
    const tokenStats = await this.db.select({
      totalTokens: sql<number>`sum(${tokenUsageTable.totalTokens})::int`,
      totalCost: sql<number>`sum(${tokenUsageTable.estimatedCostUsd})::float`,
      requestsCount: sql<number>`count(*)::int`
    }).from(tokenUsageTable);

    const stats = tokenStats[0] || { totalTokens: 0, totalCost: 0, requestsCount: 0 };
    const avgTokensPerRequest = stats.requestsCount > 0 ? stats.totalTokens / stats.requestsCount : 0;

    return {
      totalTokens: stats.totalTokens || 0,
      totalCost: stats.totalCost || 0,
      avgTokensPerRequest: Math.round(avgTokensPerRequest),
      requestsCount: stats.requestsCount || 0
    };
  }

  async getTokenUsageByUser(userId: string): Promise<TokenUsageDB[]> {
    return await this.db.select().from(tokenUsageTable)
      .where(eq(tokenUsageTable.userId, userId))
      .orderBy(desc(tokenUsageTable.createdAt));
  }
}

export const storage = new PostgresStorage();

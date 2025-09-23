import { 
  type VerificationRequest, 
  type VerificationResult,
  type InsertVerificationRequest,
  type InsertVerificationResult
} from "@shared/schema";
import { randomUUID } from "crypto";

// Enhanced storage interface for ValidaÍ
export interface IStorage {
  // Verification methods
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest & { id: string }>;
  getVerificationRequest(id: string): Promise<VerificationRequest & { id: string } | undefined>;
  createVerificationResult(result: InsertVerificationResult): Promise<VerificationResult & { id: string }>;
  getVerificationResult(id: string): Promise<VerificationResult & { id: string } | undefined>;
  
  // Analytics methods (for future use)
  getVerificationStats(): Promise<{
    totalVerifications: number;
    verdadeiroCount: number;
    falsoCount: number;
    parcialCount: number;
    naoVerificavelCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private verificationRequests: Map<string, VerificationRequest & { id: string }>;
  private verificationResults: Map<string, VerificationResult & { id: string }>;

  constructor() {
    this.verificationRequests = new Map();
    this.verificationResults = new Map();
  }

  async createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest & { id: string }> {
    const id = randomUUID();
    const verificationRequest: VerificationRequest & { id: string } = { ...request, id };
    this.verificationRequests.set(id, verificationRequest);
    return verificationRequest;
  }

  async getVerificationRequest(id: string): Promise<VerificationRequest & { id: string } | undefined> {
    return this.verificationRequests.get(id);
  }

  async createVerificationResult(result: InsertVerificationResult): Promise<VerificationResult & { id: string }> {
    const id = randomUUID();
    const verificationResult: VerificationResult & { id: string } = { 
      ...result, 
      id,
      timestamp: new Date().toISOString()
    };
    this.verificationResults.set(id, verificationResult);
    return verificationResult;
  }

  async getVerificationResult(id: string): Promise<VerificationResult & { id: string } | undefined> {
    return this.verificationResults.get(id);
  }

  async getVerificationStats() {
    const results = Array.from(this.verificationResults.values());
    return {
      totalVerifications: results.length,
      verdadeiroCount: results.filter(r => r.classification === "VERDADEIRO").length,
      falsoCount: results.filter(r => r.classification === "FALSO").length,
      parcialCount: results.filter(r => r.classification === "PARCIALMENTE_VERDADEIRO").length,
      naoVerificavelCount: results.filter(r => r.classification === "NAO_VERIFICAVEL").length,
    };
  }
}

export const storage = new MemStorage();

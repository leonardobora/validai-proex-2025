import { apiRequest } from "./queryClient";
import type { VerificationRequest, VerificationResponse } from "@shared/schema";

export const api = {
  // Verify content endpoint
  verifyContent: async (request: VerificationRequest): Promise<VerificationResponse> => {
    const response = await apiRequest("POST", "/api/verify", request);
    return response.json();
  },

  // Health check endpoint
  healthCheck: async () => {
    const response = await apiRequest("GET", "/api/health");
    return response.json();
  },

  // Statistics endpoint
  getStats: async () => {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  }
};

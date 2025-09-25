import { api } from '../lib/api';

// Mock the queryClient
jest.mock('../lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

const mockApiRequest = require('../lib/queryClient').apiRequest;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyContent', () => {
    it('should call verify endpoint with correct parameters', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            classification: 'VERDADEIRO',
            confidence_percentage: 90,
            confidence_level: 'ALTO',
            explanation: 'This information is verified as true',
            temporal_context: 'Current',
            detected_bias: 'None',
            sources: []
          }
        })
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const request = {
        inputType: 'text' as const,
        content: 'Test content to verify'
      };

      const result = await api.verifyContent(request);

      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/verify', request);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.classification).toBe('VERDADEIRO');
    });

    it('should handle URL verification request', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            classification: 'FALSO',
            confidence_percentage: 85,
            confidence_level: 'ALTO',
            explanation: 'This URL contains false information',
            temporal_context: 'Current',
            detected_bias: 'Detected bias',
            sources: [
              { name: 'Fact Check Site', description: 'Verification source' }
            ]
          }
        })
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const request = {
        inputType: 'url' as const,
        content: '',
        url: 'https://example.com/fake-news'
      };

      const result = await api.verifyContent(request);

      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/api/verify', request);
      expect(result.data?.classification).toBe('FALSO');
    });
  });

  describe('healthCheck', () => {
    it('should call health check endpoint', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          status: 'healthy',
          service: 'ValidaÍ',
          version: '1.0.0',
          timestamp: '2024-01-01T12:00:00Z'
        })
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await api.healthCheck();

      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/api/health');
      expect(result.status).toBe('healthy');
      expect(result.service).toBe('ValidaÍ');
    });
  });

  describe('getStats', () => {
    it('should call stats endpoint', async () => {
      const mockStats = {
        success: true,
        data: {
          totalVerifications: 100,
          verdadeiroCount: 40,
          falsoCount: 30,
          parcialCount: 20,
          naoVerificavelCount: 10
        }
      };

      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockStats)
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await api.getStats();

      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/api/stats');
      expect(result.success).toBe(true);
      expect(result.data?.totalVerifications).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      await expect(api.healthCheck()).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Internal server error'
        })
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await api.verifyContent({
        inputType: 'text',
        content: 'Test content'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });
});
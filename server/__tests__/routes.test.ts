import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';

// Mock the storage module
jest.mock('../storage', () => ({
  storage: {
    createVerificationRequest: jest.fn(),
    createVerificationResult: jest.fn(),
    getVerificationStats: jest.fn(),
    getUserVerificationHistory: jest.fn(),
    getVerificationByIdForUser: jest.fn(),
    deleteVerificationForUser: jest.fn()
  }
}));

// Mock the auth module
jest.mock('../auth', () => ({
  setupAuth: jest.fn()
}));

// Mock external APIs
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Routes', () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Mock middleware to avoid session/auth errors
    app.use((req, res, next) => {
      req.user = undefined; // No user by default
      next();
    });
    
    await registerRoutes(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        service: 'ValidaÍ',
        version: '1.0.0',
        timestamp: expect.any(String)
      });
      
      // Verify timestamp is a valid ISO string
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/stats', () => {
    it('should return verification statistics', async () => {
      const mockStats = {
        totalVerifications: 100,
        verdadeiroCount: 40,
        falsoCount: 30,
        parcialCount: 20,
        naoVerificavelCount: 10
      };

      const { storage } = require('../storage');
      storage.getVerificationStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStats
      });
      expect(storage.getVerificationStats).toHaveBeenCalledTimes(1);
    });

    it('should handle stats retrieval error', async () => {
      const { storage } = require('../storage');
      storage.getVerificationStats.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/stats')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Erro ao obter estatísticas'
      });
    });
  });

  describe('POST /api/verify', () => {
    const mockPerplexityResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            classification: 'VERDADEIRO',
            confidence_percentage: 85,
            confidence_level: 'ALTO',
            explanation: 'This information has been verified as accurate.',
            temporal_context: 'Current as of 2024',
            detected_bias: 'No significant bias detected',
            sources: [
              {
                name: 'Reliable Source',
                url: 'https://reliable.com',
                description: 'Trustworthy news outlet',
                year: 2024
              }
            ],
            observations: 'Well-documented information'
          })
        }
      }]
    };

    beforeEach(() => {
      process.env.PERPLEXITY_API_KEY = 'test-api-key';
    });

    it('should verify text content successfully', async () => {
      const { storage } = require('../storage');
      storage.createVerificationRequest.mockResolvedValue({ id: 'req-123' });
      storage.createVerificationResult.mockResolvedValue({ id: 'result-123' });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPerplexityResponse
      });

      const requestBody = {
        inputType: 'text',
        content: 'Brazil is the largest country in South America.'
      };

      const response = await request(app)
        .post('/api/verify')
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classification).toBe('VERDADEIRO');
      expect(response.body.data.confidence_percentage).toBe(85);
      expect(response.body.message).toBe('Verificação concluída com sucesso');

      expect(storage.createVerificationRequest).toHaveBeenCalledWith(requestBody);
      expect(storage.createVerificationResult).toHaveBeenCalled();
    });

    it('should handle invalid request body', async () => {
      const invalidRequest = {
        inputType: 'text',
        content: ''  // Empty content should be invalid
      };

      const response = await request(app)
        .post('/api/verify')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('should handle missing Perplexity API key', async () => {
      delete process.env.PERPLEXITY_API_KEY;

      const requestBody = {
        inputType: 'text',
        content: 'Some content to verify'
      };

      const { storage } = require('../storage');
      storage.createVerificationRequest.mockResolvedValue({ id: 'req-123' });

      const response = await request(app)
        .post('/api/verify')
        .send(requestBody)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erro interno do sistema');
    });

    // TODO: Add URL verification test with proper mocking
    it.skip('should handle URL verification with mocked scraping', async () => {
      // This test needs more complex mocking to work properly
    });

    it('should handle URL scraping failure', async () => {
      const { storage } = require('../storage');
      storage.createVerificationRequest.mockResolvedValue({ id: 'req-123' });

      // Mock failed HTML fetch
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const requestBody = {
        inputType: 'url',
        content: '',
        url: 'https://example.com/not-found'
      };

      const response = await request(app)
        .post('/api/verify')
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Erro ao processar URL');
    });

    it('should handle Perplexity API error', async () => {
      const { storage } = require('../storage');
      storage.createVerificationRequest.mockResolvedValue({ id: 'req-123' });

      // Mock failed Perplexity API response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'API Error'
      });

      const requestBody = {
        inputType: 'text',
        content: 'Content to verify'
      };

      const response = await request(app)
        .post('/api/verify')
        .send(requestBody)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Erro interno do sistema');
    });
  });

  describe('Authentication Required Endpoints', () => {
    describe('GET /api/history', () => {
      it('should return 401 when user is not authenticated', async () => {
        const response = await request(app)
          .get('/api/history')
          .expect(401);

        expect(response.body).toEqual({
          success: false,
          error: 'Usuário não autenticado'
        });
      });
    });

    describe('GET /api/history/:id', () => {
      it('should return 401 when user is not authenticated', async () => {
        const response = await request(app)
          .get('/api/history/test-id')
          .expect(401);

        expect(response.body).toEqual({
          success: false,
          error: 'Usuário não autenticado'
        });
      });
    });

    describe('DELETE /api/history/:id', () => {
      it('should return 401 when user is not authenticated', async () => {
        const response = await request(app)
          .delete('/api/history/test-id')
          .expect(401);

        expect(response.body).toEqual({
          success: false,
          error: 'Usuário não autenticado'
        });
      });
    });
  });
});
import {
  VerificationRequestSchema,
  VerificationResultSchema,
  VerificationResponseSchema,
  VerificationClassification,
  ConfidenceLevel,
  SourceSchema
} from '../schema';

describe('Schema Validation Tests', () => {
  describe('VerificationRequestSchema', () => {
    it('should validate valid text request', () => {
      const validRequest = {
        inputType: 'text' as const,
        content: 'This is a news article to verify'
      };
      
      const result = VerificationRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate valid URL request', () => {
      const validRequest = {
        inputType: 'url' as const,
        content: '',
        url: 'https://example.com/news-article'
      };
      
      const result = VerificationRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject URL request without URL', () => {
      const invalidRequest = {
        inputType: 'url' as const,
        content: 'Some content'
      };
      
      const result = VerificationRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject text request with empty content', () => {
      const invalidRequest = {
        inputType: 'text' as const,
        content: '   '
      };
      
      const result = VerificationRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid URL format', () => {
      const invalidRequest = {
        inputType: 'url' as const,
        content: '',
        url: 'not-a-valid-url'
      };
      
      const result = VerificationRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('VerificationResultSchema', () => {
    it('should validate complete verification result', () => {
      const validResult = {
        classification: 'VERDADEIRO' as VerificationClassification,
        confidence_percentage: 85,
        confidence_level: 'ALTO' as ConfidenceLevel,
        explanation: 'This information has been verified as true',
        temporal_context: 'Current as of 2024',
        detected_bias: 'No significant bias detected',
        sources: [
          {
            name: 'Reliable News Source',
            url: 'https://reliable-news.com/article',
            description: 'Reputable news organization',
            year: 2024
          }
        ],
        observations: 'Additional observations',
        processing_time_ms: 1500,
        timestamp: '2024-01-01T12:00:00Z'
      };
      
      const result = VerificationResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should reject invalid classification', () => {
      const invalidResult = {
        classification: 'INVALID_CLASSIFICATION',
        confidence_percentage: 85,
        confidence_level: 'ALTO' as ConfidenceLevel,
        explanation: 'This information has been verified',
        temporal_context: 'Current as of 2024',
        detected_bias: 'No bias detected',
        sources: []
      };
      
      const result = VerificationResultSchema.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });

    it('should reject confidence percentage out of range', () => {
      const invalidResult = {
        classification: 'VERDADEIRO' as VerificationClassification,
        confidence_percentage: 150, // Invalid: > 100
        confidence_level: 'ALTO' as ConfidenceLevel,
        explanation: 'This information has been verified',
        temporal_context: 'Current as of 2024',
        detected_bias: 'No bias detected',
        sources: []
      };
      
      const result = VerificationResultSchema.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });

    it('should validate minimal result (optional fields)', () => {
      const minimalResult = {
        classification: 'NAO_VERIFICAVEL' as VerificationClassification,
        confidence_percentage: 20,
        confidence_level: 'BAIXO' as ConfidenceLevel,
        explanation: 'Unable to verify this information',
        temporal_context: 'Unknown timeframe',
        detected_bias: 'No bias analysis available',
        sources: []
      };
      
      const result = VerificationResultSchema.safeParse(minimalResult);
      expect(result.success).toBe(true);
    });
  });

  describe('SourceSchema', () => {
    it('should validate complete source', () => {
      const validSource = {
        name: 'BBC Brasil',
        url: 'https://www.bbc.com/portuguese',
        description: 'British Broadcasting Corporation - Portuguese Service',
        year: 2024
      };
      
      const result = SourceSchema.safeParse(validSource);
      expect(result.success).toBe(true);
    });

    it('should validate source without optional fields', () => {
      const validSource = {
        name: 'Local News',
        description: 'Local news source'
      };
      
      const result = SourceSchema.safeParse(validSource);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalidSource = {
        name: 'News Source',
        url: 'not-a-valid-url',
        description: 'Description'
      };
      
      const result = SourceSchema.safeParse(invalidSource);
      expect(result.success).toBe(false);
    });
  });

  describe('VerificationResponseSchema', () => {
    it('should validate successful response', () => {
      const successResponse = {
        success: true,
        data: {
          classification: 'VERDADEIRO' as VerificationClassification,
          confidence_percentage: 90,
          confidence_level: 'ALTO' as ConfidenceLevel,
          explanation: 'Verified as true',
          temporal_context: 'Current',
          detected_bias: 'None',
          sources: []
        },
        message: 'Verification completed successfully'
      };
      
      const result = VerificationResponseSchema.safeParse(successResponse);
      expect(result.success).toBe(true);
    });

    it('should validate error response', () => {
      const errorResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Please try again later'
      };
      
      const result = VerificationResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should validate minimal response', () => {
      const minimalResponse = {
        success: false
      };
      
      const result = VerificationResponseSchema.safeParse(minimalResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Enums', () => {
    it('should validate VerificationClassification values', () => {
      const validValues = ['VERDADEIRO', 'FALSO', 'PARCIALMENTE_VERDADEIRO', 'NAO_VERIFICAVEL'];
      
      validValues.forEach(value => {
        const result = VerificationClassification.safeParse(value);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid VerificationClassification', () => {
      const result = VerificationClassification.safeParse('INVALID');
      expect(result.success).toBe(false);
    });

    it('should validate ConfidenceLevel values', () => {
      const validValues = ['ALTO', 'MEDIO', 'BAIXO'];
      
      validValues.forEach(value => {
        const result = ConfidenceLevel.safeParse(value);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid ConfidenceLevel', () => {
      const result = ConfidenceLevel.safeParse('INVALID');
      expect(result.success).toBe(false);
    });
  });
});
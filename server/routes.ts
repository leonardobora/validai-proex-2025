import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  VerificationRequestSchema, 
  VerificationResultSchema,
  type VerificationRequest,
  type VerificationResult,
  type VerificationResponse,
  type VerificationClassification,
  type ConfidenceLevel
} from "@shared/schema";

// Perplexity API integration
async function callPerplexityAPI(content: string, startTime: number): Promise<VerificationResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY não configurada");
  }

  const systemPrompt = `Você é ValidaÍ, sistema de verificação de notícias da UniBrasil. Analise a informação fornecida e retorne APENAS um JSON válido com esta estrutura exata:

{
  "classification": "VERDADEIRO|FALSO|PARCIALMENTE_VERDADEIRO|NAO_VERIFICAVEL",
  "confidence_percentage": 0-100,
  "confidence_level": "ALTO|MEDIO|BAIXO", 
  "explanation": "explicação detalhada em português brasileiro",
  "temporal_context": "contexto temporal das informações",
  "detected_bias": "análise de viés detectado",
  "sources": [
    {
      "name": "nome da fonte",
      "url": "url se disponível",
      "description": "descrição da fonte",
      "year": 2024
    }
  ],
  "observations": "observações importantes"
}

Diretrizes:
- Use linguagem acessível para adultos 30+
- Cite fontes brasileiras quando possível
- Seja neutro e didático
- Explique claramente o motivo da classificação
- Indique limitações da análise`;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system", 
          content: systemPrompt
        },
        {
          role: "user",
          content: `Analise esta informação: ${content}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.2,
      top_p: 0.9,
      return_related_questions: false,
      search_recency_filter: "month",
      stream: false
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Perplexity API Error ${response.status}:`, errorBody);
    throw new Error(`Erro na API Perplexity: ${response.status} ${response.statusText} - ${errorBody.substring(0, 200)}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  try {
    // Parse JSON response from AI
    const cleanedResponse = aiResponse.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    // Create candidate result with proper processing time
    const candidateResult = {
      classification: parsed.classification,
      confidence_percentage: parsed.confidence_percentage,
      confidence_level: parsed.confidence_level,
      explanation: parsed.explanation || "Análise não disponível",
      temporal_context: parsed.temporal_context || "Contexto temporal não determinado",
      detected_bias: parsed.detected_bias || "Análise de viés não disponível", 
      sources: parsed.sources || [],
      observations: parsed.observations,
      processing_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    // Validate against schema
    const validationResult = VerificationResultSchema.safeParse(candidateResult);
    
    if (validationResult.success) {
      return validationResult.data;
    } else {
      console.error("Schema validation failed for Perplexity response:", validationResult.error);
      // Fall through to fallback
    }
  } catch (parseError) {
    console.error("JSON parsing failed for Perplexity response:", parseError);
  }

  // Fallback for any validation or parsing errors
  return {
    classification: "NAO_VERIFICAVEL",
    confidence_percentage: 0,
    confidence_level: "BAIXO",
    explanation: "Não foi possível processar a resposta da análise de IA. Tente novamente.",
    temporal_context: "Não determinado",
    detected_bias: "Não analisado",
    sources: [],
    observations: "Erro de processamento - resposta não estruturada",
    processing_time_ms: Date.now() - startTime,
    timestamp: new Date().toISOString()
  };
}

// Firecrawl integration for URL scraping
async function scrapeURL(url: string): Promise<string> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  
  if (!firecrawlKey) {
    // Fallback: simple fetch if Firecrawl not available
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ValidaI-Bot/1.0'
        }
      });
      const html = await response.text();
      // Basic text extraction (in production, use proper HTML parsing)
      const textContent = html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return textContent.substring(0, 5000); // Limit content
    } catch (error) {
      throw new Error(`Erro ao acessar URL: ${error}`);
    }
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true
      })
    });

    if (!response.ok) {
      throw new Error(`Erro Firecrawl: ${response.status}`);
    }

    const data = await response.json();
    return data.markdown || data.content || "";
  } catch (error) {
    throw new Error(`Erro ao extrair conteúdo da URL: ${error}`);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      service: "ValidaÍ",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  });

  // Statistics endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getVerificationStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Erro ao obter estatísticas" 
      });
    }
  });

  // Main verification endpoint
  app.post("/api/verify", async (req, res) => {
    const startTime = Date.now();

    try {
      // Validate request body
      const validationResult = VerificationRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          message: validationResult.error.errors.map(e => e.message).join(", ")
        });
      }

      const verificationRequest = validationResult.data;
      
      // Store the request
      const storedRequest = await storage.createVerificationRequest(verificationRequest);

      let contentToAnalyze = "";

      // Process input based on type
      if (verificationRequest.inputType === "url" && verificationRequest.url) {
        try {
          contentToAnalyze = await scrapeURL(verificationRequest.url);
          if (!contentToAnalyze.trim()) {
            return res.status(400).json({
              success: false,
              error: "Não foi possível extrair conteúdo da URL fornecida"
            });
          }
        } catch (scrapeError) {
          return res.status(400).json({
            success: false,
            error: `Erro ao processar URL: ${scrapeError}`
          });
        }
      } else {
        contentToAnalyze = verificationRequest.content;
      }

      // Verify content with Perplexity
      const verificationResult = await callPerplexityAPI(contentToAnalyze, startTime);

      // Store the result
      const storedResult = await storage.createVerificationResult(verificationResult, storedRequest.id);

      const response: VerificationResponse = {
        success: true,
        data: verificationResult,
        message: "Verificação concluída com sucesso"
      };

      res.json(response);

    } catch (error) {
      console.error("Verification error:", error);
      
      const response: VerificationResponse = {
        success: false,
        error: "Erro interno do sistema",
        message: "Tente novamente em alguns minutos"
      };

      res.status(500).json(response);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

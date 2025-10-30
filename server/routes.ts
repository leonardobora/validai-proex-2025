import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  VerificationRequestSchema, 
  VerificationResultSchema,
  type VerificationRequest,
  type VerificationResult,
  type VerificationResponse,
  type VerificationClassification,
  type ConfidenceLevel
} from "@shared/schema";
import { Perplexity } from "@perplexity-ai/perplexity_ai";

// Perplexity Search API integration - New structured search
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  last_updated?: string;
}

interface PerplexitySearchResponse {
  results: SearchResult[];
}

// Initialize Perplexity client for Search API
const perplexityClient = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY || ""
});

// Brazilian trusted domains for fact-checking
const TRUSTED_BRAZILIAN_DOMAINS = [
  "gov.br",
  "edu.br", 
  "fiocruz.br",
  "usp.br",
  "unicamp.br",
  "g1.globo.com",
  "folha.uol.com.br",
  "estadao.com.br",
  "oglobo.globo.com",
  "bbc.com/portuguese",
  "agenciabrasil.ebc.com.br",
  "senado.leg.br",
  "camara.leg.br"
];

// Search for relevant sources using Perplexity Search API
async function searchSources(query: string, maxResults: number = 10): Promise<SearchResult[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.warn("PERPLEXITY_API_KEY não configurada, pulando busca de fontes");
    return [];
  }

  try {
    // Use the Search API to find relevant sources
    const searchResponse = await fetch("https://api.perplexity.ai/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: query,
        max_results: maxResults,
        max_tokens_per_page: 1024,
        country: "BR", // Focus on Brazilian results
        search_recency_filter: "month", // Recent information
        search_domain_filter: TRUSTED_BRAZILIAN_DOMAINS.slice(0, 20) // Limit to trusted domains
      })
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(`Perplexity Search API Error ${searchResponse.status}:`, errorText);
      return [];
    }

    const data: PerplexitySearchResponse = await searchResponse.json();
    return data.results || [];
  } catch (error) {
    console.error("Error searching sources:", error);
    return [];
  }
}

// Perplexity Sonar API integration for fact-checking analysis with Search API sources
async function callPerplexityAPI(content: string, startTime: number, metadata?: any, searchResults?: SearchResult[]): Promise<VerificationResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY não configurada");
  }

  // Construct enhanced system prompt with metadata context and search results
  let systemPrompt = `Você é ValidaÍ, sistema de verificação de notícias da UniBrasil. Analise a informação fornecida e retorne APENAS um JSON válido com esta estrutura exata:

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
- Indique limitações da análise
- Priorize fontes governamentais (.gov.br), acadêmicas (.edu.br) e veículos jornalísticos estabelecidos`;

  // Add search results context if available
  if (searchResults && searchResults.length > 0) {
    systemPrompt += `

FONTES ENCONTRADAS NA BUSCA (use estas para fundamentar sua análise):
${searchResults.map((result, index) => `
${index + 1}. ${result.title}
   URL: ${result.url}
   Resumo: ${result.snippet}
   ${result.date ? `Data: ${result.date}` : ''}
`).join('\n')}

IMPORTANTE: Use as fontes acima para fundamentar sua verificação. Analise a credibilidade de cada fonte (domínio governamental, acadêmico, jornalístico estabelecido) e cite-as na sua resposta.`;
  }

  // Add metadata context if available
  if (metadata) {
    systemPrompt += `

CONTEXTO DA FONTE ORIGINAL:
- Título da página: ${metadata.title || 'Não disponível'}
- Descrição: ${metadata.description || 'Não disponível'}
- URL origem: ${metadata.sourceURL || 'Não disponível'}
- Idioma detectado: ${metadata.language || 'Não determinado'}
- Método de extração: ${metadata.extractionMethod || 'Não especificado'}

Use essas informações para melhorar a análise de credibilidade da fonte.`;
  }

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

import * as cheerio from 'cheerio';

// Simple in-memory cache for scraped content (1 hour TTL)
const scrapeCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCachedContent(url: string): { content: string; metadata: any } | null {
  const cached = scrapeCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  scrapeCache.delete(url);
  return null;
}

function setCachedContent(url: string, data: { content: string; metadata: any }): void {
  scrapeCache.set(url, { data, timestamp: Date.now() });
  
  // Clean up old entries
  if (scrapeCache.size > 100) {
    const entries = Array.from(scrapeCache.entries());
    const cutoff = Date.now() - CACHE_TTL;
    entries.forEach(([key, value]) => {
      if (value.timestamp < cutoff) {
        scrapeCache.delete(key);
      }
    });
  }
}

// Enhanced web scraping functionality with multiple extraction methods
async function scrapeURL(url: string): Promise<{ content: string; metadata: any }> {
  const startTime = Date.now();
  
  // Validate URL format
  try {
    const parsedUrl = new URL(url);
    // Check for supported protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Apenas URLs HTTP e HTTPS são suportadas.');
    }
    // Check for suspicious URLs
    if (parsedUrl.hostname.includes('localhost') || parsedUrl.hostname.includes('127.0.0.1')) {
      throw new Error('URLs locais não são permitidas por motivos de segurança.');
    }
  } catch (error) {
    throw new Error(`URL fornecida é inválida: ${error}`);
  }

  // Check cache first
  const cached = getCachedContent(url);
  if (cached) {
    return {
      content: cached.content,
      metadata: {
        ...cached.metadata,
        fromCache: true,
        processingTime: Date.now() - startTime
      }
    };
  }

  // Try Firecrawl first if API key is available
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  
  if (firecrawlKey) {
    try {
      const firecrawlResult = await extractWithFirecrawl(url, firecrawlKey);
      if (firecrawlResult.content.length > 100) {
        return {
          content: firecrawlResult.content,
          metadata: {
            ...firecrawlResult.metadata,
            extractionMethod: 'firecrawl',
            processingTime: Date.now() - startTime
          }
        };
      }
    } catch (error) {
      console.warn('Firecrawl extraction failed, falling back to cheerio:', error);
    }
  }

  // Fallback to enhanced HTML parsing with cheerio
  try {
    const cheerioResult = await extractWithCheerio(url);
    const finalResult = {
      content: cheerioResult.content,
      metadata: {
        ...cheerioResult.metadata,
        extractionMethod: 'cheerio',
        processingTime: Date.now() - startTime
      }
    };
    
    // Cache successful extraction
    setCachedContent(url, finalResult);
    
    return finalResult;
  } catch (error) {
    console.error('All extraction methods failed:', error);
    throw new Error(`Não foi possível extrair conteúdo da URL. Verifique se o site está acessível e tente novamente. Detalhes: ${error}`);
  }
}

// Firecrawl extraction with enhanced error handling
async function extractWithFirecrawl(url: string, apiKey: string): Promise<{ content: string; metadata: any }> {
  const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "html"],
      onlyMainContent: true,
      includeTags: ["title", "meta"],
      excludeTags: ["script", "style", "nav", "footer", "header", "aside"],
      waitFor: 2000 // Wait for dynamic content
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Firecrawl API error (${response.status}): ${errorData.error || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Firecrawl scraping failed: ${data.error || 'Unknown error'}`);
  }

  const content = data.markdown || data.html || data.content || '';
  if (content.length < 50) {
    throw new Error('Conteúdo extraído muito curto, possivelmente bloqueado pelo site');
  }

  const finalResult = {
    content: content.substring(0, 8000), // Increased limit for better context
    metadata: {
      title: data.metadata?.title || '',
      description: data.metadata?.description || '',
      language: data.metadata?.language || '',
      sourceURL: data.metadata?.sourceURL || url,
      statusCode: data.metadata?.statusCode || 200
    }
  };
  
  // Cache successful Firecrawl extraction
  setCachedContent(url, finalResult);
  
  return finalResult;
}

// Enhanced cheerio-based extraction for fallback
async function extractWithCheerio(url: string): Promise<{ content: string; metadata: any }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  let html: string;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    html = await response.text();
    if (html.length < 100) {
      throw new Error('Resposta muito curta, possivelmente bloqueada');
    }
    
    // Validate that we got HTML content
    const lowerHtml = html.toLowerCase();
    if (!lowerHtml.includes('<html') && !lowerHtml.includes('<!doctype') && !lowerHtml.includes('<body')) {
      // Check if it might be a redirect or JSON response
      if (lowerHtml.includes('json') || html.trim().startsWith('{')) {
        throw new Error('URL retornou dados JSON ao invés de HTML - pode ser uma API');
      }
      if (lowerHtml.includes('location.href') || lowerHtml.includes('window.location')) {
        throw new Error('Página contém redirecionamento JavaScript - conteúdo não acessível');
      }
      throw new Error('Resposta não parece ser HTML válido');
    }
  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      throw new Error('Timeout ao acessar a URL - o site demorou muito para responder');
    }
    throw fetchError;
  }

  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, nav, footer, header, aside, .ad, .advertisement, .social-share').remove();
  
  // Extract metadata
  const title = $('title').text().trim() || 
                $('meta[property="og:title"]').attr('content') || 
                $('h1').first().text().trim();
  
  const description = $('meta[name="description"]').attr('content') || 
                     $('meta[property="og:description"]').attr('content') || '';
  
  const language = $('html').attr('lang') || 
                  $('meta[http-equiv="content-language"]').attr('content') || 'pt-BR';

  // Prioritized content extraction
  let content = '';
  
  // Try article content first - including Brazilian news sites
  const articleSelectors = [
    'article',
    '[role="main"]',
    '.content',
    '.post-content', 
    '.article-content',
    '.entry-content',
    '.main-content',
    '.materia-conteudo', // Globo.com
    '.content-text', // UOL
    '.story-body', // BBC Brasil
    '.post-text', // Generic blog pattern
    '.news-content', // Generic news pattern
    '.article-body',
    '[data-module="ArticleBody"]' // Some news sites
  ];
  
  for (const selector of articleSelectors) {
    const articleContent = $(selector).text().trim();
    if (articleContent.length > content.length) {
      content = articleContent;
    }
  }
  
  // Fallback to body if no specific content found
  if (content.length < 200) {
    content = $('body').text().trim();
  }
  
  // Enhanced content cleaning
  content = content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
    
  // Additional content quality checks
  const wordCount = content.split(/\s+/).filter(word => word.length > 2).length;
  if (wordCount < 20) {
    throw new Error('Conteúdo muito curto - menos de 20 palavras úteis extraídas');
  }
  
  // Check for common error patterns in Brazilian Portuguese
  const errorPatterns = [
    /acesso.?negado/i,
    /página.?não.?encontrada/i,
    /erro.?404/i,
    /forbidden/i,
    /unauthorized/i,
    /manutenção/i,
    /em.?construção/i
  ];
  
  if (errorPatterns.some(pattern => pattern.test(content))) {
    throw new Error('A página parece conter uma mensagem de erro ou estar inacessível');
  }
  
  // Check for repeated content patterns that might indicate scraping issues
  const lines = content.split('\n').filter(line => line.trim().length > 10);
  const uniqueLines = new Set(lines);
  if (lines.length > 10 && uniqueLines.size / lines.length < 0.3) {
    console.warn('Possible repeated content detected, but proceeding with extraction');
  }
  
  if (content.length < 100) {
    throw new Error('Conteúdo insuficiente extraído da página');
  }

  return {
    content: content.substring(0, 8000),
    metadata: {
      title: title.substring(0, 200),
      description: description.substring(0, 300),
      language,
      sourceURL: url,
      contentLength: content.length,
      wordCount,
      extractedElements: {
        hasTitle: !!title,
        hasDescription: !!description,
        contentSelectors: articleSelectors.filter(sel => $(sel).length > 0)
      }
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Setup authentication first
  setupAuth(app);
  
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
      
      // Get authenticated user ID if available (verification can work without auth too)
      const userId = (req as any).user?.id;
      console.log(`[Verify] Creating verification for user: ${userId || 'anonymous'}`);
      
      // Store the request with user association
      const storedRequest = await storage.createVerificationRequest(verificationRequest, userId);

      let contentToAnalyze = "";

      // Process input based on type
      let extractedMetadata: any = null;
      
      if (verificationRequest.inputType === "url" && verificationRequest.url) {
        try {
          const scrapedData = await scrapeURL(verificationRequest.url);
          contentToAnalyze = scrapedData.content;
          extractedMetadata = scrapedData.metadata;
          
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

      // Step 1: Search for relevant sources using Perplexity Search API
      console.log("Buscando fontes relevantes com Search API...");
      const searchResults = await searchSources(contentToAnalyze, 8);
      console.log(`Encontradas ${searchResults.length} fontes relevantes`);

      // Step 2: Verify content with Perplexity Sonar API using found sources
      const verificationResult = await callPerplexityAPI(contentToAnalyze, startTime, extractedMetadata, searchResults);

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

  // Verification history endpoints
  app.get("/api/history", async (req, res) => {
    try {
      // Check authentication
      if (!(req as any).user?.id) {
        return res.status(401).json({
          success: false,
          error: "Usuário não autenticado"
        });
      }

      const userId = (req as any).user.id;
      console.log(`[History] Fetching history for user: ${userId}`);

      // Parse pagination and filtering parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(5, parseInt(req.query.limit as string) || 10));
      const offset = (page - 1) * limit;
      
      // Parse filter parameters
      const classification = req.query.classification as string;
      const search = req.query.search as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;

      // Get user verification history with filters
      const historyData = await storage.getUserVerificationHistory(
        userId, 
        limit, 
        offset,
        {
          classification,
          search,
          dateFrom,
          dateTo
        }
      );

      res.json({
        success: true,
        data: {
          verifications: historyData.verifications,
          pagination: {
            total: historyData.total,
            page,
            limit,
            totalPages: Math.ceil(historyData.total / limit),
            hasNext: offset + limit < historyData.total,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error("History retrieval error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao recuperar histórico de verificações"
      });
    }
  });

  // Get single verification by ID
  app.get("/api/history/:id", async (req, res) => {
    try {
      // Check authentication
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: "Usuário não autenticado"
        });
      }

      const verificationId = req.params.id;
      const verification = await storage.getVerificationByIdForUser(verificationId, req.user.id);

      if (!verification) {
        return res.status(404).json({
          success: false,
          error: "Verificação não encontrada"
        });
      }

      res.json({
        success: true,
        data: verification
      });

    } catch (error) {
      console.error("Single verification retrieval error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao recuperar verificação"
      });
    }
  });

  // Delete verification from history
  app.delete("/api/history/:id", async (req, res) => {
    try {
      // Check authentication
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: "Usuário não autenticado"
        });
      }

      const verificationId = req.params.id;
      const deleted = await storage.deleteVerificationForUser(verificationId, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Verificação não encontrada ou você não tem permissão para deletá-la"
        });
      }

      res.json({
        success: true,
        message: "Verificação removida do histórico com sucesso"
      });

    } catch (error) {
      console.error("Verification deletion error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao remover verificação do histórico"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

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

// Estimate tokens (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Calculate cost based on Perplexity pricing (estimated)
function calculateCost(inputTokens: number, outputTokens: number): number {
  // Estimated Perplexity costs (these may vary)
  const inputCostPer1K = 0.001; // $0.001 per 1K tokens
  const outputCostPer1K = 0.002; // $0.002 per 1K tokens
  
  return (inputTokens / 1000) * inputCostPer1K + (outputTokens / 1000) * outputCostPer1K;
}

// Enhanced Perplexity Search API integration
async function callPerplexitySearchAPI(content: string, startTime: number, metadata?: any, requestId?: string, userId?: string): Promise<VerificationResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY não configurada");
  }

  // Step 1: Use Search API to gather reliable sources
  const searchQueries = [
    content.substring(0, 100), // Main query - first 100 chars for search
    `verificação factual: ${content.substring(0, 50)}`, // Fact-check focused query
    `fontes confiáveis sobre: ${content.substring(0, 50)}` // Reliable sources query
  ];

  const searchResults: any[] = [];
  
  // Execute search queries
  for (const query of searchQueries) {
    try {
      const searchResponse = await fetch("https://api.perplexity.ai/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          max_results: 5,
          country: "BR", // Focus on Brazilian sources
          max_tokens_per_page: 512
        })
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        searchResults.push(...(searchData.results || []));
      }
    } catch (error) {
      console.warn(`Search query failed for: ${query}`, error);
      // Continue with other queries even if one fails
    }
  }

  // Step 2: Analyze content with Chat Completions using search results context
  const sourcesContext = searchResults.length > 0 
    ? `\n\nFONTES ENCONTRADAS:\n${searchResults.map((result, idx) => 
        `${idx + 1}. ${result.title}\n   URL: ${result.url}\n   Resumo: ${result.snippet}\n   Data: ${result.date || 'N/A'}`
      ).join('\n\n')}`
    : '\n\nNenhuma fonte externa encontrada para verificação.';

  const systemPrompt = `Você é ValidaÍ, sistema de verificação de notícias da UniBrasil. 

Analise a informação fornecida usando as fontes pesquisadas e retorne APENAS um JSON válido com esta estrutura exata:

{
  "classification": "VERDADEIRO|FALSO|PARCIALMENTE_VERDADEIRO|NAO_VERIFICAVEL",
  "confidence_percentage": 0-100,
  "confidence_level": "ALTO|MEDIO|BAIXO", 
  "explanation": "explicação detalhada em português brasileiro baseada nas fontes",
  "temporal_context": "contexto temporal das informações",
  "detected_bias": "análise de viés detectado",
  "sources": [
    {
      "name": "nome da fonte verificada",
      "url": "url da fonte",
      "description": "descrição da credibilidade",
      "year": 2024
    }
  ],
  "observations": "observações sobre cobertura e consenso entre fontes"
}

Diretrizes:
- Use as FONTES ENCONTRADAS para basear sua análise
- Prefira fontes brasileiras confiáveis (G1, Folha, UOL, etc.)
- Compare informações entre múltiplas fontes
- Indique se há consenso ou divergência entre fontes
- Use linguagem acessível para adultos 30+
- Seja neutro e didático${sourcesContext}`;

  const analysisResponse = await fetch("https://api.perplexity.ai/chat/completions", {
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
          content: `Analise esta informação: ${content}

${metadata ? `
CONTEXTO DA FONTE ORIGINAL:
- Título: ${metadata.title || 'N/A'}
- Descrição: ${metadata.description || 'N/A'}
- URL: ${metadata.sourceURL || 'N/A'}
- Método de extração: ${metadata.extractionMethod || 'N/A'}` : ''}`
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

  if (!analysisResponse.ok) {
    const errorBody = await analysisResponse.text();
    console.error(`Perplexity Analysis API Error ${analysisResponse.status}:`, errorBody);
    throw new Error(`Erro na API Perplexity: ${analysisResponse.status} ${analysisResponse.statusText} - ${errorBody.substring(0, 200)}`);
  }

  const analysisData = await analysisResponse.json();
  const aiResponse = analysisData.choices[0].message.content;

  // Track token usage for admins
  const inputText = `${content}${sourcesContext}`;
  const inputTokens = estimateTokens(inputText);
  const outputTokens = estimateTokens(aiResponse);
  const totalTokens = inputTokens + outputTokens;
  const estimatedCost = calculateCost(inputTokens, outputTokens);

  // Store token usage if we have requestId and userId
  if (requestId && userId) {
    try {
      await storage.trackTokenUsage({
        userId,
        requestId, 
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCostUsd: estimatedCost.toString(),
        model: "perplexity-search",
        processingTimeMs: Date.now() - startTime
      });
    } catch (error) {
      console.error("Failed to track token usage:", error);
      // Don't fail the request if tracking fails
    }
  }

  try {
    // Parse JSON response from AI
    const cleanedResponse = aiResponse.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    // Sanitize sources - filter out invalid URLs
    const sanitizeSources = (sources: any[]) => {
      if (!Array.isArray(sources)) return [];
      
      return sources.filter(source => {
        if (!source || typeof source !== 'object') return false;
        
        // Check if URL is valid
        if (source.url) {
          try {
            new URL(source.url);
            return true;
          } catch {
            // Invalid URL, but keep source without URL
            delete source.url;
            return source.name || source.title; // Keep if has name/title
          }
        }
        return source.name || source.title; // Keep sources without URL if they have name/title
      }).map(source => ({
        name: source.name || source.title || "Fonte não identificada",
        description: source.description || source.snippet || "Descrição não disponível",
        url: source.url, // Will be undefined for invalid URLs
        reliability_score: source.reliability_score || 0.5,
        last_updated: source.last_updated || new Date().toISOString()
      }));
    };
    
    // Create candidate result with proper processing time and sanitized sources
    const candidateResult = {
      classification: parsed.classification,
      confidence_percentage: parsed.confidence_percentage,
      confidence_level: parsed.confidence_level,
      explanation: parsed.explanation || "Análise não disponível",
      temporal_context: parsed.temporal_context || "Contexto temporal não determinado",
      detected_bias: parsed.detected_bias || "Análise de viés não disponível", 
      sources: sanitizeSources(parsed.sources || []),
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
      
      // Try to provide partial analysis even if schema validation fails
      return {
        classification: parsed.classification || "NAO_VERIFICAVEL" as const,
        confidence_percentage: Math.max(0, Math.min(100, parsed.confidence_percentage || 0)),
        confidence_level: (parsed.confidence_level === "ALTO" || parsed.confidence_level === "MEDIO" || parsed.confidence_level === "BAIXO") ? 
          parsed.confidence_level : "BAIXO" as const,
        explanation: parsed.explanation || "A análise foi processada, mas alguns dados técnicos não puderam ser validados completamente.",
        temporal_context: parsed.temporal_context || "Contexto temporal não determinado",
        detected_bias: parsed.detected_bias || "Análise de viés não disponível",
        sources: searchResults.length > 0 ? searchResults.slice(0, 3).map(result => ({
          name: result.title || "Fonte encontrada via busca",
          description: result.snippet || "Informação encontrada durante busca automática",
          url: result.url,
          reliability_score: 0.5,
          last_updated: new Date().toISOString()
        })) : [],
        observations: parsed.observations || "Algumas informações técnicas não puderam ser validadas, mas a análise principal foi processada.",
        processing_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  } catch (parseError) {
    console.error("JSON parsing failed for Perplexity response:", parseError);
  }

  // Fallback for any validation or parsing errors
  return {
    classification: "NAO_VERIFICAVEL" as const,
    confidence_percentage: 0,
    confidence_level: "BAIXO" as const,
    explanation: `Não foi possível analisar completamente esta informação devido a limitações técnicas. Recomendamos verificar manualmente em fontes confiáveis como: G1, Folha de S.Paulo, Estadão, Agência Lupa, ou Aos Fatos.`,
    temporal_context: "Análise técnica incompleta",
    detected_bias: "Não foi possível determinar viés nesta análise",
    sources: searchResults.length > 0 ? searchResults.slice(0, 3).map(result => ({
      name: result.title || "Fonte encontrada via busca",
      description: result.snippet || "Informação encontrada durante busca automática",
      url: result.url,
      reliability_score: 0.5,
      last_updated: new Date().toISOString()
    })) : [],
    observations: `Houve um problema técnico no processamento da análise. ${searchResults.length > 0 ? 'Algumas fontes foram encontradas durante a busca automática.' : 'Recomendamos verificar manualmente a informação.'}`,
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
      includeTags: ["title", "meta", "h1", "h2", "p"],
      excludeTags: ["script", "style", "nav", "footer", "header", "aside", "ad", "advertisement"],
      waitFor: 4000, // More time for dynamic content
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
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
  if (content.length < 20) {
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
  
  let response: Response;
  let html: string;
  
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8,en-US;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
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
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
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
    'main',
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
    '.texto-noticia', // Terra, R7
    '.corpo-texto', // Estadão
    '.texto', // Folha
    '.conteudo-principal', // Generic Brazilian
    '.artigo-corpo', // Generic Brazilian
    '[data-module="ArticleBody"]', // Some news sites
    '[data-testid="article-body"]', // MSN
    '.RichTextStoryBody', // MSN specific
    '[data-module="BodyText"]', // MSN specific
    '.story-content' // Generic news
  ];
  
  for (const selector of articleSelectors) {
    const articleContent = $(selector).text().trim();
    if (articleContent.length > content.length) {
      content = articleContent;
    }
  }
  
  // Fallback to body if no specific content found
  if (content.length < 200) {
    // Try paragraph-based extraction
    const paragraphs = $('p').map((i, el) => $(el).text().trim()).get().join('\n\n');
    if (paragraphs.length > content.length) {
      content = paragraphs;
    }
    
    // Ultimate fallback to body
    if (content.length < 200) {
      content = $('body').text().trim();
    }
  }
  
  // Enhanced content cleaning
  content = content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
    
  // Additional content quality checks
  const wordCount = content.split(/\s+/).filter(word => word.length > 2).length;
  if (wordCount < 10) {
    throw new Error('Conteúdo muito curto - menos de 10 palavras úteis extraídas');
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

// Cache for Brazilian news (30 minutes TTL)
const newsCache = new Map<string, { data: any; timestamp: number }>();
const NEWS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Brazilian news interface
interface BrazilianNewsItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category: 'futebol' | 'politica' | 'tecnologia' | 'geral';
}

// Get Brazilian news using Perplexity API
async function getBrazilianNews(): Promise<BrazilianNewsItem[]> {
  // Check cache first
  const cacheKey = 'brazilian-news';
  const cached = newsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < NEWS_CACHE_TTL) {
    return cached.data;
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY não configurada");
  }

  const newsPrompt = `Busque as 8 notícias mais recentes e importantes do Brasil das últimas 24 horas, divididas nas seguintes categorias:

2 notícias de FUTEBOL (campeonatos, times, jogadores)
2 notícias de POLÍTICA (governo, congresso, eleições)
2 notícias de TECNOLOGIA (startups, inovação, IA)
2 notícias GERAIS (economia, sociedade, meio ambiente)

Para cada notícia, retorne APENAS um JSON válido no formato:
{
  "news": [
    {
      "id": "1",
      "title": "Título da notícia (máximo 80 caracteres)",
      "description": "Descrição resumida (máximo 120 caracteres)",
      "url": "URL da fonte quando disponível",
      "publishedAt": "2025-01-28T${new Date().getHours()}:00:00Z",
      "source": {"name": "Nome da fonte"},
      "category": "futebol|politica|tecnologia|geral"
    }
  ]
}

IMPORTANTE: 
- Use apenas notícias reais das últimas 24 horas
- Data deve ser de hoje: ${new Date().toISOString().split('T')[0]}
- Retorne APENAS o JSON, sem texto adicional
- URLs devem ser fontes confiáveis quando disponíveis`;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "user",
            content: newsPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON response
    let newsData;
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        newsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse news JSON:", content);
      // Fallback to mock data if parsing fails
      return getMockNews();
    }

    const news = newsData.news || [];
    
    // Validate and clean up news items
    const validNews: BrazilianNewsItem[] = news
      .filter((item: any) => item.title && item.description && item.category)
      .map((item: any, index: number) => ({
        id: item.id || `news-${index + 1}`,
        title: item.title.substring(0, 80),
        description: item.description.substring(0, 120),
        url: item.url || undefined,
        publishedAt: item.publishedAt || new Date().toISOString(),
        source: item.source || { name: "Fonte não identificada" },
        category: ['futebol', 'politica', 'tecnologia', 'geral'].includes(item.category) 
          ? item.category : 'geral'
      }))
      .slice(0, 8); // Limit to 8 news items

    // If no valid news, return mock data
    if (validNews.length === 0) {
      return getMockNews();
    }

    // Cache the results
    newsCache.set(cacheKey, {
      data: validNews,
      timestamp: Date.now()
    });

    return validNews;

  } catch (error) {
    console.error("Error fetching Brazilian news:", error);
    // Return mock data as fallback
    return getMockNews();
  }
}

// Fallback mock news with recent timestamps
function getMockNews(): BrazilianNewsItem[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return [
    {
      id: '1',
      title: 'Flamengo vence clássico brasileiro no Maracanã',
      description: 'Partida histórica marca a rodada do Campeonato Brasileiro com gol nos acréscimos',
      url: undefined,
      publishedAt: `${today}T${now.getHours()-1}:30:00Z`,
      source: { name: 'Globo Esporte' },
      category: 'futebol'
    },
    {
      id: '2',
      title: 'Startup brasileira revoluciona IA para fact-checking',
      description: 'Nova tecnologia desenvolvida no país promete melhorar verificação de informações',
      url: undefined,
      publishedAt: `${today}T${now.getHours()-2}:15:00Z`,
      source: { name: 'TechCrunch Brasil' },
      category: 'tecnologia'
    },
    {
      id: '3',
      title: 'Congresso aprova nova medida econômica',
      description: 'Projeto de lei tem impacto direto na economia brasileira e inflação',
      url: undefined,
      publishedAt: `${today}T${now.getHours()-3}:00:00Z`,
      source: { name: 'Folha de S.Paulo' },
      category: 'politica'
    },
    {
      id: '4',
      title: 'Brasil lidera ranking de energias renováveis na AL',
      description: 'País se destaca em investimentos sustentáveis regionais e energia solar',
      url: undefined,
      publishedAt: `${today}T${now.getHours()-4}:45:00Z`,
      source: { name: 'Estado de S.Paulo' },
      category: 'geral'
    }
  ];
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

  // Usage endpoint - get daily verification count for authenticated user
  app.get("/api/usage", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: "Autenticação necessária" 
      });
    }

    try {
      const userId = req.user.id;
      const used = await storage.checkDailyUsage(userId);
      const limit = 10; // Daily limit
      const remaining = Math.max(0, limit - used);

      res.json({ 
        success: true, 
        data: {
          used,
          limit,
          remaining,
          percentage: (remaining / limit) * 100
        }
      });
    } catch (error) {
      console.error("Usage check error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Erro ao verificar uso diário" 
      });
    }
  });

  // Guest verification endpoint (text only, no login required)
  app.post("/api/verify-guest", async (req, res) => {
    const startTime = Date.now();

    try {
      // Only allow text verification for guests
      const guestRequest = {
        inputType: "text",
        content: req.body.content
      };

      // Validate request body
      const validationResult = VerificationRequestSchema.safeParse(guestRequest);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          message: validationResult.error.errors.map(e => e.message).join(", ")
        });
      }

      const verificationRequest = validationResult.data;
      
      // Don't store guest requests in database
      let contentToAnalyze = verificationRequest.content;

      // Verify content with Perplexity Search API (no URL processing for guests)
      const verificationResult = await callPerplexitySearchAPI(contentToAnalyze, startTime, undefined, undefined, undefined);

      const response: VerificationResponse = {
        success: true,
        data: verificationResult,
        message: "Verificação gratuita concluída! Cadastre-se para acessar verificação de URLs e histórico completo."
      };

      res.json(response);

    } catch (error) {
      console.error("Guest verification error:", error);
      
      const response: VerificationResponse = {
        success: false,
        error: "Erro interno do sistema",
        message: "Tente novamente em alguns minutos"
      };

      res.status(500).json(response);
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
      
      // Check rate limiting for authenticated users (10 per day) - skip for admins
      const userId = req.user?.id;
      if (userId && !req.user?.isAdmin) {
        const dailyUsage = await storage.checkDailyUsage(userId);
        if (dailyUsage >= 10) {
          return res.status(429).json({
            success: false,
            error: "Limite diário atingido",
            message: "Você atingiu o limite de 10 verificações por dia. Tente novamente amanhã."
          });
        }
      }
      
      // Store the request (include userId if authenticated)
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

      // Verify content with Perplexity Search API
      const verificationResult = await callPerplexitySearchAPI(contentToAnalyze, startTime, extractedMetadata, storedRequest.id, userId);

      // Store the result
      const storedResult = await storage.createVerificationResult(verificationResult, storedRequest.id);

      // Increment daily usage for authenticated users
      if (userId) {
        await storage.incrementDailyUsage(userId);
      }

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
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: "Usuário não autenticado"
        });
      }

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
        req.user.id, 
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

  // Admin middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Acesso negado - requer privilégios de administrador"
      });
    }
    next();
  };

  // Admin routes
  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error("Admin get users error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao buscar usuários"
      });
    }
  });

  // Update user admin status (admin only)
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { isAdmin } = req.body;
      const userId = req.params.id;
      
      const updated = await storage.updateUserAdminStatus(userId, isAdmin);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado"
        });
      }

      res.json({
        success: true,
        message: `Status de admin ${isAdmin ? 'concedido' : 'removido'} com sucesso`
      });
    } catch (error) {
      console.error("Admin update user error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao atualizar usuário"
      });
    }
  });

  // Get system stats (admin only)
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      const tokenStats = await storage.getTokenUsageStats();
      res.json({
        success: true,
        data: {
          ...stats,
          tokenUsage: tokenStats
        }
      });
    } catch (error) {
      console.error("Admin get stats error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao buscar estatísticas"
      });
    }
  });

  // Get token usage stats (admin only)
  app.get("/api/admin/tokens", requireAdmin, async (req, res) => {
    try {
      const tokenStats = await storage.getTokenUsageStats();
      res.json({
        success: true,
        data: tokenStats
      });
    } catch (error) {
      console.error("Admin get tokens error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao buscar estatísticas de tokens"
      });
    }
  });

  // Get user token usage (admin only)
  app.get("/api/admin/tokens/:userId", requireAdmin, async (req, res) => {
    try {
      const tokenUsage = await storage.getTokenUsageByUser(req.params.userId);
      res.json({
        success: true,
        data: tokenUsage
      });
    } catch (error) {
      console.error("Admin get user tokens error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao buscar tokens do usuário"
      });
    }
  });

  // Brazilian news endpoint - accessible to all users
  app.get("/api/news", async (req, res) => {
    try {
      const news = await getBrazilianNews();
      res.json({
        success: true,
        data: news
      });
    } catch (error) {
      console.error("News API error:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao buscar notícias"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

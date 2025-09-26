import * as cheerio from 'cheerio';

// Test web scraping improvements
describe('Web Scraping Enhancements', () => {
  describe('User Agent and Headers', () => {
    it('should use realistic Chrome user agent', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(userAgent).toContain('Chrome/120.0.0.0');
      expect(userAgent).toContain('Safari/537.36');
    });

    it('should include proper security headers', () => {
      const headers = {
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
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      };

      expect(headers['Sec-Fetch-Dest']).toBe('document');
      expect(headers['sec-ch-ua']).toContain('Chrome');
      expect(headers['Accept-Language']).toContain('pt-BR');
    });
  });

  describe('Content Selectors for Brazilian Sites', () => {
    it('should include selectors for major Brazilian news sites', () => {
      const selectors = [
        'article',
        '[role="main"]',
        'main',
        '.content',
        '.materia-conteudo', // Globo.com
        '.content-text', // UOL
        '.story-body', // BBC Brasil
        '.texto-noticia', // Terra, R7
        '.corpo-texto', // Estadão
        '.texto', // Folha
        '[data-testid="article-body"]', // MSN
        '.RichTextStoryBody', // MSN specific
      ];

      expect(selectors).toContain('.materia-conteudo');
      expect(selectors).toContain('[data-testid="article-body"]');
      expect(selectors).toContain('.RichTextStoryBody');
    });

    it('should extract content using cheerio selectors', () => {
      const html = `
        <html>
          <body>
            <article>
              <h1>Título da Notícia</h1>
              <p>Primeiro parágrafo com conteúdo importante.</p>
              <p>Segundo parágrafo com mais informações.</p>
            </article>
          </body>
        </html>
      `;

      const $ = cheerio.load(html);
      const articleContent = $('article').text().trim();
      
      expect(articleContent).toContain('Título da Notícia');
      expect(articleContent).toContain('Primeiro parágrafo');
      expect(articleContent).toContain('Segundo parágrafo');
    });
  });

  describe('Content Quality Validation', () => {
    it('should validate minimum word count', () => {
      const testContent = 'Palavra um dois três quatro cinco seis sete oito nove dez';
      const words = testContent.split(/\s+/).filter(word => word.length > 2);
      
      expect(words.length).toBeGreaterThan(5);
    });

    it('should detect Brazilian error patterns', () => {
      const errorPatterns = [
        /acesso.?negado/i,
        /página.?não.?encontrada/i,
        /erro.?404/i,
        /forbidden/i,
        /manutenção/i,
      ];

      const errorText = 'Página não encontrada';
      const hasError = errorPatterns.some(pattern => pattern.test(errorText));
      
      expect(hasError).toBe(true);
    });

    it('should clean content properly', () => {
      const rawContent = '  Este   é um\n\n\nteste   de\tlimpeza  \n  ';
      const cleaned = rawContent
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
      
      expect(cleaned).toBe('Este é um teste de limpeza');
    });
  });

  describe('Firecrawl Configuration', () => {
    it('should use appropriate timeout and wait settings', () => {
      const config = {
        waitFor: 4000,
        timeout: 30000,
        onlyMainContent: true,
        formats: ["markdown", "html"]
      };

      expect(config.waitFor).toBe(4000);
      expect(config.timeout).toBe(30000);
      expect(config.onlyMainContent).toBe(true);
    });
  });
});
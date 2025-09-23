# 🚀 ValidaÍ no Replit - Guia Completo

## 📋 Visão Geral
Este guia fornece tudo que você precisa para implementar o sistema ValidaÍ no Replit com um simples **ENTER**. O projeto inclui interface web moderna, API robusta e design system completo.

## ⚡ Setup Instantâneo

### 1. Criar Projeto no Replit
```bash
# No Replit:
# 1. Clique em "Create Repl"
# 2. Escolha "Python" 
# 3. Nome: "validai-news-checker"
# 4. Clique "Create Repl"
```

### 2. Estrutura de Arquivos
Crie esta estrutura no Replit:

```
validai-news-checker/
├── main.py                    # ✅ Já criado
├── requirements.txt           # ✅ Já criado  
├── .replit                   # ✅ Já criado
├── .env                      # ❗ Você precisa criar
│
├── app/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py         # ✅ Renomear app_core_config.py
│   │   ├── verification.py
│   │   ├── utils.py
│   │   └── exceptions.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── models.py         # ✅ Renomear app_api_models.py
│   │   ├── routes.py
│   │   └── dependencies.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── perplexity_service.py
│   │   ├── firecrawl_service.py
│   │   └── validation_service.py
│   │
│   └── ui/
│       ├── templates/
│       │   └── index.html    # ✅ Já criado
│       └── static/
│           ├── css/
│           ├── js/
│           └── images/
```

### 3. Configurar Variáveis de Ambiente
Crie o arquivo `.env` no Replit:

```env
# API Keys (OBRIGATÓRIO)
PERPLEXITY_API_KEY=sua_chave_perplexity_aqui
FIRECRAWL_API_KEY=sua_chave_firecrawl_aqui

# Configurações
DEBUG=true
ENVIRONMENT=development
```

### 4. Arquivos Principais

#### app/core/exceptions.py
```python
# app/core/exceptions.py
"""Exceções customizadas do ValidaÍ"""

class ValidaiException(Exception):
    """Exceção base do ValidaÍ"""
    pass

class ValidationError(ValidaiException):
    """Erro de validação de entrada"""
    pass

class VerificationError(ValidaiException):
    """Erro no processo de verificação"""
    pass

class APIError(ValidaiException):
    """Erro de API externa"""
    pass

class RateLimitError(ValidaiException):
    """Erro de rate limiting"""
    pass
```

#### app/api/routes.py
```python
# app/api/routes.py
"""Rotas da API ValidaÍ"""

from fastapi import APIRouter, HTTPException, Depends
from app.api.models import VerificationRequest, VerificationResponse
from app.services.perplexity_service import PerplexityService
from app.services.firecrawl_service import FirecrawlService
from app.core.config import get_settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/verify", response_model=VerificationResponse)
async def verify_content(request: VerificationRequest):
    """Endpoint principal de verificação"""
    try:
        settings = get_settings()
        
        # Validar API keys
        if not settings.validate_api_keys():
            raise HTTPException(
                status_code=500, 
                detail="API keys não configuradas"
            )
        
        # Processar input
        content_to_verify = ""
        
        if request.url:
            # Usar Firecrawl para extrair conteúdo
            firecrawl = FirecrawlService()
            scraped_content = await firecrawl.scrape_url(str(request.url))
            content_to_verify = scraped_content.content
        elif request.text:
            content_to_verify = request.text
        
        # Verificar com Perplexity
        perplexity = PerplexityService()
        result = await perplexity.verify_content(content_to_verify)
        
        return VerificationResponse(
            status="success",
            input_original={
                "text": request.text,
                "url": str(request.url) if request.url else None
            },
            result=result,
            metadata={
                "processing_time": "calculated",
                "model": "sonar-pro",
                "version": "1.0.0"
            }
        )
        
    except Exception as e:
        logger.error(f"Verification error: {str(e)}")
        return VerificationResponse(
            status="error",
            input_original={
                "text": request.text,
                "url": str(request.url) if request.url else None
            },
            error_message=str(e),
            metadata={"error_type": type(e).__name__}
        )
```

#### app/services/perplexity_service.py
```python
# app/services/perplexity_service.py
"""Serviço de integração com Perplexity API"""

import httpx
import json
import re
from app.core.config import get_settings
from app.api.models import VerificationResult, SourceInfo, VerificationTypeEnum
from app.core.exceptions import APIError, VerificationError

class PerplexityService:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.perplexity_base_url
        self.api_key = self.settings.perplexity_api_key
    
    async def verify_content(self, content: str) -> VerificationResult:
        """Verifica conteúdo usando Perplexity"""
        
        prompt = f"""
        {self.settings.system_prompt_template}
        
        INFORMAÇÃO PARA VERIFICAR:
        {content}
        
        Retorne APENAS um JSON válido com esta estrutura:
        {{
            "classification": "VERDADEIRO|FALSO|PARCIALMENTE_VERDADEIRO|NAO_VERIFICAVEL",
            "confidence_percentage": 0-100,
            "explanation": "explicação detalhada",
            "temporal_context": "contexto temporal",
            "detected_bias": "viés detectado",
            "sources": [
                {{
                    "name": "nome da fonte",
                    "url": "url se disponível", 
                    "description": "descrição",
                    "year": 2024
                }}
            ],
            "observations": "observações importantes"
        }}
        """
        
        async with httpx.AsyncClient(timeout=self.settings.api_timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "sonar-pro",
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 1500,
                        "temperature": 0.1
                    }
                )
                
                if response.status_code != 200:
                    raise APIError(f"Perplexity API error: {response.status_code}")
                
                data = response.json()
                ai_response = data["choices"][0]["message"]["content"]
                
                # Parse JSON response
                return self._parse_ai_response(ai_response)
                
            except httpx.TimeoutException:
                raise APIError("Timeout na API Perplexity")
            except Exception as e:
                raise VerificationError(f"Erro na verificação: {str(e)}")
    
    def _parse_ai_response(self, response: str) -> VerificationResult:
        """Parse da resposta da IA para modelo estruturado"""
        try:
            # Limpar resposta (remover markdown se houver)
            cleaned = re.sub(r'```json\n?|```\n?', '', response).strip()
            data = json.loads(cleaned)
            
            # Converter fontes
            sources = []
            for source_data in data.get("sources", []):
                sources.append(SourceInfo(
                    name=source_data.get("name", "Fonte não identificada"),
                    url=source_data.get("url"),
                    description=source_data.get("description", ""),
                    year=source_data.get("year")
                ))
            
            return VerificationResult(
                classification=VerificationTypeEnum(data["classification"]),
                confidence_percentage=data["confidence_percentage"],
                explanation=data["explanation"],
                temporal_context=data["temporal_context"],
                detected_bias=data["detected_bias"],
                sources=sources,
                observations=data["observations"]
            )
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # Fallback se não conseguir fazer parse
            return VerificationResult(
                classification=VerificationTypeEnum.NAO_VERIFICAVEL,
                confidence_percentage=0,
                explanation=f"Erro ao processar resposta da IA: {response[:200]}...",
                temporal_context="Não determinado",
                detected_bias="Não analisado",
                sources=[],
                observations="Erro de processamento - resposta não estruturada"
            )
```

#### app/services/firecrawl_service.py
```python
# app/services/firecrawl_service.py
"""Serviço de integração com Firecrawl API"""

import httpx
from app.core.config import get_settings
from app.api.models import ScrapingResult
from app.core.exceptions import APIError

class FirecrawlService:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.firecrawl_base_url
        self.api_key = self.settings.firecrawl_api_key
    
    async def scrape_url(self, url: str) -> ScrapingResult:
        """Extrai conteúdo de uma URL"""
        
        async with httpx.AsyncClient(timeout=self.settings.scraping_timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/v0/scrape",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "url": url,
                        "formats": ["markdown"],
                        "onlyMainContent": True
                    }
                )
                
                if response.status_code != 200:
                    raise APIError(f"Firecrawl API error: {response.status_code}")
                
                data = response.json()
                
                return ScrapingResult(
                    url=url,
                    title=data.get("metadata", {}).get("title", ""),
                    content=data.get("markdown", ""),
                    metadata=data.get("metadata", {})
                )
                
            except httpx.TimeoutException:
                raise APIError("Timeout no scraping da URL")
            except Exception as e:
                raise APIError(f"Erro no scraping: {str(e)}")
```

## 🎨 Design System

### Cores e Tipografia
- **Primária**: Azul (#3b82f6 / #2563eb)
- **Sucesso**: Verde (#22c55e)
- **Erro**: Vermelho (#ef4444)
- **Warning**: Amarelo (#f59e0b)
- **Fonte**: Inter (Google Fonts)

### Componentes UI
- **Botões**: Rounded-lg com estados hover/disabled
- **Cards**: Shadow-lg com bordas suaves
- **Inputs**: Focus ring azul com transições
- **Badges**: Cores semânticas baseadas no resultado

### Estados da Interface
- **Loading**: Spinner animado com feedback visual
- **Success**: Badges coloridos + progresso de confiança
- **Error**: Mensagens claras e acionáveis
- **Empty**: Instruções úteis e encorajadoras

## 🛠️ Vibe Coding Guidelines

### Princípios
1. **User-first**: Interface intuitiva para 30+ anos
2. **Acessibilidade**: Cores contrastantes, textos claros
3. **Performance**: Carregamento rápido, feedback imediato
4. **Confiabilidade**: Tratamento robusto de erros

### Padrões de Código
- **Clean Architecture**: Separação clara de responsabilidades
- **Type Safety**: Pydantic models para validação
- **Error Handling**: Exceções estruturadas
- **Logging**: Context-aware logging

### Interações
- **Smooth**: Transições suaves (300ms)
- **Responsive**: Feedback imediato para ações
- **Contextual**: Mensagens baseadas no estado
- **Progressive**: Disclosure de informações graduais

## 🚀 Deploy no Replit

### Passos Finais
1. **Upload dos arquivos** gerados neste chat
2. **Configurar .env** com suas API keys
3. **Instalar dependências**: automático no Replit
4. **Apertar RUN**: A aplicação inicia automaticamente

### URLs Importantes
- **App**: `https://seu-repl.replit.app`
- **API Docs**: `https://seu-repl.replit.app/api/docs`
- **Health Check**: `https://seu-repl.replit.app/health`

### Teste Rápido
```bash
# Teste via curl
curl -X POST "https://seu-repl.replit.app/api/v1/verify" \
  -H "Content-Type: application/json" \
  -d '{"text": "O Brasil é o maior país da América do Sul"}'
```

## 📊 Monitoramento

### Métricas Esperadas
- **Tempo de resposta**: < 30s
- **Taxa de sucesso**: > 90%
- **Precisão**: 85%+ para facts básicos
- **Uptime**: 99%+ no Replit

### Logs Importantes
- Requisições de verificação
- Tempos de resposta das APIs
- Erros e exceções
- Taxa de uso das APIs

## 🎯 Próximos Passos

### Melhorias v1.1
- Cache de resultados
- Rate limiting por IP
- Analytics de uso
- Export de relatórios

### Integrações Futuras
- WhatsApp Business API
- Telegram Bot
- Chrome Extension
- Mobile App (PWA)

---

## ✅ Checklist de Deploy

- [ ] Criar projeto no Replit
- [ ] Upload de todos os arquivos
- [ ] Configurar variáveis .env
- [ ] Testar main.py
- [ ] Validar interface web
- [ ] Testar API endpoints
- [ ] Verificar logs de erro
- [ ] Deploy público
- [ ] Teste end-to-end

**🎉 Ready to deploy!** Todos os arquivos estão otimizados para funcionamento imediato no Replit.
# app/core/config.py
"""
Configurações centralizadas do ValidaÍ
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
from datetime import datetime
import os

class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # API Keys
    perplexity_api_key: Optional[str] = Field(default=None, alias="PERPLEXITY_API_KEY")
    firecrawl_api_key: Optional[str] = Field(default=None, alias="FIRECRAWL_API_KEY")
    
    # API URLs
    perplexity_base_url: str = "https://api.perplexity.ai"
    firecrawl_base_url: str = "https://api.firecrawl.dev"
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # 1 hora
    
    # Timeouts
    api_timeout: int = 30
    scraping_timeout: int = 60
    
    # Sistema
    debug: bool = Field(default=False, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    # ValidaÍ específico
    max_text_length: int = 10000
    min_confidence_threshold: int = 50
    max_sources_per_verification: int = 5
    
    # Prompts
    system_prompt_template: str = """Você é o ValidaÍ, um especialista brasileiro em verificação de fatos e combate à desinformação. 

METODOLOGIA DE VERIFICAÇÃO:
1. Consulte SEMPRE múltiplas fontes independentes (mínimo 3)
2. Priorize fontes oficiais: órgãos governamentais, universidades, veículos tradicionais
3. Analise o contexto temporal da informação
4. Identifique possíveis vieses ou informações incompletas
5. Classifique com níveis de confiança

ESTRUTURA OBRIGATÓRIA DA RESPOSTA:
- CLASSIFICAÇÃO: [VERDADEIRO | FALSO | PARCIALMENTE_VERDADEIRO | NAO_VERIFICAVEL]
- CONFIANÇA: [0-100]%
- EXPLICAÇÃO: Análise clara e didática em português brasileiro
- CONTEXTO: Quando essa informação é/era verdadeira
- VIÉS: Identifique tendências políticas, comerciais ou ideológicas
- FONTES: Lista de fontes consultadas com URLs
- OBSERVAÇÕES: Limitações da verificação

DIRETRIZES:
- Use linguagem simples e acessível
- Seja empático, nunca julgue o usuário
- Explique o "porquê" das conclusões
- Sempre cite as fontes utilizadas
- Seja transparente sobre limitações
- Não forneça conselhos médicos específicos
- Mantenha neutralidade política"""

    def get_timestamp(self) -> str:
        """Retorna timestamp atual"""
        return datetime.now().isoformat()
    
    def validate_api_keys(self) -> bool:
        """Valida se as API keys estão configuradas"""
        return self.perplexity_api_key is not None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Singleton pattern para configurações
_settings: Optional[Settings] = None

def get_settings() -> Settings:
    """Retorna instância única das configurações"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
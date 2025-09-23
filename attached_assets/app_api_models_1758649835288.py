# app/api/models.py
"""
Modelos Pydantic para ValidaÍ
"""

from pydantic import BaseModel, Field, HttpUrl, validator
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum

class VerificationTypeEnum(str, Enum):
    """Tipos de classificação da verificação"""
    VERDADEIRO = "VERDADEIRO"
    FALSO = "FALSO" 
    PARCIALMENTE_VERDADEIRO = "PARCIALMENTE_VERDADEIRO"
    NAO_VERIFICAVEL = "NAO_VERIFICAVEL"

class ConfidenceLevelEnum(str, Enum):
    """Níveis de confiança"""
    ALTO = "ALTO"
    MEDIO = "MEDIO"
    BAIXO = "BAIXO"

class VerificationRequest(BaseModel):
    """Modelo para requisições de verificação"""
    text: Optional[str] = Field(None, description="Texto da notícia para verificar")
    url: Optional[HttpUrl] = Field(None, description="URL da notícia para verificar")
    
    @validator('text')
    def validate_text_length(cls, v):
        if v and len(v) > 10000:
            raise ValueError("Texto muito longo. Máximo 10.000 caracteres.")
        return v
    
    @validator('url', 'text')
    def validate_at_least_one(cls, v, values):
        if not v and not values.get('text'):
            raise ValueError("Forneça pelo menos um texto ou URL para verificar")
        return v

class SourceInfo(BaseModel):
    """Informações sobre uma fonte"""
    name: str = Field(..., description="Nome da fonte")
    url: Optional[str] = Field(None, description="URL da fonte")
    year: Optional[int] = Field(None, description="Ano da informação")
    description: str = Field(..., description="Breve descrição da fonte")
    reliability_score: Optional[int] = Field(None, ge=0, le=100, description="Score de confiabilidade")

class VerificationResult(BaseModel):
    """Resultado da verificação"""
    classification: VerificationTypeEnum = Field(..., description="Classificação da veracidade")
    confidence_percentage: int = Field(..., ge=0, le=100, description="Nível de confiança em porcentagem")
    confidence_level: ConfidenceLevelEnum = Field(..., description="Nível de confiança categórico")
    explanation: str = Field(..., description="Explicação detalhada da análise")
    temporal_context: str = Field(..., description="Contexto temporal da informação")
    detected_bias: str = Field(..., description="Viés detectado na informação")
    sources: List[SourceInfo] = Field(..., description="Fontes consultadas na verificação")
    observations: str = Field(..., description="Observações e limitações da verificação")
    
    @validator('confidence_level', pre=True, always=True)
    def set_confidence_level(cls, v, values):
        """Define nível de confiança baseado na porcentagem"""
        confidence = values.get('confidence_percentage', 0)
        if confidence >= 80:
            return ConfidenceLevelEnum.ALTO
        elif confidence >= 60:
            return ConfidenceLevelEnum.MEDIO
        else:
            return ConfidenceLevelEnum.BAIXO

class VerificationResponse(BaseModel):
    """Resposta completa da verificação"""
    status: Literal["success", "error"] = Field(..., description="Status da operação")
    input_original: dict = Field(..., description="Input original da requisição")
    result: Optional[VerificationResult] = Field(None, description="Resultado da verificação")
    error_message: Optional[str] = Field(None, description="Mensagem de erro, se houver")
    metadata: dict = Field(..., description="Metadados da operação")
    processed_at: datetime = Field(default_factory=datetime.now, description="Timestamp do processamento")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ScrapingResult(BaseModel):
    """Resultado do scraping de URL"""
    url: str = Field(..., description="URL original")
    title: Optional[str] = Field(None, description="Título da página")
    content: str = Field(..., description="Conteúdo extraído")
    metadata: dict = Field(default_factory=dict, description="Metadados da extração")
    scraped_at: datetime = Field(default_factory=datetime.now, description="Timestamp da extração")

class HealthCheckResponse(BaseModel):
    """Resposta do health check"""
    status: Literal["healthy", "unhealthy"] = Field(..., description="Status da aplicação")
    service: str = Field(default="ValidaÍ", description="Nome do serviço")
    version: str = Field(default="1.0.0", description="Versão da aplicação")
    timestamp: str = Field(..., description="Timestamp atual")
    api_keys_configured: bool = Field(..., description="Se as API keys estão configuradas")
    
class ErrorResponse(BaseModel):
    """Resposta de erro padronizada"""
    error: str = Field(..., description="Tipo do erro")
    message: str = Field(..., description="Mensagem do erro")
    status_code: int = Field(..., description="Código HTTP do erro")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp do erro")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
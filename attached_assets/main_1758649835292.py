# main.py - ValidaÍ FastAPI Application
"""
ValidaÍ - Sistema de Verificação de Notícias
Desenvolvido para PROEX IV - IA Aplicada - UniBrasil
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
import os
from contextlib import asynccontextmanager

from app.api.routes import router as api_router
from app.core.config import get_settings
from app.core.exceptions import ValidationError, VerificationError

# Configuração de inicialização
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação"""
    # Startup
    print("🚀 ValidaÍ iniciando...")
    print("📋 Carregando configurações...")
    
    yield
    
    # Shutdown  
    print("🛑 ValidaÍ finalizando...")

# Criação da aplicação FastAPI
app = FastAPI(
    title="ValidaÍ - Verificador de Notícias",
    description="Sistema inteligente para verificação de veracidade de notícias e informações",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configurações
settings = get_settings()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos
app.mount("/static", StaticFiles(directory="app/ui/static"), name="static")

# Templates
templates = Jinja2Templates(directory="app/ui/templates")

# Rotas da API
app.include_router(api_router, prefix="/api/v1")

# Handlers de exceção
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return {"error": "Erro de validação", "message": str(exc), "status_code": 400}

@app.exception_handler(VerificationError)
async def verification_exception_handler(request: Request, exc: VerificationError):
    return {"error": "Erro de verificação", "message": str(exc), "status_code": 500}

# Rota principal - Interface Web
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Página principal do ValidaÍ"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "title": "ValidaÍ - Verificador de Notícias",
        "description": "Verifique a veracidade de notícias e informações em tempo real"
    })

# Rota de health check
@app.get("/health")
async def health_check():
    """Health check da aplicação"""
    return {
        "status": "healthy",
        "service": "ValidaÍ",
        "version": "1.0.0",
        "timestamp": settings.get_timestamp()
    }

# Executar aplicação
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("REPLIT_ENVIRONMENT") != "production" else False
    )
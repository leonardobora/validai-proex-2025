# Vou criar um guia completo para implementar ValidaÍ no Replit
import json
from datetime import datetime

# Estrutura completa do projeto ValidaÍ para Replit
validai_replit_project = {
    "project_info": {
        "name": "ValidaÍ - News Verification System",
        "description": "Sistema de verificação de notícias usando FastAPI + Perplexity API",
        "created": datetime.now().isoformat(),
        "version": "1.0.0-replit",
        "stack": ["Python", "FastAPI", "Perplexity API", "Firecrawl", "TailwindCSS", "Alpine.js"]
    },
    
    "file_structure": {
        "root": {
            "main.py": "FastAPI application entry point",
            "requirements.txt": "Python dependencies",
            "pyproject.toml": "Project configuration",
            ".replit": "Replit configuration",
            "replit.nix": "Nix environment setup"
        },
        "app/": {
            "core/": {
                "config.py": "Application configuration",
                "verification.py": "Fact-checking engine",
                "utils.py": "Utility functions",
                "exceptions.py": "Custom exceptions"
            },
            "api/": {
                "routes.py": "API endpoints",
                "models.py": "Pydantic models",
                "dependencies.py": "FastAPI dependencies"
            },
            "services/": {
                "perplexity_service.py": "Perplexity API integration",
                "firecrawl_service.py": "Firecrawl integration",
                "validation_service.py": "Input validation"
            },
            "ui/": {
                "templates/": "HTML templates",
                "static/": {
                    "css/": "TailwindCSS styles",
                    "js/": "Alpine.js components",
                    "images/": "Assets"
                }
            }
        }
    },
    
    "design_system": {
        "colors": {
            "primary": {
                "50": "#f0f9ff",
                "500": "#3b82f6",
                "600": "#2563eb",
                "700": "#1d4ed8",
                "900": "#1e3a8a"
            },
            "success": {
                "50": "#f0fdf4",
                "500": "#22c55e",
                "600": "#16a34a"
            },
            "danger": {
                "50": "#fef2f2",
                "500": "#ef4444",
                "600": "#dc2626"
            },
            "warning": {
                "50": "#fffbeb",
                "500": "#f59e0b",
                "600": "#d97706"
            },
            "neutral": {
                "50": "#f9fafb",
                "100": "#f3f4f6",
                "200": "#e5e7eb",
                "500": "#6b7280",
                "700": "#374151",
                "900": "#111827"
            }
        },
        "typography": {
            "fonts": {
                "sans": ["Inter", "system-ui", "sans-serif"],
                "mono": ["JetBrains Mono", "monospace"]
            },
            "scales": {
                "xs": "0.75rem",
                "sm": "0.875rem",
                "base": "1rem",
                "lg": "1.125rem",
                "xl": "1.25rem",
                "2xl": "1.5rem",
                "3xl": "1.875rem"
            }
        },
        "spacing": {
            "xs": "0.5rem",
            "sm": "1rem",
            "md": "1.5rem",
            "lg": "2rem",
            "xl": "3rem",
            "2xl": "4rem"
        },
        "components": {
            "button": {
                "primary": "bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",
                "secondary": "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium py-2 px-4 rounded-lg transition-colors",
                "danger": "bg-danger-600 hover:bg-danger-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            },
            "input": {
                "base": "w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                "textarea": "w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-32 resize-y"
            },
            "card": {
                "base": "bg-white rounded-xl shadow-sm border border-neutral-100 p-6",
                "result": "bg-white rounded-xl shadow-lg border border-neutral-200 p-6 space-y-4"
            },
            "badge": {
                "verdadeiro": "bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm font-medium",
                "falso": "bg-danger-100 text-danger-800 px-3 py-1 rounded-full text-sm font-medium",
                "parcial": "bg-warning-100 text-warning-800 px-3 py-1 rounded-full text-sm font-medium",
                "nao_verificavel": "bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full text-sm font-medium"
            }
        }
    },
    
    "coding_patterns": {
        "architecture": "Clean Architecture + FastAPI patterns",
        "validation": "Pydantic models for all data",
        "error_handling": "Structured exceptions with user-friendly messages",
        "logging": "Structured logging with context",
        "testing": "pytest with coverage",
        "security": "API rate limiting + input sanitization"
    },
    
    "vibe_coding_guidelines": {
        "style": "Modern, clean, minimal aesthetic",
        "approach": "User-first, accessibility-focused",
        "tone": "Professional but approachable",
        "interactions": "Smooth, responsive, intuitive",
        "feedback": "Clear, immediate, contextual",
        "loading_states": "Engaging with progress indicators",
        "empty_states": "Helpful and encouraging",
        "error_states": "Constructive and actionable"
    }
}

# Salvar configuração completa
with open('validai_replit_project_guide.json', 'w', encoding='utf-8') as f:
    json.dump(validai_replit_project, f, indent=2, ensure_ascii=False)

print("🚀 VALIDAÍ REPLIT PROJECT - GUIDE COMPLETO")
print("=" * 55)

print("\n📁 ESTRUTURA DO PROJETO:")
for folder, content in validai_replit_project["file_structure"].items():
    print(f"\n{folder}:")
    if isinstance(content, dict):
        for subfolder, description in content.items():
            if isinstance(description, dict):
                print(f"  📂 {subfolder}/")
                for file, desc in description.items():
                    print(f"    📄 {file} - {desc}")
            else:
                print(f"  📄 {subfolder} - {description}")

print("\n🎨 DESIGN SYSTEM:")
print("Cores principais definidas para:")
for category in validai_replit_project["design_system"]["colors"].keys():
    print(f"  • {category}")

print("\n💻 CODING PATTERNS:")
for pattern, description in validai_replit_project["coding_patterns"].items():
    print(f"  • {pattern}: {description}")

print("\n✨ VIBE CODING:")
for aspect, description in validai_replit_project["vibe_coding_guidelines"].items():
    print(f"  • {aspect}: {description}")

print("\n🎯 NEXT: Gerando arquivos prontos para Replit...")
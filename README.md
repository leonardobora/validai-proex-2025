# ValidaÍ — Agente de IA para Verificação de Notícias

> **PROEX IV — IA Aplicada | UniBrasil | 8º período**

ValidaÍ é um agente conversacional inteligente que democratiza o acesso à verificação de notícias, combatendo a desinformação através de uma interface acessível e transparente.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Contexto Acadêmico](#contexto-acadêmico)
- [Impacto Social](#impacto-social)
- [Arquitetura Tecnológica](#arquitetura-tecnológica)
- [Funcionalidades](#funcionalidades)
- [Como Usar](#como-usar)
- [Exemplos Práticos](#exemplos-práticos)
- [Instalação e Deploy](#instalação-e-deploy)
- [Roadmap](#roadmap)
- [Equipe](#equipe)
- [Publicação Científica](#publicação-científica)
- [Licença e Ética](#licença-e-ética)

## 🎯 Sobre o Projeto

O **ValidaÍ** é um sistema inteligente de verificação de notícias que opera principalmente via WhatsApp, permitindo que usuários — especialmente da população brasileira acima de 30 anos e de baixa literacia digital — verifiquem a veracidade de informações em tempo real, sem necessidade de instalar aplicativos adicionais.

### Proposta Central

A solução prioriza **facilidade de uso**, **acessibilidade** e **resposta rápida**, integrando múltiplas fontes oficiais e confiáveis (governamentais, acadêmicas, jornalísticas) através de APIs modernas como Perplexity, utilizando uma arquitetura escalável em Python/FastAPI, AWS Lambda/Fargate e bancos de dados DynamoDB/Firestore.

## 🎓 Contexto Acadêmico

Este projeto foi desenvolvido como parte do **PROEX IV — IA Aplicada** da **UniBrasil**, no 8º período do curso, representando a aplicação prática de conceitos avançados de Inteligência Artificial em um contexto social relevante.

### Objetivos Acadêmicos

- Implementar técnicas de processamento de linguagem natural para análise de conteúdo
- Desenvolver arquiteturas escaláveis para aplicações de IA em produção
- Aplicar princípios de UX/UI para populações com baixa literacia digital
- Integrar múltiplas APIs e fontes de dados de forma inteligente
- Implementar compliance com LGPD e boas práticas de privacidade

## 🌍 Impacto Social

### Combate às Fake News

O **objetivo central** do ValidaÍ é oferecer à sociedade uma ferramenta acessível, transparente e ética para o combate à desinformação e fake news, democratizando o acesso à verificação automatizada e colaborativa de fatos.

### Público-Alvo

- **População brasileira acima de 30 anos**
- **Usuários com baixa literacia digital**
- **Pessoas que dependem do WhatsApp como principal meio de comunicação**
- **Comunidades vulneráveis à desinformação**

### Princípios Éticos

- **Compliance à LGPD**: Minimização de dados e consentimento explícito
- **Transparência total**: Fontes sempre citadas e metodologia clara
- **Direito ao esquecimento**: Dados processados conforme regulamentação
- **Neutralidade política**: Análise imparcial baseada em fontes confiáveis
- **Acessibilidade**: Interface simples e linguagem clara

## 🏗️ Arquitetura Tecnológica

### Stack Principal

#### Backend (FastAPI/Python)
- **FastAPI**: Framework web assíncrono de alta performance
- **Python 3.11+**: Linguagem principal com suporte a IA/ML
- **Pydantic**: Validação de dados e serialização
- **AsyncIO**: Processamento assíncrono para alta concorrência

#### Orquestração e Integrações
- **N8N**: Automação de workflows e orquestração de tarefas
- **WhatsApp Business API**: Interface principal com usuários
- **Perplexity API**: Busca inteligente e análise de fontes
- **Firecrawl**: Extração de conteúdo web

#### Infraestrutura Cloud
- **AWS Lambda**: Execução serverless para picos de demanda
- **AWS Fargate**: Containers para serviços persistentes
- **DynamoDB**: Banco NoSQL para dados de alta velocidade
- **Firestore**: Backup e sincronização de dados
- **CloudWatch**: Monitoramento e logs centralizados

#### Interface Web (Complementar)
- **React + TypeScript**: Interface web moderna e responsiva
- **TailwindCSS**: Framework CSS utilitário
- **shadcn/ui**: Componentes acessíveis e consistentes
- **TanStack Query**: Gerenciamento de estado servidor

### Observabilidade e Monitoramento

- **OpenTelemetry**: Instrumentação distribuída
- **CloudWatch Metrics**: Métricas de performance e uso
- **Logs estruturados**: Rastreabilidade completa
- **Alertas automáticos**: Detecção proativa de problemas

## ⚡ Funcionalidades

### Core Features

- ✅ **Verificação via WhatsApp**: Interface principal para usuários
- ✅ **Análise de texto**: Verificação de conteúdo textual
- ✅ **Análise de URLs**: Extração e verificação de links
- ✅ **Múltiplas fontes**: Consulta simultânea a fontes confiáveis
- ✅ **Classificação inteligente**: Níveis de veracidade e confiança
- ✅ **Fontes transparentes**: Citação completa de referências

### Recursos Avançados

- 🔄 **Cache inteligente**: Respostas rápidas para conteúdo recorrente
- 📊 **Analytics de uso**: Métricas de adoção e engajamento
- 🛡️ **Rate limiting**: Proteção contra spam e abuso
- 🌐 **Multi-idioma**: Suporte futuro para espanhol e inglês
- 📱 **Interface web**: Painel complementar para usuários avançados

## 📱 Como Usar

### Via WhatsApp (Principal)

1. **Adicione o ValidaÍ**: `+55 (XX) XXXX-XXXX` *(em desenvolvimento)*
2. **Envie sua dúvida**: Texto ou link da notícia
3. **Receba a análise**: Classificação, fontes e explicação
4. **Compartilhe**: Informação verificada com segurança

### Via Interface Web

1. **Acesse**: https://valida-ai.replit.app/
2. **Cole o conteúdo**: Texto ou URL no campo de verificação
3. **Clique em Verificar**: Aguarde o processamento
4. **Analise o resultado**: Classificação detalhada com fontes

## 💬 Exemplos Práticos

### Exemplo 1: Verificação via WhatsApp

```
Usuário: "Oi ValidaÍ, é verdade que o governo vai confiscar a poupança?"

ValidaÍ: 🔍 VERIFICANDO...

🔴 CLASSIFICAÇÃO: FALSO
📊 CONFIANÇA: 92%

📝 EXPLICAÇÃO: Não há qualquer proposta ou projeto oficial para confisco de poupanças no Brasil. Esta informação é uma fake news recorrente que circula principalmente em períodos eleitorais.

📅 CONTEXTO: Boatos similares circularam em 2022 e foram desmentidos pelos órgãos oficiais.

⚖️ VIÉS: Conteúdo com viés político para gerar medo e desinformação.

📚 FONTES CONSULTADAS:
• Banco Central do Brasil (bcb.gov.br)
• Ministério da Economia (economia.gov.br)  
• Agência Lupa - Fact-checking

⚠️ OBSERVAÇÕES: Esta verificação se baseia na legislação atual. Sempre consulte fontes oficiais para informações sobre políticas públicas.
```

### Exemplo 2: Verificação de URL

```
Usuário: https://noticiaexemplo.com/nova-descoberta-covid

ValidaÍ: 🔍 ANALISANDO CONTEÚDO...

🟡 CLASSIFICAÇÃO: PARCIALMENTE_VERDADEIRO  
📊 CONFIANÇA: 78%

📝 EXPLICAÇÃO: A pesquisa mencionada existe e foi publicada, porém os resultados foram exagerados na manchete. O estudo ainda está em fase inicial.

📅 CONTEXTO: Estudo publicado em revista científica em dezembro/2024, mas ainda aguarda revisão por pares.

📚 FONTES CONSULTADAS:
• PubMed - Base científica internacional
• Fiocruz - Avaliação técnica
• Nature Medicine - Revista original

⚠️ OBSERVAÇÕES: Aguarde estudos complementares antes de considerar como definitivo.
```

## 🚀 Instalação e Deploy

### Deploy Rápido no Replit

1. **Fork do projeto**
   ```bash
   # Acesse: https://replit.com/@leonardobora/validai-proex-2025
   # Clique em "Fork" 
   ```

2. **Configure as variáveis**
   ```env
   PERPLEXITY_API_KEY=your_perplexity_key
   FIRECRAWL_API_KEY=your_firecrawl_key
   WHATSAPP_TOKEN=your_whatsapp_token
   ```

3. **Execute**
   ```bash
   python main.py
   ```

### Deploy em Produção (AWS)

1. **Preparação**
   ```bash
   git clone https://github.com/leonardobora/validai-proex-2025
   cd validai-proex-2025
   pip install -r requirements.txt
   ```

2. **Configuração Lambda**
   ```bash
   # Usar terraform ou AWS CDK (scripts em /deploy)
   terraform init
   terraform apply
   ```

3. **Configuração do N8N**
   ```bash
   # Import workflows from /n8n-workflows
   # Configure webhook endpoints
   ```

### Requisitos Mínimos

- **Python**: 3.11+
- **Memória**: 512MB (mínimo), 2GB (recomendado)
- **APIs**: Chaves válidas para Perplexity e Firecrawl
- **Rede**: HTTPS obrigatório para WhatsApp Business API

## 🗺️ Roadmap

### Fase 1: MVP (Atual)
- [x] Interface web funcional
- [x] Integração com Perplexity API
- [x] Extração de conteúdo web
- [x] Sistema de classificação
- [ ] Deploy em produção

### Fase 2: WhatsApp Integration
- [ ] Configuração WhatsApp Business API
- [ ] Bot conversacional completo
- [ ] Sistema de onboarding
- [ ] Métricas de uso

### Fase 3: Escala e Otimização
- [ ] Cache distribuído (Redis)
- [ ] Rate limiting inteligente
- [ ] A/B testing para respostas
- [ ] API pública para desenvolvedores

### Fase 4: Expansão
- [ ] Integração Telegram
- [ ] Extensão para navegadores
- [ ] App mobile (PWA)
- [ ] Suporte multi-idioma

### Fase 5: IA Avançada
- [ ] Modelo customizado de fact-checking
- [ ] Detecção de deepfakes
- [ ] Análise de sentiment em massa
- [ ] Predição de viral fake news

## 👥 Equipe

Leonardo Bora, João Soares, Luan Constancio, Matheus Leite

### Orientação Acadêmica
- 🎓 PROEX IV - IA Aplicada
- 🏛️ Centro Universitário UniBrasil

### Colaboradores
Contribuições são bem-vindas! Veja nosso [guia de contribuição](CONTRIBUTING.md).

## 📊 Métricas e Políticas

### Métricas de Qualidade
- **Tempo de resposta**: < 30 segundos (meta: < 15s)
- **Taxa de sucesso**: > 90% (meta: > 95%)
- **Precisão**: 85%+ para fatos básicos (meta: > 90%)
- **Uptime**: 99%+ (meta: 99.9%)

### Métricas de Impacto
- **Usuários ativos**: Meta de 10.000+ em 6 meses
- **Verificações/mês**: Meta de 100.000+ verificações
- **Taxa de compartilhamento**: Informações corretas > 60%
- **Redução de fake news**: Impacto mensurável em comunidades

### Políticas de Dados
- **Minimização**: Coletamos apenas dados essenciais
- **Consentimento**: Opt-in explícito para processamento
- **Transparência**: Usuários sabem quais dados coletamos
- **Segurança**: Criptografia end-to-end quando possível
- **Retenção**: Dados removidos conforme LGPD

## 📚 Publicação Científica

### Objetivo de Pesquisa

O projeto ValidaÍ nasceu como iniciativa acadêmica com o objetivo de gerar conhecimento científico aplicável ao combate da desinformação. O próximo passo é a **redação de um artigo científico** para disseminar:

- **Resultados obtidos**: Métricas de eficácia e precisão
- **Metodologia desenvolvida**: Processo de verificação automatizada
- **Impacto social**: Análise quantitativa e qualitativa do uso
- **Aprendizados técnicos**: Desafios de implementação e soluções

### Contribuição Científica Esperada

1. **Metodologia de fact-checking**: Processo replicável para outras implementações
2. **Análise de acessibilidade**: Como atingir populações de baixa literacia digital
3. **Métricas de impacto social**: Framework para medir eficácia anti-desinformação
4. **Arquitetura escalável**: Padrões para sistemas de IA social

### Conferências Alvo

- **SBSI**: Simpósio Brasileiro de Sistemas de Informação
- **ENIAC**: Encontro Nacional de Inteligência Artificial
- **WSCAD**: Workshop on Computer Architecture and High Performance Computing
- **Journals**: Revista Brasileira de Informática na Educação

## 🏛️ Compliance e Ética

### Conformidade LGPD

- ✅ **Base legal**: Interesse legítimo e consentimento
- ✅ **Minimização**: Apenas dados necessários
- ✅ **Finalidade específica**: Verificação de conteúdo
- ✅ **Transparência**: Política de privacidade clara
- ✅ **Direitos do titular**: Acesso, correção, exclusão

### Diretrizes Éticas

- **Imparcialidade**: Sem viés político ou ideológico
- **Transparência**: Metodologia e fontes sempre visíveis
- **Responsabilidade**: Limitações claramente comunicadas
- **Não discriminação**: Acesso igual independente de origem
- **Educação**: Ensinar a pensar criticamente, não apenas dar respostas

### Limitações Declaradas

- Não fornecemos conselhos médicos específicos
- Não substituímos consulta a especialistas
- Trabalhamos apenas com fontes públicas
- Análise limitada ao momento da consulta
- Português brasileiro como idioma principal

## 📄 Licença

Este projeto está licenciado sob [MIT License](LICENSE) - veja o arquivo LICENSE para detalhes.

### Uso Acadêmico e Comercial

- ✅ **Uso acadêmico**: Livre para pesquisa e educação
- ✅ **Contribuições**: Open source e colaborativo
- ⚖️ **Uso comercial**: Permitido com atribuição
- 📚 **Citação**: Solicitamos citação em trabalhos acadêmicos

---

## 🚀 Começando Agora

```bash
# Clone o repositório
git clone https://github.com/leonardobora/validai-proex-2025

# Entre na pasta
cd validai-proex-2025

# Configure o ambiente
cp .env.example .env
# Edite .env com suas API keys

# Execute o projeto
python main.py
```

Acesse `http://localhost:8000` e comece a verificar notícias!

---

<div align="center">

**ValidaÍ — Democratizando o acesso à informação confiável**

*Desenvolvido com ❤️ por [Leonardo Bora](https://github.com/leonardobora)*  
*PROEX IV — IA Aplicada — Centro Universitário UniBrasil*

[🌐 Website](https://validai.app) • [📱 WhatsApp](https://wa.me/validai) • [📧 Contato](mailto:contato@validai.app)

</div>

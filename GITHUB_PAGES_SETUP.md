# 🚀 Guia Completo: Configurar GitHub Pages para o ValidaÍ

## 📋 Visão Geral

Criei um site completo de apresentação acadêmica do ValidaÍ seguindo o modelo PROEX IV. O site está pronto na pasta `/docs` e só precisa ser publicado no GitHub Pages.

## ✅ O que foi criado

### Arquivos do GitHub Pages

```
docs/
├── index.html              # Página completa com toda documentação PROEX IV
├── assets/
│   ├── css/
│   │   └── style.css      # CSS profissional e responsivo
│   ├── js/
│   │   └── script.js      # Animações e interatividade
│   └── images/            # Pasta para screenshots (vazia por enquanto)
├── .nojekyll              # Configuração GitHub Pages
└── README.md              # Instruções da pasta docs
```

### Conteúdo da Página

O site segue exatamente o modelo do relatório PROEX IV com:

1. **Introdução**
   - Apresentação do projeto
   - Problema e objetivo
   - Público-alvo e escopo

2. **Justificativa**
   - Relevância do problema
   - Benefícios da solução
   - Diferencial (análise de viés político)

3. **Metodologia**
   - Metodologia de desenvolvimento
   - Tecnologias utilizadas (frontend, backend, IA)
   - Arquitetura do sistema

4. **Resultados**
   - Funcionalidades implementadas (com placeholders para screenshots)
   - Testes realizados
   - Análise dos resultados

5. **Considerações Finais**
   - Resumo dos resultados
   - Desafios enfrentados
   - Aprendizados
   - Limitações
   - Trabalhos futuros (Fase 2 e 3 para 2026)

6. **Referências**
   - 12 referências acadêmicas e técnicas

7. **Equipe**
   - Informações da UniBrasil
   - Desenvolvedores e orientador
   - Links do projeto

## 🎯 Como Publicar no GitHub Pages

### Passo 1: Verificar se o repositório está no GitHub

Se você ainda NÃO tem o repositório no GitHub:

```bash
# 1. Criar repositório no GitHub.com (via interface web)
# Nome sugerido: validai ou validai-unibrasil

# 2. Conectar com seu repositório local
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# 3. Fazer o primeiro push
git add .
git commit -m "Add GitHub Pages site"
git branch -M main
git push -u origin main
```

Se você JÁ TEM o repositório no GitHub:

```bash
# Apenas fazer push das novas mudanças
git add .
git commit -m "Add GitHub Pages documentation site"
git push origin main
```

### Passo 2: Habilitar GitHub Pages

#### Via Interface do GitHub (Recomendado)

1. Acesse seu repositório no GitHub
2. Clique em **Settings** (engrenagem no topo)
3. No menu lateral esquerdo, clique em **Pages** (seção "Code and automation")
4. Em **Source**:
   - **Branch:** selecione `main`
   - **Folder:** selecione `/docs`
5. Clique em **Save**
6. Aguarde 1-3 minutos
7. A URL do seu site aparecerá no topo da página: `https://SEU_USUARIO.github.io/NOME_DO_REPO/`

#### Via GitHub CLI (Alternativa)

Se você tem o GitHub CLI instalado:

```bash
gh repo edit --enable-pages --pages-branch main --pages-path /docs
```

### Passo 3: Acessar o Site

Após 1-3 minutos, seu site estará disponível em:

```
https://SEU_USUARIO.github.io/NOME_DO_REPO/
```

Exemplos:
- Se seu usuário é `joaosilva` e repo é `validai`:
  → `https://joaosilva.github.io/validai/`
  
- Se seu usuário é `unibrasil-team` e repo é `validai-proex`:
  → `https://unibrasil-team.github.io/validai-proex/`

## 🎨 Personalizações Opcionais

### Adicionar Screenshots do Sistema

1. **Capture screenshots da aplicação:**
   - Tela de login
   - Interface de verificação
   - Resultados com viés político
   - Gráfico de distribuição
   - Histórico de verificações

2. **Salve as imagens em `docs/assets/images/`:**
   ```bash
   docs/assets/images/
   ├── login.png
   ├── verificacao.png
   ├── resultados.png
   ├── vies-politico.png
   └── historico.png
   ```

3. **Substitua os placeholders em `docs/index.html`:**
   
   Procure por seções como:
   ```html
   <div class="screenshot-placeholder">
       <p>📸 Captura de tela: Tela de login/registro</p>
   </div>
   ```
   
   Substitua por:
   ```html
   <div class="screenshot-container">
       <img src="assets/images/login.png" 
            alt="Tela de login do ValidaÍ" 
            style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
       <p style="text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">
           Figura 1: Tela de autenticação com validação segura
       </p>
   </div>
   ```

### Alterar Cores do Site

Edite `docs/assets/css/style.css` na seção `:root`:

```css
:root {
    /* Altere estas cores */
    --primary: #2563eb;        /* Azul principal */
    --secondary: #10b981;      /* Verde secundário */
    --accent: #f59e0b;         /* Amarelo destaque */
    /* ... */
}
```

### Adicionar Domínio Customizado

Se você tem um domínio próprio (ex: `validai.com.br`):

1. No GitHub Pages settings, adicione seu domínio em **Custom domain**
2. Configure os DNS records no seu provedor de domínio:
   ```
   Type: CNAME
   Name: www
   Value: SEU_USUARIO.github.io
   ```

## 🔍 Verificar Deploy

### Checar Status de Build

1. Vá em **Actions** no seu repositório GitHub
2. Veja o workflow "pages build and deployment"
3. Se houver erro, clique para ver detalhes

### Testar Localmente (Antes de Publicar)

```bash
# Inicie um servidor local
cd docs
python3 -m http.server 8000

# Acesse no navegador:
# http://localhost:8000
```

## 🐛 Troubleshooting

### Problema: Site não aparece após 5 minutos

**Solução:**
- Verifique se o branch está como `main` e folder como `/docs`
- Cheque em Actions se há erros de build
- Repositório precisa ser **público** (ou você precisa de GitHub Pro para privado)

### Problema: CSS/JS não carregam

**Solução:**
- Verifique que existe o arquivo `.nojekyll` em `/docs`
- Confira se os caminhos em `index.html` são relativos: `assets/css/style.css` (sem `/` inicial)

### Problema: 404 na página

**Solução:**
- Confirme que `index.html` está em `/docs` (não em subpasta)
- Aguarde alguns minutos para propagação

## 📊 Estatísticas do Site

- **Páginas:** 1 (index.html)
- **Seções:** 7 (Resumo, Introdução, Justificativa, Metodologia, Resultados, Considerações Finais, Referências, Equipe)
- **Tamanho:** ~85KB HTML + 20KB CSS + 2KB JS
- **Responsivo:** Sim (mobile, tablet, desktop)
- **Acessibilidade:** Contraste WCAG AA, semântica HTML5
- **Performance:** Otimizado (sem dependências externas pesadas)

## 🎓 Próximos Passos Sugeridos

1. ✅ **Publicar no GitHub Pages** (use este guia)
2. 📸 **Adicionar screenshots reais** do sistema
3. 🔗 **Compartilhar URL** com orientador e banca
4. 📄 **Exportar para PDF** (Ctrl+P → Salvar como PDF) para relatório impresso
5. 📊 **Adicionar Google Analytics** (opcional) para tracking

## 📞 Suporte

Se tiver dúvidas:
- **Documentação GitHub Pages:** https://docs.github.com/pages
- **Tutorial oficial:** https://pages.github.com/
- **GitHub Community:** https://github.com/orgs/community/discussions

---

## 🎉 Resultado Final

Após seguir este guia, você terá:

- ✅ Site profissional de apresentação do ValidaÍ
- ✅ Documentação completa seguindo PROEX IV
- ✅ URL pública para compartilhar com professores e banca
- ✅ Portfólio online do projeto acadêmico
- ✅ Material para apresentação do 8º ESBN 2025

**Link do site:** `https://SEU_USUARIO.github.io/NOME_DO_REPO/`

---

**ValidaÍ** - UniBrasil PROEX IV 2025 🇧🇷
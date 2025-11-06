# ValidaÍ - GitHub Pages

Este diretório contém a página de apresentação acadêmica do projeto ValidaÍ para GitHub Pages.

## 🚀 Como Habilitar GitHub Pages

### Opção 1: Via Interface do GitHub (Recomendado)

1. **Faça push deste repositório para o GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages documentation"
   git push origin main
   ```

2. **Configure o GitHub Pages:**
   - Acesse seu repositório no GitHub
   - Vá em **Settings** (Configurações)
   - No menu lateral, clique em **Pages** (na seção "Code and automation")
   - Em **Source**, selecione:
     - **Branch:** `main`
     - **Folder:** `/docs`
   - Clique em **Save**

3. **Aguarde a publicação:**
   - O GitHub levará 1-3 minutos para construir e publicar o site
   - Quando concluído, você verá a URL do seu site (exemplo: `https://seu-usuario.github.io/validai/`)
   - A URL ficará disponível no topo da página Settings → Pages

### Opção 2: Via GitHub CLI

Se você tem o GitHub CLI instalado:

```bash
# 1. Faça push do código
git add .
git commit -m "Add GitHub Pages documentation"
git push origin main

# 2. Configure GitHub Pages
gh repo edit --enable-pages --pages-branch main --pages-path /docs
```

## 📁 Estrutura de Arquivos

```
docs/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   └── style.css      # Estilos CSS
│   ├── js/
│   │   └── script.js      # JavaScript interativo
│   └── images/            # Imagens (adicione screenshots aqui)
├── .nojekyll              # Desabilita processamento Jekyll
└── README.md              # Este arquivo
```

## 🎨 Personalizações

### Adicionar Screenshots

1. Coloque suas capturas de tela na pasta `docs/assets/images/`
2. Edite `index.html` substituindo os placeholders de screenshot:
   ```html
   <div class="screenshot-placeholder">
       <img src="assets/images/sua-imagem.png" alt="Descrição">
   </div>
   ```

### Modificar Cores

Edite as variáveis CSS em `docs/assets/css/style.css`:

```css
:root {
    --primary: #2563eb;        /* Cor principal */
    --secondary: #10b981;      /* Cor secundária */
    /* ... */
}
```

## 🔗 Links Úteis

- **Documentação GitHub Pages:** https://docs.github.com/pages
- **Tutorial GitHub Pages:** https://pages.github.com/
- **Replit ↔ GitHub:** https://docs.replit.com/power-ups/github

## ✅ Verificação

Após habilitar, acesse:
- `https://SEU_USUARIO.github.io/NOME_DO_REPO/`

Substitua `SEU_USUARIO` e `NOME_DO_REPO` pelos valores do seu repositório.

## 📝 Notas

- O site é estático (HTML/CSS/JS puro)
- Atualizações automáticas a cada push no branch `main`
- Tempo de build: 1-3 minutos
- Arquivo `.nojekyll` previne processamento Jekyll

---

**ValidaÍ** - UniBrasil PROEX IV 2025
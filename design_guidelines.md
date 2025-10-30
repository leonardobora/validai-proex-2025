# ValidaÍ Design Guidelines

## Design Approach

**Hybrid Approach**: Material Design foundation with aggressive simplification for low digital literacy users. Drawing accessibility patterns from government services (gov.br) and senior-friendly apps, while incorporating Ground News' political spectrum visualization.

**Core Principles**: Maximum clarity, generous spacing, high contrast, single-purpose components, progressive disclosure of complexity.

## Typography System

**Font Family**: Roboto (Google Fonts CDN) - excellent legibility, wide language support
- Headlines: Roboto Bold, 28px-36px
- Subheadings: Roboto Medium, 20px-24px  
- Body: Roboto Regular, 18px-20px (larger than standard)
- Labels/Meta: Roboto Medium, 16px
- Buttons: Roboto Medium, 18px

**Key Rule**: Never go below 16px. All interactive elements use minimum 18px text.

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16 for generous breathing room
- Card padding: p-8
- Section spacing: mb-12, mt-16
- Element gaps: gap-6, gap-8
- Touch targets: minimum h-16

**Container Strategy**: 
- Mobile: px-4, max single column
- Desktop: max-w-4xl (narrower for readability), centered
- Cards: Always full-width on mobile, max 600px on desktop

## Component Library

### Verification Card (Primary Component)
Large, prominent cards with clear visual hierarchy:
- White background, subtle shadow, rounded corners (8px)
- Top section: Verification badge (VERDADEIRO/FALSO/PARCIALMENTE) as large pill with icon
- Headline: Bold, 24px, 2-line max with ellipsis
- Confidence meter: Wide horizontal bar with large percentage (80%)
- Political spectrum: Three-segment horizontal bar showing source distribution
- Metadata: Source names, date in lighter text
- Tap entire card for details

### Verification Badges
Distinctive, colorful pills that dominate visual hierarchy:
- Height: 48px minimum
- Full rounded (pill shape)
- Icons: Large checkmark (VERDADEIRO), X (FALSO), exclamation (PARCIALMENTE)
- Text: Bold, all caps, 18px
- Note: User specified colors (green/red/yellow), to be applied during implementation

### Political Spectrum Bar
Horizontal three-segment bar inspired by Ground News:
- Full width, 16px height
- Three equal sections representing Esquerda/Centro/Direita
- Segments fill based on source distribution
- Labels above or integrated
- Tooltips on tap explaining methodology
- Note: User specified neutral but distinct colors for political bias

### Confidence Meter
Bold, easy-to-parse visual:
- Wide horizontal progress bar, 12px height
- Large percentage number (32px) positioned prominently
- Label "Confiança da Verificação"
- High contrast fill

### Tooltips/Help
For education and clarity:
- Large tap targets (info icons, 48px minimum)
- Modal overlays (not tiny tooltips - hard for older users)
- Simple language, 2-3 sentences max
- Dismiss with clear X button or outside tap
- Used for explaining: confidence scores, political spectrum, verification process

### Navigation
Bottom navigation bar (mobile-first):
- 3 primary tabs: Início (feed), Sobre, Ajuda
- Large icons (32px), clear labels
- Fixed bottom position
- High contrast active state

### Detail Screen
When tapping verification card:
- Full-screen view
- Back button (top-left, large)
- Same badge/headline/confidence prominent at top
- Expanded political spectrum with source breakdown
- "O que isso significa?" explanation cards
- Full article text or summary
- Source links (clearly marked external)

### Empty States
For when no verifications match filters:
- Large friendly icon (128px)
- Clear message: "Nenhuma verificação encontrada"
- Suggestion: "Tente outra pesquisa"

### Loading States
Clear feedback for older users:
- Centered spinner with text "Carregando..."
- Never silent loading

## Images

**No hero image** - This is a utility app, not marketing. Immediately show verification cards.

**In-app imagery**:
- Icons for verification types (custom illustrations, simple, bold line style)
- Educational diagrams in "Sobre" section explaining how verification works
- Political spectrum visual guides
- All imagery should be decorative, not essential to understanding

## Accessibility Implementation

**Contrast**: Ensure WCAG AAA (7:1) throughout - particularly important given target audience
**Touch Targets**: All interactive elements minimum 48x48px
**Focus Indicators**: Thick (3px) visible borders on keyboard navigation
**Labels**: Every interactive element has clear aria-label
**Scaling**: Design supports up to 200% text zoom without breaking

## Screen Specifications

**Home Feed**:
- Header: App name, search icon (if applicable)
- Verification cards in vertical stack
- Gap-6 between cards
- Floating action button for "Como funciona?" (if needed)

**Verification Detail**:
- Full screen takeover
- Generous p-8 padding
- Clear sectioned layout (Verificação → Fontes → Explicação)
- Sticky verification badge at top on scroll

**Sobre/Educational Page**:
- Simple accordion sections or cards explaining
- Large illustrations showing verification process
- Step-by-step guide with numbered sections
- Contact/support prominent

This design prioritizes clarity and confidence for users who may be encountering fact-checking apps for the first time, with every element sized and positioned for maximum comprehension.
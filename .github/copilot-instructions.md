# ValidaÍ — AI Copilot Instructions

## Project Overview
ValidaÍ is a full-stack news verification system that combats misinformation through an AI-powered fact-checking API. The system targets Brazilian users 30+ with low digital literacy, operating primarily via WhatsApp integration and a complementary web interface.

## Architecture & Structure

### Monorepo Layout
- `client/` - React + TypeScript frontend with Vite
- `server/` - Express.js backend with TypeScript  
- `shared/` - Zod schemas and type definitions shared across frontend/backend
- `attached_assets/` - Contains legacy Python/FastAPI implementation files for reference

### Key Technology Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui, TanStack Query
- **Backend**: Express.js, TypeScript, Drizzle ORM, PostgreSQL (Neon DB)
- **External APIs**: Perplexity AI (fact-checking), Firecrawl (content extraction)
- **Testing**: Jest with ts-jest, @testing-library/react
- **Build**: Vite (client), esbuild (server bundling)

## Essential Development Patterns

### Shared Schema Architecture
All data structures are defined in `shared/schema.ts` using Zod. This creates a single source of truth:
```typescript
// API types are derived from Zod schemas
export const VerificationRequestSchema = z.object({...});
export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

// Database schemas use drizzle-zod integration
export const insertUserSchema = createInsertSchema(usersTable);
```

### API Request/Response Pattern
All API endpoints follow consistent patterns defined in `shared/schema.ts`:
- Request validation via Zod schemas 
- Standardized response structure: `{ success: boolean, data?: T, error?: string, message?: string }`
- Brazilian Portuguese error messages and classifications

### Brazilian Portuguese Classifications
The system uses PT-BR specific enums for fact-checking results:
- `"VERDADEIRO"` (True)
- `"FALSO"` (False) 
- `"PARCIALMENTE_VERDADEIRO"` (Partially True)
- `"NAO_VERIFICAVEL"` (Not Verifiable)

## Critical Development Workflows

### Environment Setup
```bash
# Essential environment variables
DATABASE_URL=postgresql://...          # Required for Drizzle ORM
PERPLEXITY_API_KEY=...               # Core AI fact-checking
FIRECRAWL_API_KEY=...                # Enhanced web scraping
```

### Development Commands
```bash
npm run dev        # Starts both client (Vite) and server (tsx)  
npm run build      # Builds client + bundles server with esbuild
npm run db:push    # Sync Drizzle schema to database
npm test           # Run Jest tests across client/server/shared
```

### Database Workflow with Drizzle
- Schema defined in `shared/schema.ts` using `drizzle-orm/pg-core`
- No migration files - uses `drizzle-kit push` for development
- Database connection through `@neondatabase/serverless` for Neon PostgreSQL

## Key Integration Points

### Perplexity AI Integration (`server/routes.ts`)
The core fact-checking logic uses a sophisticated prompt that:
- Instructs AI to return structured JSON responses matching Zod schemas
- Includes Brazilian context and Portuguese language requirements
- Incorporates metadata from web scraping (title, description, source URL)
- Handles fallback responses when AI returns malformed JSON

### Web Scraping Pipeline (`server/routes.ts`)
Dual-fallback content extraction:
1. **Primary**: Firecrawl API for clean markdown extraction
2. **Fallback**: Cheerio-based HTML parsing with BR news site selectors
3. **Caching**: In-memory cache (1 hour TTL) to avoid redundant scraping

### Authentication System (`server/auth.ts`)
- Passport.js + express-session with PostgreSQL store
- User context available via `req.user` in protected routes
- Authentication required for history endpoints (`/api/history`)

## Component & Testing Conventions

### UI Components
- Built on shadcn/ui + Radix primitives
- Consistent `data-testid` attributes for testing (e.g., `"button-verify-submit"`)
- Brazilian Portuguese labels and placeholders
- Emoji usage in UI for accessibility/visual clarity

### Testing Patterns
- Mock external dependencies in `__tests__` files
- API client tests mock the `queryClient.apiRequest` function
- Component tests use `@testing-library/react` with Jest DOM matchers
- Test files use `.test.ts` suffix, collocated with source files

## File Path Conventions

### Import Aliases (via `vite.config.ts`)
- `@/` → `client/src/` (frontend components, hooks, utilities)
- `@shared/` → `shared/` (schemas, types)
- `@assets/` → `attached_assets/` (legacy reference files)

### Component Organization
- `client/src/components/ui/` - shadcn/ui primitive components
- `client/src/components/` - Application-specific components
- `client/src/hooks/` - React custom hooks
- `client/src/lib/` - Utilities (api client, query client, utils)
- `client/src/pages/` - Route components

## Production Deployment Notes

### Build Process
- Client builds to `dist/public/` via Vite
- Server bundles to `dist/index.js` via esbuild with external packages
- Single port deployment (PORT env var, defaults to 5000)
- Static file serving in production mode

### Replit Integration
- Special Vite plugins for Replit environment (`@replit/vite-plugin-*`)
- Development banner and runtime error overlays in dev mode only
- Cartographer plugin for Replit-specific tooling integration

## Code Quality & Error Handling

### Error Patterns
- Comprehensive input validation using Zod schemas
- Portuguese error messages for user-facing errors
- Structured error responses with HTTP status codes
- Extensive logging for debugging external API issues

### Content Extraction Resilience
- Multi-method web scraping with intelligent fallbacks
- Brazilian news site specific CSS selectors (`.materia-conteudo`, `.content-text`)
- Content quality validation (word count, error pattern detection)
- Graceful handling of blocked/inaccessible URLs

When working on this project, prioritize maintaining the shared schema consistency, Brazilian Portuguese localization, and robust error handling throughout the fact-checking pipeline.
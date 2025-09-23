# ValidaÍ - News Verification System

## Overview

ValidaÍ is a full-stack web application designed for fact-checking and news verification. The system combines a modern React frontend with a robust Express.js backend to provide real-time analysis of news content and information. The application integrates with external APIs (Perplexity AI and Firecrawl) to perform comprehensive fact-checking using AI-powered analysis and web scraping capabilities.

The system allows users to submit either text content or URLs for verification, processes the information through AI analysis, and returns structured results with confidence levels, source citations, and detailed explanations. It's built with TypeScript throughout for type safety and includes a comprehensive UI component library based on shadcn/ui.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **UI Framework**: React with Vite for fast development and building
- **Styling**: TailwindCSS with a comprehensive design system using CSS custom properties
- **Component Library**: shadcn/ui components providing consistent, accessible UI elements
- **State Management**: TanStack Query for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation integration

The frontend uses a clean separation of concerns with dedicated directories for components, pages, hooks, and utilities. The design system supports both light and dark themes through CSS variables.

### Backend Architecture  
The backend follows a RESTful API design using Express.js:

- **Server Framework**: Express.js with TypeScript
- **API Integration**: Perplexity AI for fact-checking analysis and Firecrawl for web scraping
- **Data Storage**: In-memory storage with interfaces designed for easy database migration
- **Schema Validation**: Zod schemas shared between frontend and backend for type safety
- **Error Handling**: Centralized error handling with custom exception types

The backend implements a service-oriented architecture with clear separation between routes, storage, and external API integrations. The verification process includes content analysis, source validation, and confidence scoring.

### Database Design
Currently uses in-memory storage but is designed with database migration in mind:

- **Storage Interface**: Abstract storage interface supporting verification requests and results
- **Data Models**: Structured schemas for verification requests, results, sources, and analytics
- **ORM Ready**: Drizzle ORM configuration present for future PostgreSQL integration
- **Migration Support**: Database migration infrastructure already configured

### Authentication & Authorization
The current implementation doesn't include authentication, focusing on the core verification functionality. The architecture supports easy integration of authentication systems in the future.

## External Dependencies

### Third-Party APIs
- **Perplexity AI**: Primary fact-checking engine that analyzes content and provides verification results with confidence levels and source citations
- **Firecrawl**: Web scraping service for extracting content from URLs when users submit links for verification

### Database & Storage
- **PostgreSQL**: Configured via Drizzle ORM for future database integration (currently using in-memory storage)
- **Neon Database**: Serverless PostgreSQL provider integration ready via connection string

### Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework for styling
- **ESBuild**: Backend bundling for production builds

### UI & Component Libraries
- **Radix UI**: Headless UI primitives for accessibility and interaction patterns
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management and caching

### Validation & Forms
- **Zod**: Schema validation library used across frontend and backend
- **React Hook Form**: Form state management and validation
- **Drizzle Zod**: Integration between Drizzle ORM and Zod schemas

The system is designed to be easily deployable on platforms like Replit, with environment variable configuration for API keys and database connections.
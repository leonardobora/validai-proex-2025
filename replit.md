# ValidaÍ - News Verification System

## Overview

ValidaÍ is a full-stack web application designed for fact-checking and news verification, specifically targeting Brazilian adults 30+ with limited digital literacy. The system combines a modern React frontend with a robust Express.js backend to provide real-time analysis of news content and information. The application integrates with Perplexity AI Sonar API for AI-powered fact-checking analysis and includes innovative political bias visualization of news sources.

The system allows users to submit either text content or URLs for verification, processes the information through AI analysis, and returns structured results with confidence levels, source citations, detailed explanations, and a political spectrum analysis of sources (inspired by Ground News). Each source is automatically classified as Left/Center/Right based on a comprehensive database of Brazilian media outlets. It's built with TypeScript throughout for type safety and includes an accessible UI component library based on shadcn/ui.

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
- **API Integration**: Perplexity AI Sonar API (simplified from previous two-API approach) for fact-checking analysis with automatic source discovery
- **Political Bias Classification**: Custom Brazilian media bias database mapping 50+ media outlets (gov.br, edu.br, major news portals) to political spectrum (ESQUERDA/CENTRO/DIREITA)
- **Data Storage**: PostgreSQL database via Drizzle ORM with user authentication and verification history persistence
- **Schema Validation**: Zod schemas shared between frontend and backend for type safety
- **Error Handling**: Centralized error handling with custom exception types

The backend implements a service-oriented architecture with clear separation between routes, storage, and external API integrations. The verification process includes content analysis, source validation, confidence scoring, and automatic political bias classification of each source.

### Database Design
Uses PostgreSQL database for production-grade data persistence:

- **Storage Interface**: PostgreSQL via Drizzle ORM supporting verification requests, results, and user data
- **Data Models**: Structured schemas for users, verification requests, verification results with source bias tracking
- **User Isolation**: Each user has isolated verification history with proper authentication and authorization
- **Migration Support**: Database migrations handled via `npm run db:push` using Drizzle Kit

### Authentication & Authorization
Full authentication system implemented:

- **User Management**: Registration, login, logout with bcrypt password hashing
- **Session Management**: Express-session with PostgreSQL session store
- **Protected Routes**: Verification history and user-specific features require authentication
- **User Isolation**: Verifications are associated with user IDs for proper data separation

## External Dependencies

### Third-Party APIs
- **Perplexity AI Sonar API**: Single unified API for fact-checking that automatically discovers 5-8 relevant Brazilian sources during analysis, providing verification results with confidence levels and comprehensive source citations

### Political Bias Analysis
- **Brazilian Media Mapping**: Custom database of 50+ Brazilian media outlets with political bias classification
  - **Esquerda (Left)**: Brasil 247, Carta Capital, The Intercept Brasil, Brasil de Fato, etc.
  - **Centro (Center)**: G1, UOL, Folha, Estadão, BBC Brasil, all .gov.br and .edu.br domains
  - **Direita (Right)**: Gazeta do Povo, Jovem Pan, Veja, Revista Oeste, O Antagonista, etc.
- **Automatic Classification**: Each source returned by AI is automatically classified based on domain and outlet name
- **Bias Distribution**: Calculated percentages showing political spectrum of consulted sources
- **Ground News-Inspired Visualization**: Horizontal bar chart with color-coded segments (red/blue/yellow) showing source distribution

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
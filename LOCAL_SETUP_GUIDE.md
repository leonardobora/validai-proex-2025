# 🚀 ValidaÍ Local Development Setup Guide

## 📋 Prerequisites

### Required Software
```bash
# Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Git (for cloning)
git --version
```

### Required API Keys
- **Perplexity AI**: [Get API key](https://perplexity.ai) - **REQUIRED** for fact-checking
- **Firecrawl**: [Get API key](https://firecrawl.dev) - Optional but recommended for URL extraction
- **Database**: PostgreSQL instance (Neon DB, Supabase, or local)

---

## 🗄️ Database Setup Options

### Option 1: Neon DB (Recommended - Same as Replit)
1. Go to [neon.tech](https://neon.tech) and create free account
2. Create new project named "validai"
3. Copy connection string (looks like `postgresql://username:password@...neon.tech/database`)

### Option 2: Supabase (Alternative)
1. Go to [supabase.com](https://supabase.com) and create free account
2. Create new project
3. Go to Settings → Database → Connection string → URI
4. Copy the connection string

### Option 3: Local PostgreSQL (Advanced)
```bash
# Install PostgreSQL locally
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb validai_db

# Connection string will be:
# postgresql://your_username:your_password@localhost:5432/validai_db
```

---

## 🛠️ Project Setup

### 1. Clone and Install
```bash
# Navigate to your project directory
cd "c:\Users\leonardo.costa\OneDrive - Lightera, LLC\Ambiente de Trabalho\validai-2025\validai-proex-2025"

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
copy .env.example .env

# Edit .env file with your actual values
notepad .env
```

**Required .env variables:**
```env
DATABASE_URL=postgresql://your_connection_string_here
PERPLEXITY_API_KEY=your_perplexity_key_here
SESSION_SECRET=your_random_32_char_string_here
FIRECRAWL_API_KEY=your_firecrawl_key_here  # Optional
```

### 3. Database Setup
```bash
# Push schema to database (creates tables automatically)
npm run db:push
```

This command:
- ✅ Creates all tables (`users`, `verification_requests`, `verification_results`)
- ✅ Sets up foreign key relationships
- ✅ Configures session storage table
- ✅ No manual SQL needed!

---

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev
```

This will:
- 🎯 Start frontend on `http://localhost:5173` (Vite dev server)
- 🎯 Start backend on `http://localhost:5000` (Express server)
- 🔄 Enable hot reloading for both

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (during development)
npm run test:watch
```

---

## 🔍 Troubleshooting Common Issues

### ❌ "DATABASE_URL environment variable is required"
**Solution:** 
- Check `.env` file exists in project root
- Verify `DATABASE_URL` is set correctly
- Test connection string works

### ❌ "PERPLEXITY_API_KEY não configurada"
**Solution:**
- Get API key from [perplexity.ai](https://perplexity.ai)
- Add to `.env` file: `PERPLEXITY_API_KEY=your_key_here`

### ❌ Database connection fails
**Solution:**
```bash
# Test database connection
npm run db:push

# If fails, verify:
# 1. Database exists
# 2. Credentials are correct
# 3. Network access allowed (for cloud DBs)
```

### ❌ Port already in use
**Solution:**
```bash
# Change port in .env
PORT=3000

# Or find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

---

## 📊 Database Schema Overview

### Users Table
```sql
users (
  id varchar PRIMARY KEY,         -- Auto-generated UUID
  email varchar UNIQUE NOT NULL, -- Login email
  password_hash varchar NOT NULL,-- Bcrypt hashed password  
  name varchar NOT NULL,         -- Display name
  is_admin boolean DEFAULT false,-- Admin privileges
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
)
```

### Verification Requests Table
```sql
verification_requests (
  id varchar PRIMARY KEY,           -- Auto-generated UUID
  user_id varchar REFERENCES users(id), -- Optional user link
  input_type varchar NOT NULL,     -- 'text' or 'url'
  content text NOT NULL,          -- Text content or URL
  url varchar,                    -- Original URL if applicable
  created_at timestamp DEFAULT now()
)
```

### Verification Results Table
```sql
verification_results (
  id varchar PRIMARY KEY,
  request_id varchar REFERENCES verification_requests(id),
  classification varchar NOT NULL, -- 'VERDADEIRO', 'FALSO', etc.
  confidence_percentage integer,   -- 0-100
  confidence_level varchar,        -- 'ALTO', 'MEDIO', 'BAIXO'
  explanation text NOT NULL,       -- AI analysis explanation
  temporal_context text,           -- Time-based context
  detected_bias text,             -- Bias analysis
  sources jsonb NOT NULL,         -- Array of source objects
  observations text,              -- Additional notes
  processing_time_ms integer,     -- Performance metric
  created_at timestamp DEFAULT now()
)
```

---

## 🚀 Next Steps After Setup

### 1. Test Basic Functionality
- Visit `http://localhost:5173`
- Try text verification
- Try URL verification
- Check that results are saved

### 2. Create Admin User (Optional)
```bash
# Access the running app and register
# First user can be manually set as admin in database if needed
```

### 3. Monitor Database
- Use your database provider's dashboard
- Check table creation and data insertion
- Monitor query performance

### 4. Development Workflow
```bash
# Daily development
npm run dev          # Start development
npm run test:watch   # Run tests continuously
npm run db:push      # Update schema when needed
```

---

## 🔧 Key Commands Reference

```bash
# Development
npm run dev          # Start dev servers
npm run build        # Build for production  
npm run start        # Run production build
npm run check        # TypeScript type checking

# Database
npm run db:push      # Push schema changes to DB

# Testing  
npm test            # Run tests once
npm run test:watch  # Continuous testing
npm run test:coverage # Test with coverage report
```

---

## 💡 Important Notes

### Database Differences from Replit
- **Replit**: Likely used temporary/simple storage
- **Your Setup**: Full PostgreSQL with persistent data
- **Migration**: No data to migrate (fresh start)

### Schema Management
- Uses **Drizzle ORM** - no manual SQL needed
- **Push-based**: `npm run db:push` updates database
- **No migrations**: Schema changes applied directly (dev mode)

### Session Storage
- Sessions stored in PostgreSQL (not memory)
- Users stay logged in between server restarts
- Production-ready session handling

### Performance Considerations
- **Local**: Instant database access
- **Cloud DB**: Small network latency (~50-100ms)
- **Caching**: Verification results cached in-memory (1 hour)

This setup gives you a robust, production-ready local development environment that matches modern web application standards!